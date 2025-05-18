import * as vscode from "vscode";
import { TfCloudTreeProvider } from "./tree/tree-provider.js";
import { mostrarPanelDeRuns } from "./panels/runs-panel.js";
import {
  uploadTfvarsToWorkspace,
  downloadTfvarsFromWorkspace,
} from "./services/tfvars-service.js";
import { validateAuth } from "./tfcloud-api.js";
import { mostrarDetalleDeRun } from "./panels/run-details-panel.js";

let treeProvider;
let auth = { token: null, organization: null };

async function registerProvider(context) {
  let organization = context.globalState.get("tfcloud.org");
  let token = context.globalState.get("tfcloud.token");

  if (!organization || !token) {
    organization = await vscode.window.showInputBox({
      prompt: "Nombre de la organización en Terraform Cloud",
      ignoreFocusOut: true,
    });
    if (!organization) return;

    token = await vscode.window.showInputBox({
      prompt: "Token de Terraform Cloud",
      password: true,
      ignoreFocusOut: true,
    });
    if (!token) return;
  }

  const isValid = await validateAuth(organization, token);
  if (!isValid) {
    vscode.window.showErrorMessage("❌ Token inválido o sin permisos.");
    await context.globalState.update("tfcloud.token", undefined);
    await context.globalState.update("tfcloud.org", undefined);
    return;
  }

  await context.globalState.update("tfcloud.token", token);
  await context.globalState.update("tfcloud.org", organization);

  auth = { token, organization };

  treeProvider = new TfCloudTreeProvider(token, organization);
  const treeView = vscode.window.createTreeView("tfcloudProjects", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(treeView);

  treeView.onDidChangeSelection((e) => {
    const selected = e.selection[0];
    if (selected?.contextValue === "workspace") {
      // mostrarPanelDeRuns(selected.workspaceId, selected.label, token);
      mostrarDetalleDeRun(selected.workspaceId, selected.label, token);
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.uploadTfvars", async (item) => {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { "Terraform Vars": ["tfvars"] },
        openLabel: "Seleccionar archivo .tfvars",
      });

      if (!fileUri) return;

      const filePath = fileUri[0].fsPath;

      try {
        await uploadTfvarsToWorkspace(item.workspaceId, filePath, token);
        vscode.window.showInformationMessage(
          `✅ Archivo subido a ${item.label}`
        );
      } catch (err) {
        vscode.window.showErrorMessage(`❌ Error al subir: ${err}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.downloadTfvars", async (item) => {
      const defaultUri = vscode.Uri.file(`${item.label}.auto`);

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri,
        filters: { "Terraform Vars": ["tfvars"] },
        saveLabel: "Guardar archivo .tfvars",
      });

      if (!saveUri) return;

      try {
        await downloadTfvarsFromWorkspace(
          item.workspaceId,
          saveUri.fsPath,
          token
        );
        vscode.window.showInformationMessage(
          `✅ Archivo guardado desde ${item.label}`
        );
      } catch (err) {
        vscode.window.showErrorMessage(`❌ Error al descargar: ${err}`);
      }
    })
  );
}

export async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.login", async () => {
      await registerProvider(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.logout", async () => {
      await context.globalState.update("tfcloud.token", undefined);
      await context.globalState.update("tfcloud.org", undefined);

      if (treeProvider) {
        treeProvider.updateAuth(null, null); // reset credenciales
        treeProvider.refresh(); // forzar recarga
      }

      vscode.window.showInformationMessage(
        "🔒 Sesión cerrada. Ejecutá 'Iniciar sesión' para reconectar."
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tfcloud.refresh", async () => {
      if (treeProvider) {
        vscode.window.showInformationMessage("🔄 Actualizando...");
        treeProvider.refresh();
      }
    })
  );

  await registerProvider(context);
}

export function deactivate() {}
