import * as vscode from "vscode";
import { TfItem } from "../tree/tf-item.js";
import {
  getProjects,
  getWorkspacesByProject,
} from "../services/tree.service.js";
import { validateAuth } from "../services/auth.service.js";

export async function resolveTreeItems(element, token, organization) {
  const isValid =
    token && organization && (await validateAuth(organization, token));

  if (!isValid) {
    return [];
  }

  if (!element) {
    const projects = await getProjects(organization, token);
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
    const workspaces = await getWorkspacesByProject(
      organization,
      element.projectId,
      token
    );
    return workspaces.map(
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
