import * as vscode from "vscode";
import { getRunsForWorkspace } from "../tfcloud-api.js";

export function mostrarPanelDeRuns(workspaceId, workspaceName, token) {
  const panel = vscode.window.createWebviewPanel(
    "runsView",
    `Runs: ${workspaceName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  async function updateContent() {
    try {
      const runs = await getRunsForWorkspace(workspaceId, token);
      panel.webview.html = `
        <html>
          <body>
            <h2>Últimos runs de <b>${workspaceName}</b></h2>
            <ul>
              ${runs
                .map(
                  (run) => `
                <li>
                  <b>${run.attributes.status.toUpperCase()}</b> -
                  ${new Date(run.attributes.created_at).toLocaleString()}<br>
                  ${run.attributes.message || "Sin mensaje"}
                </li>
              `
                )
                .join("")}
            </ul>
          </body>
        </html>
      `;
    } catch (err) {
      panel.webview.html = `<html><body><h3>Error obteniendo runs</h3><pre>${err}</pre></body></html>`;
    }
  }

  updateContent();
  const interval = setInterval(updateContent, 5000);
  panel.onDidDispose(() => clearInterval(interval));
}
