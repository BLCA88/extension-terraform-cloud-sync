import * as vscode from "vscode";

export class TfItem extends vscode.TreeItem {
  constructor(label, contextValue, collapsibleState, extra = {}) {
    super(label, collapsibleState);
    this.contextValue = contextValue;
    Object.assign(this, extra);
  }
}
