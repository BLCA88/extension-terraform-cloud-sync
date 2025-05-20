import * as vscode from "vscode";
import { TfCloudTreeProvider } from "./tree/tree-provider.js";
import {
  uploadTfvarsToWorkspace,
  downloadTfvarsFromWorkspace,
} from "./services/tfvars-service.js";
import { validateAuth } from "./services/tfcloud-api.js";
import { mostrarDetalleDeRun } from "./panels/run-details-panel.js";
import { i18n } from "./utils/i18n.js";

let treeProvider;

const lang = vscode.env.language.startsWith("es") ? "es" : "en";
const t = i18n[lang];

async function registerProvider(context) {
  let organization = context.globalState.get("tfcloud.org");
  let token = context.globalState.get("tfcloud.token");

  if (!organization || !token) {
    organization = await vscode.window.showInputBox({
      prompt: t.promptOrg,
      ignoreFocusOut: true,
    });
    if (!organization) return;

    token = await vscode.window.showInputBox({
      prompt: t.promptToken,
      password: true,
      ignoreFocusOut: true,
    });
    if (!token) return;
  }

  const isValid = await validateAuth(organization, token);
  if (!isValid) {
    vscode.window.showErrorMessage(t.invalidToken);
    await context.globalState.update("tfcloud.token", undefined);
    await context.globalState.update("tfcloud.org", undefined);
    return;
  }

  await context.globalState.update("tfcloud.token", token);
  await context.globalState.update("tfcloud.org", organization);

  treeProvider = new TfCloudTreeProvider(token, organization);
  const treeView = vscode.window.createTreeView("tfcloudProjects", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(treeView);

  treeView.onDidChangeSelection((e) => {
    const selected = e.selection[0];
    if (selected?.contextValue === "workspace") {
      mostrarDetalleDeRun(
        selected.workspaceId,
        selected.label,
        token,
        organization,
        context.extensionUri
      );
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.uploadTfvars", async (item) => {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { "Terraform Vars": ["tfvars"] },
        openLabel: t.uploadLabel,
      });

      if (!fileUri) return;

      const filePath = fileUri[0].fsPath;

      try {
        await uploadTfvarsToWorkspace(item.workspaceId, filePath, token);
        vscode.window.showInformationMessage(t.uploadSuccess(item.label));
      } catch (err) {
        vscode.window.showErrorMessage(t.uploadError(err));
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.downloadTfvars", async (item) => {
      const defaultUri = vscode.Uri.file(`${item.label}.auto`);

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri,
        filters: { "Terraform Vars": ["tfvars"] },
        saveLabel: t.downloadLabel,
      });

      if (!saveUri) return;

      try {
        await downloadTfvarsFromWorkspace(
          item.workspaceId,
          saveUri.fsPath,
          token
        );
        vscode.window.showInformationMessage(t.downloadSuccess(item.label));
      } catch (err) {
        vscode.window.showErrorMessage(t.downloadError(err));
      }
    })
  );
}

export async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.login", async () => {
      await registerProvider(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.logout", async () => {
      await context.globalState.update("tfcloud.token", undefined);
      await context.globalState.update("tfcloud.org", undefined);

      if (treeProvider) {
        treeProvider.updateAuth(null, null);
        treeProvider.refresh();
      }

      vscode.window.showInformationMessage(t.loggedOut);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.refresh", async () => {
      if (treeProvider) {
        vscode.window.showInformationMessage(t.refreshing);
        treeProvider.refresh();
      }
    })
  );

  await registerProvider(context);
}

export function deactivate() {}
