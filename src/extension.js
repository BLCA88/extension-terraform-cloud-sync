import * as vscode from "vscode";
import { translate } from "./utils/i18n.js";
import { TfCloudSession } from "./controllers/session-provider.controller.js";
import { createTreeViews } from "./tree/tree.context.js";
import { uploadTfvars, downloadTfvars } from "./controllers/vars.controller.js";

let tfTreeView = null;
let tfRunsView = null;
let tfTreeProvider = null;

export async function activate(context) {
  const session = await TfCloudSession.getInstance(context.globalState);
  if (session) {
    const views = await createTreeViews(context, session);
    tfTreeView = views.treeView;
    tfRunsView = views.runsView;
    tfTreeProvider = views.treeProvider;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.login", async () => {
      const session = await TfCloudSession.getInstance(context.globalState);
      if (!session) {
        vscode.window.showErrorMessage("❌ No se pudo iniciar sesión.");
        return;
      }

      const views = await createTreeViews(context, session);
      tfTreeView = views.treeView;
      tfRunsView = views.runsView;
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.logout", async () => {
      await context.globalState.update("tfcloud.token", undefined);
      await context.globalState.update("tfcloud.org", undefined);
      TfCloudSession.reset();

      if (tfTreeView) tfTreeView.dispose();
      if (tfRunsView) tfRunsView.dispose();
      tfTreeView = null;
      tfRunsView = null;

      await vscode.commands.executeCommand(
        "setContext",
        "tfcloud.loggedIn",
        false
      );
      vscode.window.showInformationMessage(translate.loggedOut);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.refresh", async () => {
      if (tfTreeProvider) {
        vscode.window.showInformationMessage(translate.refreshing);
        tfTreeProvider.refresh();
      } else {
        vscode.window.showWarningMessage("⚠️ No hay vista para refrescar.");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.uploadTfvars", async (item) => {
      const session = await TfCloudSession.getInstance(context.globalState);
      if (session?.getToken()) uploadTfvars(item, session.getToken());
      else vscode.window.showErrorMessage("⚠️ No token disponible.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.downloadTfvars", async (item) => {
      const session = await TfCloudSession.getInstance(context.globalState);
      if (session?.getToken()) downloadTfvars(item, session.getToken());
      else vscode.window.showErrorMessage("⚠️ No token disponible.");
    })
  );
}

export function deactivate() {}
