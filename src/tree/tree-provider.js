import * as vscode from "vscode";
import { TfItem } from "./tf-item.js";
import {
  validateAuth,
  getProjects,
  getWorkspacesByProject,
} from "../services/tfcloud-api.js";

export class TfCloudTreeProvider {
  constructor(token, organization, onRequestReconnect) {
    this.token = token;
    this.organization = organization;
    this.onRequestReconnect = onRequestReconnect;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    const isValid =
      this.token &&
      this.organization &&
      (await validateAuth(this.organization, this.token));

    if (!isValid) {
      const loginItem = new TfItem(
        "🔒 Iniciar sesión en Terraform Cloud",
        "login",
        vscode.TreeItemCollapsibleState.None
      );
      loginItem.command = {
        command: "tfcloud.login",
        title: "Iniciar sesión en Terraform Cloud",
      };
      return [loginItem];
    }

    if (!element) {
      const projects = await getProjects(this.organization, this.token);
      return projects.map(
        (p) =>
          new TfItem(
            p.attributes.name,
            "project",
            vscode.TreeItemCollapsibleState.Collapsed,
            { projectId: p.id }
          )
      );
    }

    if (element.contextValue === "project") {
      const wss = await getWorkspacesByProject(
        this.organization,
        element.projectId,
        this.token
      );
      return wss.map(
        (ws) =>
          new TfItem(
            ws.attributes.name,
            "workspace",
            vscode.TreeItemCollapsibleState.None,
            { workspaceId: ws.id }
          )
      );
    }

    return [];
  }

  updateAuth(token, org) {
    this.token = token;
    this.organization = org;
  }

  refresh() {
    this._onDidChangeTreeData.fire(null);
  }
}
