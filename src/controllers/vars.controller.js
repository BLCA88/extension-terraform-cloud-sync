import * as vscode from "vscode";
import { translate } from "../utils/i18n.js";
import {
  uploadTfvarsToWorkspace,
  downloadTfvarsFromWorkspace,
} from "../services/tfvars.service.js";

export async function uploadTfvars(item, token) {
  let rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!rootFolder) {
    const selectedFolder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Seleccionar carpeta",
    });

    if (!selectedFolder || selectedFolder.length === 0) {
      vscode.window.showWarningMessage("No se seleccionó ninguna carpeta.");
      return;
    }

    rootFolder = selectedFolder[0].fsPath;
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
    vscode.window.showInformationMessage(translate.uploadSuccess(item.label));
  } catch (err) {
    vscode.window.showErrorMessage(translate.uploadError(err));
  }
}

export async function downloadTfvars(item, token) {
  let rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!rootFolder) {
    const selectedFolder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Seleccionar carpeta",
    });

    if (!selectedFolder || selectedFolder.length === 0) {
      vscode.window.showWarningMessage("No se seleccionó ninguna carpeta.");
      return;
    }

    rootFolder = selectedFolder[0].fsPath;
  }

  const defaultUri = vscode.Uri.file(`${rootFolder}/${item.label}.auto.tfvars`);

  const saveUri = await vscode.window.showSaveDialog({
    defaultUri,
    filters: { "Terraform Vars": ["tfvars"] },
    saveLabel: translate.downloadLabel,
  });

  if (!saveUri) return;

  try {
    await downloadTfvarsFromWorkspace(item.workspaceId, saveUri.fsPath, token);
    vscode.window.showInformationMessage(translate.downloadSuccess(item.label));
  } catch (err) {
    vscode.window.showErrorMessage(translate.downloadError(err));
  }
}
