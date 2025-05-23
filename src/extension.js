import * as vscode from "vscode";
import { translate } from "./utils/i18n.js";
import { establishConnection } from "./controllers/auth.controller.js";
import { TfCloudTreeProvider } from "./tree/tree-provider.js";
import { uploadTfvars, downloadTfvars } from "./controllers/vars.controller.js";
import { showRunDetails } from "./panels/run-details-panel.js";

let treeProvider;
let currentToken = null;
let currentOrganization = null;

async function registerProvider(context) {
  const creds = await establishConnection(context.globalState);
  if (!creds) {
    await vscode.commands.executeCommand(
      "setContext",
      "tfcloud.loggedIn",
      false
    );
    return;
  }

  currentToken = creds.token;
  currentOrganization = creds.organization;

  await vscode.commands.executeCommand("setContext", "tfcloud.loggedIn", true);

  treeProvider = new TfCloudTreeProvider(currentToken, currentOrganization);

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
        currentToken,
        currentOrganization,
        context.extensionUri
      );
    }
  });
}

export async function activate(context) {
  // const token = context.globalState.get("tfcloud.token");
  // await vscode.commands.executeCommand(
  //   "setContext",
  //   "tfcloud.loggedIn",
  //   !!token
  // );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.login", async () => {
      await registerProvider(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.logout", async () => {
      await context.globalState.update("tfcloud.token", undefined);
      await context.globalState.update("tfcloud.org", undefined);
      await vscode.commands.executeCommand(
        "setContext",
        "tfcloud.loggedIn",
        false
      );

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
    vscode.commands.registerCommand("tfcloud.uploadTfvars", (item) => {
      if (currentToken) uploadTfvars(item, currentToken);
      else vscode.window.showErrorMessage("⚠️ No token available.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.downloadTfvars", (item) => {
      if (currentToken) downloadTfvars(item, currentToken);
      else vscode.window.showErrorMessage("⚠️ No token available.");
    })
  );

  await registerProvider(context);
}

export function deactivate() {}
