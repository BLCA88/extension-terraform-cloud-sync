import * as vscode from "vscode";
import {
  getRunsForWorkspace,
  applyRun,
  getPlanDetails,
  getGitInfoFromRun,
} from "../services/run-details.service.js";
import { renderHandlebarsTemplate } from "../utils/renderHandlebarsTemplate.js";
import { translate } from "../utils/i18n.js";
import { getProviderImage } from "../utils/providersImages.js";

function findBlockingRun(runs) {
  const blockingStates = ["planning", "planned", "confirmed"];
  return runs.find((r) => blockingStates.includes(r.attributes.status));
}

export class RunDetailsPanel {
  constructor(
    workspaceId,
    workspaceName,
    token,
    organization,
    extensionUri,
    runId
  ) {
    this.workspaceId = workspaceId;
    this.workspaceName = workspaceName;
    this.token = token;
    this.organization = organization;
    this.extensionUri = extensionUri;
    this.runId = runId;

    this.panel = vscode.window.createWebviewPanel(
      "runDetailView",
      `Detalles: ${workspaceName}`,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    this.panel.webview.onDidReceiveMessage(this.handleMessage.bind(this));
  }

  async show() {
    await this.render();
  }

  async render() {
    try {
      const runs = await getRunsForWorkspace(this.workspaceId, this.token);
      if (!runs?.length) {
        this.panel.webview.html = `<html><body class="bg-black text-red-500 p-4">${translate.noInformation}.</body></html>`;
        return;
      }
      const run = runs.find((r) => r.id === this.runId);

      const runId = run.id;

      const status = run.attributes.status;
      const isPending = status === "pending";
      const blockingRun = isPending ? findBlockingRun(runs) : null;
      const blockingRunId = blockingRun?.id ?? null;

      const msg = run.attributes.message || ``;

      const updatedAt = new Date(run.attributes["updated-at"]).toLocaleString({
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      });

      const terraformVersion = run.attributes["terraform-version"];
      const canApply = status === "planned";

      let gitInfo;
      try {
        gitInfo = await getGitInfoFromRun(run.id, this.token);
      } catch (err) {
        vscode.window.showWarningMessage(
          translate.commitFetchError + err.message
        );
      }

      const planId = run.relationships?.plan?.data?.id;

      const changesSummary = { add: 0, change: 0, destroy: 0 };
      const changesTable = [];

      if (planId) {
        try {
          const plan = await getPlanDetails(planId, this.token);
          const changes = plan.resource_changes || [];

          for (const c of changes) {
            const actions = c.change.actions;
            if (actions.includes("create")) changesSummary.add++;
            if (actions.includes("update")) changesSummary.change++;
            if (actions.includes("delete")) changesSummary.destroy++;

            changesTable.push({
              action: actions[0],
              address: c.address,
              provider: c.provider_name,
              providerImg: getProviderImage(
                c.provider_name,
                this.panel,
                this.extensionUri
              ),
            });
          }
        } catch (err) {
          vscode.window.showErrorMessage(translate.planFetchError + err);
        }
      }

      const summaryText = translate.summary(
        changesSummary.add,
        changesSummary.change,
        changesSummary.destroy
      );

      this.panel.webview.html = renderHandlebarsTemplate("run-detail.hbs", {
        workspaceId: this.workspaceId,
        workspaceName: this.workspaceName,
        status,
        updatedAt,
        terraformVersion,
        msg,
        canApply,
        runId,
        changesSummary,
        changesTable,
        organization: this.organization,
        translate,
        summaryText,
        ...changesSummary,
        gitInfo,
        blockingRunId,
      });
    } catch (err) {
      this.panel.webview.html = `<html><body class="p-4 bg-black text-red-500">${err}</body></html>`;
    }
  }

  async handleMessage(msg) {
    if (msg.type === "apply") {
      try {
        await applyRun(msg.runId, this.token);
        vscode.window.showInformationMessage(translate.applySuccess);
        this.render();
      } catch (err) {
        vscode.window.showErrorMessage(translate.applyError(err));
      }
    }
  }
}
