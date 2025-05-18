import * as vscode from "vscode";
import { TfCloudTreeProvider } from "./tree/tree-provider.js";
import { mostrarPanelDeRuns } from "./panels/runs-panel.js";
import { registerTreeCommands } from "./tree/tree-commands.js";

let treeProvider;
let auth = { token: null, organization: null };

async function registerProvider(context) {
  const organization = await vscode.window.showInputBox({
    prompt: "Nombre de la organización en Terraform Cloud",
    ignoreFocusOut: true,
  });
  if (!organization) return;

  const token = await vscode.window.showInputBox({
    prompt: "Token de Terraform Cloud",
    password: true,
    ignoreFocusOut: true,
  });
  if (!token) return;

  auth = { token, organization };

  treeProvider = new TfCloudTreeProvider(token, organization);
  const treeView = vscode.window.createTreeView("tfcloudProjects", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(treeView);

  treeView.onDidChangeSelection((e) => {
    const selected = e.selection[0];
    if (selected?.contextValue === "workspace") {
      mostrarPanelDeRuns(selected.workspaceId, selected.label, token);
    }
  });
}

export function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.login", async () => {
      await registerProvider(context);
    })
  );

  registerTreeCommands(context, () => auth);
  registerProvider(context);
}

export function deactivate() {}
