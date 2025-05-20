import * as vscode from "vscode";
import {
  getRunsForWorkspace,
  applyRun,
  getPlanDetails,
} from "../services/tfcloud-api.js";
import { renderHandlebarsTemplate } from "../utils/renderHandlebarsTemplate.js";
import { i18n } from "../utils/i18n.js";
import { getProviderImage } from "../utils/providersImages.js";

const langCode = vscode.env.language.startsWith("es") ? "es" : "en";
const t = i18n[langCode];

export async function mostrarDetalleDeRun(
  workspaceId,
  workspaceName,
  token,
  organization,
  extensionUri
) {
  const panel = vscode.window.createWebviewPanel(
    "runDetailView",
    `Detalles: ${workspaceName}`,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  async function render() {
    try {
      const runs = await getRunsForWorkspace(workspaceId, token);
      if (!runs || runs.length === 0) {
        panel.webview.html = `<html><body class="bg-black text-red-500 p-4">No hay runs disponibles.</body></html>`;
        return;
      }

      let run = runs[0];
      if (run.attributes.status === "pending" && runs[1]) {
        run = runs[1];
      }

      const runId = run.id;
      const status = run.attributes.status;
      const msg = run.attributes.message || "Sin mensaje";
      const updatedAt = new Date(run.attributes["updated-at"]).toLocaleString(
        "es-AR",
        {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: false,
        }
      );

      const terraformVersion = run.attributes["terraform-version"];
      const canApply = status === "planned";

      const planId = run.relationships?.plan?.data?.id;

      let changesSummary = { add: 0, change: 0, destroy: 0 };
      let changesTable = [];

      if (planId) {
        try {
          const plan = await getPlanDetails(planId, token);
          const changes = plan.resource_changes || [];

          changes.forEach((c) => {
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
                panel,
                extensionUri
              ),
            });
          });
        } catch (err) {
          vscode.window.showErrorMessage("❌ Error al obtener el plan: " + err);
        }
      }

      const summaryText = t.summary(
        changesSummary.add,
        changesSummary.change,
        changesSummary.destroy
      );

      const { add, change, destroy } = changesSummary;

      panel.webview.html = renderHandlebarsTemplate("run-detail.hbs", {
        workspaceId,
        workspaceName,
        status,
        updatedAt,
        terraformVersion,
        msg,
        canApply,
        runId,
        changesSummary,
        changesTable,
        organization,
        t,
        summaryText,
        add,
        change,
        destroy,
      });
    } catch (err) {
      panel.webview.html = `<html><body class="p-4 bg-black text-red-500">Error al cargar run: ${err}</body></html>`;
    }
  }

  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg.type === "apply") {
      try {
        await applyRun(msg.runId, token);
        vscode.window.showInformationMessage("✅ Apply confirmado.");
        render();
      } catch (err) {
        vscode.window.showErrorMessage("❌ Error al aplicar: " + err);
      }
    }
  });

  render();
}
