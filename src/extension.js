import * as vscode from "vscode";
import { translate } from "./utils/i18n.js";
import { establishConnection } from "./controllers/auth.controller.js";
import { TfCloudTreeProvider } from "./tree/tree-provider.js";
import { syncVars } from "./controllers/vars.controller.js";

import { showRunDetails } from "./panels/run-details-panel.js";

let treeProvider;

async function registerProvider(context) {
  const creds = await establishConnection(context.globalState);
  if (!creds) return;

  treeProvider = new TfCloudTreeProvider(creds.token, creds.organization);

  const treeView = vscode.window.createTreeView("tfcloudProjects", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(treeView);

  treeView.onDidChangeSelection((e) => {
    const selected = e.selection[0];
    if (selected?.contextValue === "workspace") {
      showRunDetails(
        selected.workspaceId,
        selected.label,
        creds.token,
        creds.organization,
        context.extensionUri
      );
    }
  });

  syncVars(context, creds.token);
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

      vscode.window.showInformationMessage(translate.loggedOut);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.refresh", async () => {
      if (treeProvider) {
        vscode.window.showInformationMessage(translate.refreshing);
        treeProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.debugCommands", async () => {
      const cmds = await vscode.commands.getCommands(true);
      const tfcloud = cmds.filter((c) => c.includes("tfcloud"));
      vscode.window.showInformationMessage(`Comandos: ${tfcloud.join(", ")}`);
    })
  );

  await registerProvider(context);
}

export function deactivate() {}
