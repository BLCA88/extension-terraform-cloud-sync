import * as vscode from "vscode";
import { resolveTreeItems } from "../controllers/tree.controller.js";

export class TfCloudTreeProvider {
  constructor(token, organization) {
    this.token = token;
    this.organization = organization;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    return resolveTreeItems(element, this.token, this.organization);
  }

  updateAuth(token, org) {
    this.token = token;
    this.organization = org;
  }

  refresh() {
    this._onDidChangeTreeData.fire(null);
  }
}
