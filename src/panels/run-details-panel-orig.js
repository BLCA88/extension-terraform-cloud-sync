import * as vscode from "vscode";
import { getRunsForWorkspace, applyRun } from "../tfcloud-api.js";

export async function mostrarDetalleDeRun(workspaceId, workspaceName, token) {
  const panel = vscode.window.createWebviewPanel(
    "runDetailView",
    `Detalle de Run: ${workspaceName}`,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  async function render() {
    try {
      const runs = await getRunsForWorkspace(workspaceId, token);
      
      const run = runs[0];
      console.log(JSON.stringify(run))

      const runId = run.id;
      const status = run.attributes.status;
      const msg = run.attributes.message || "Sin mensaje";
      const createdAt = new Date(run.attributes.created_at).toLocaleString();
      const canApply = status === "planned_and_finished";

      panel.webview.html = `
        <html>
          <head>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          </head>
          <body class="bg-gray-900 text-white p-4 font-mono">
            <h2 class="text-xl font-bold mb-2">Último run para <span class="text-green-400">${workspaceName}</span></h2>
            <p class="mb-1"><b>Estado:</b> <span class="text-yellow-400">${status}</span></p>
            <p class="mb-1"><b>Creado:</b> ${createdAt}</p>
            <p class="mb-4"><b>Mensaje:</b> ${msg}</p>

            ${
              canApply
                ? `<button onclick="apply()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Confirmar Apply</button>`
                : "<p class='text-gray-400'>Este run no requiere apply manual.</p>"
            }

            <script>
              const vscode = acquireVsCodeApi();
              function apply() {
                vscode.postMessage({ type: 'apply', runId: "${runId}" });
              }
            </script>
          </body>
        </html>
      `;
    } catch (err) {
      panel.webview.html = `<html><body class="p-4 bg-black text-red-500">Error al cargar run: ${err}</body></html>`;
    }
  }

  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg.type === "apply") {
      try {
        await applyRun(msg.runId, token);
        vscode.window.showInformationMessage("✅ Apply confirmado.");
        render();
      } catch (err) {
        vscode.window.showErrorMessage("❌ Error al aplicar: " + err);
      }
    }
  });

  render();
}
