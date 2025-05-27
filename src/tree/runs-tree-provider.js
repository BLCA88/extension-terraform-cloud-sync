import * as vscode from "vscode";
import { RunTreeItem } from "./tf-item.js";
import { resolveRunsItems } from "../controllers/runs-tree.controller.js";

class RunsTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.runs = [];
  }

  setContext({ workspaceId, workspaceName, token, organization }) {
    this.workspaceId = workspaceId;
    this.workspaceName = workspaceName;
    this.token = token;
    this.organization = organization;
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren() {
    if (!this.workspaceId || !this.token || !this.organization) return [];
    return await resolveRunsItems(
      this.workspaceId,
      this.workspaceName,
      this.token,
      this.organization
    );
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }
}

const runsTreeProvider = new RunsTreeProvider();

export { RunsTreeProvider, runsTreeProvider };
