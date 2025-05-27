import * as vscode from "vscode";
import { TfCloudTreeProvider } from "./tree-provider.js";
import { RunsTreeProvider } from "./runs-tree-provider.js";
import { showRunDetails } from "../panels/run-details-panel.js";

let currentRunsProvider = null;
let currentWorkspaceId = null;
let currentWorkspaceName = null;

export async function createTreeViews(context, session) {
  const token = session.getToken();
  const org = session.getOrganization();
  let workspaceId = null;
  let label = null;
  let extensionUri = null;

  const treeProvider = new TfCloudTreeProvider(token, org);
  const runsProvider = new RunsTreeProvider();

  const treeView = vscode.window.createTreeView("tfcloudProjects", {
    treeDataProvider: treeProvider,
  });

  const runsView = vscode.window.createTreeView("runsTree", {
    treeDataProvider: runsProvider,
  });

  context.subscriptions.push(treeView, runsView);

  treeView.onDidChangeSelection(async (e) => {
    const selected = e.selection[0];
    if (selected?.contextValue === "workspace") {
      workspaceId = selected.workspaceId;
      label = selected.label;
      extensionUri = context.extensionUri;

      runsProvider.setContext({
        workspaceId,
        workspaceName: label,
        token,
        organization: org,
      });

      runsProvider.refresh();

      currentRunsProvider = runsProvider;
      currentWorkspaceId = workspaceId;
      currentWorkspaceName = label;
    }
  });

  runsView.onDidChangeSelection(async (e) => {
    const selected = e.selection[0];
    if (selected?.contextValue === "run") {
      await showRunDetails(
        workspaceId,
        label,
        token,
        org,
        extensionUri,
        selected.runId
      );
    }
  });

  return { treeView, runsView, treeProvider, runsProvider };
}

export { currentRunsProvider, currentWorkspaceId, currentWorkspaceName };
