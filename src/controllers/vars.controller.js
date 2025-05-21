import * as vscode from "vscode";
import { translate } from "../utils/i18n.js";
import {
  uploadTfvarsToWorkspace,
  downloadTfvarsFromWorkspace,
} from "../services/tfvars.service.js";

export async function syncVars(context, token) {
  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.uploadTfvars", async (item) => {
      const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      if (!rootFolder) {
        vscode.window.showErrorMessage(
          "❌ " + (translate.noWorkspace || "No workspace folder is open.")
        );
        return;
      }

      const fileUri = await vscode.window.showOpenDialog({
        defaultUri: vscode.Uri.file(rootFolder),
        canSelectMany: false,
        filters: { "Terraform Vars": ["tfvars"] },
        openLabel: translate.uploadLabel,
      });

      if (!fileUri) return;

      const filePath = fileUri[0].fsPath;

      try {
        await uploadTfvarsToWorkspace(item.workspaceId, filePath, token);
        vscode.window.showInformationMessage(
          translate.uploadSuccess(item.label)
        );
      } catch (err) {
        vscode.window.showErrorMessage(translate.uploadError(err));
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.downloadTfvars", async (item) => {
      const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      if (!rootFolder) {
        vscode.window.showErrorMessage(
          "❌ " + (translate.noWorkspace || "No workspace folder is open.")
        );
        return;
      }

      const defaultUri = vscode.Uri.file(
        `${rootFolder}/${item.label}.auto.tfvars`
      );

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri,
        filters: { "Terraform Vars": ["tfvars"] },
        saveLabel: translate.downloadLabel,
      });

      if (!saveUri) return;

      try {
        await downloadTfvarsFromWorkspace(
          item.workspaceId,
          saveUri.fsPath,
          token
        );
        vscode.window.showInformationMessage(
          translate.downloadSuccess(item.label)
        );
      } catch (err) {
        vscode.window.showErrorMessage(translate.downloadError(err));
      }
    })
  );
}
