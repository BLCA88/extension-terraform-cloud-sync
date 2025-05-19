import * as vscode from "vscode";
import {
  getRunsForWorkspace,
  applyRun,
  getPlanDetails,
} from "../tfcloud-api.js";

export async function mostrarDetalleDeRun(workspaceId, workspaceName, token) {
  const panel = vscode.window.createWebviewPanel(
    "runDetailView",
    `Detalles: ${workspaceName}`,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  async function render() {
    try {
      const runs = await getRunsForWorkspace(workspaceId, token);
      console.log(runs);
      let run = runs[0];
      const runId = run.id;
      const status = run.attributes.status;
      const msg = run.attributes.message || "Sin mensaje";
      const updatedAt = run.attributes["updated-at"];
      const terraformVersion = run.attributes["terraform-version"];
      const canApply = status === "pending";

      const aws_logo =
        "https://img.icons8.com/color/48/amazon-web-services.png";

      if (run.attributes.status === "pending") {
        run = runs[1];
        console.log(run.id);
      }
      const planId = run.relationships?.plan?.data?.id;
      let planDetailsHtml =
        "<p class='text-gray-400'>No hay detalles del plan disponibles.</p>";

      if (planId) {
        try {
          const plan = await getPlanDetails(planId, token);
          const changes = plan.resource_changes || [];

          const summary = { add: 0, change: 0, destroy: 0 };
          changes.forEach((c) => {
            if (c.change.actions.includes("create")) summary.add++;
            if (c.change.actions.includes("update")) summary.change++;
            if (c.change.actions.includes("delete")) summary.destroy++;
          });

          const summaryLine = `<p class="text-sm text-gray-300 mb-2">📝 ${summary.add} to add, ${summary.change} to change,  <span class="text-rose-600">${summary.destroy} to destroy</span></p>`;

          if (changes.length > 0) {
            planDetailsHtml =
              summaryLine +
              `
              <table class="w-full text-sm text-left mt-2">
                <thead class="text-gray-300 border-b border-gray-600">
                  <tr><th>Acción</th><th>Recurso</th><th>Proveedor</th></tr>
                </thead>
                <tbody class="text-gray-200">
                  ${changes
                    .map(
                      (c) => `
                        <tr class="border-b border-gray-800">
                          <td class="py-1 text-${getActionColor(
                            c.change.actions[0]
                          )}-400">${c.change.actions[0]}</td>
                          <td class="py-1">${c.address}</td>
                          <td class="py-1 flex justify-center">
                          ${
                            c.provider_name ===
                            "registry.terraform.io/hashicorp/aws"
                              ? `<img src="${aws_logo}" alt="AWS" width="28" height="28" />`
                              : c.provider_name
                          }                      
                          </td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            `;
          }
        } catch (err) {
          planDetailsHtml = `<p class='text-red-400'>Error al obtener el plan: ${err}</p>`;
        }
      }

      panel.webview.html = `
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-900 text-white p-6">
            <h2 class="text-xl font-bold">Workspace: <span class="text-green-400">${workspaceName}</span></h2>
            <p class="text-gray-400 mb-4 font-mono">ID: ${workspaceId}</p>
            <ul class="mb-4">
              <li><b>Estado:</b> <span class="text-yellow-400">${status}</span></li>
              <li><b>Actualizado:</b> ${updatedAt}</li>
              <li><b>Versión Terraform:</b> ${terraformVersion}</li>
              <li><b>Mensaje:</b> ${msg}</li>
            </ul>

            ${
              canApply
                ? `<button onclick="apply()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Confirmar Apply</button>`
                : "<p class='text-gray-400'>Este run no requiere apply manual.</p>"
            }

            <h3 class="mt-6 text-lg font-bold">Cambios en el plan</h3>
            <div class="mt-2">
              ${planDetailsHtml}
            </div>

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

  function getActionColor(action) {
    switch (action) {
      case "create":
        return "green";
      case "update":
        return "yellow";
      case "delete":
        return "rose";
      default:
        return "gray";
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
