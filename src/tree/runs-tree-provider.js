import * as vscode from "vscode";
import { RunTreeItem } from "./tf-item.js";

class RunsTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.runs = [];
  }

  setRuns(rawRuns, workspaceId, workspaceName) {
    this.runs = rawRuns.map(
      (run) =>
        new RunTreeItem(
          `${run.attributes.message || run.attributes.source}`,
          run.id,
          run.attributes.status,
          run.attributes["created-at"],
          workspaceId,
          workspaceName
        )
    );
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    return this.runs;
  }
}

const runsTreeProvider = new RunsTreeProvider();

export { RunTreeItem, RunsTreeProvider, runsTreeProvider };
