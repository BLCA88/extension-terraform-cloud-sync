import * as vscode from "vscode";

import { getStatusIcon } from "../utils/tree.utils.js";

export class TfItem extends vscode.TreeItem {
  constructor(label, contextValue, collapsibleState, extra = {}) {
    super(label, collapsibleState);
    this.contextValue = contextValue;
    Object.assign(this, extra);
  }
}

export class RunTreeItem extends vscode.TreeItem {
  constructor(label, runId, status, createdAt, workspaceId, workspaceName) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.runId = runId;
    this.workspaceId = workspaceId;
    this.workspaceName = workspaceName;

    this.tooltip = `RunID: ${runId}\nStatus: ${status}\nWorkspaceID: ${workspaceId}\n`;
    this.description = `${new Date(createdAt).toLocaleDateString()}`;
    this.iconPath = getStatusIcon(status);
    this.contextValue = "run";
  }
}
