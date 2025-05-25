import * as vscode from "vscode";

export function getStatusIcon(status) {
  switch (status) {
    case "planned":
    case "plan_queued":
      return new vscode.ThemeIcon(
        "warning",
        new vscode.ThemeColor("charts.yellow")
      );
    case "pending":
      return new vscode.ThemeIcon(
        "debug-pause",
        new vscode.ThemeColor("charts.blue")
      );
    case "errored":
      return new vscode.ThemeIcon("error", new vscode.ThemeColor("charts.red"));
    case "applied":
    case "planned_and_finished":
      return new vscode.ThemeIcon(
        "pass-filled",
        new vscode.ThemeColor("charts.green")
      );
    case "canceled":
      return new vscode.ThemeIcon(
        "circle-slash",
        new vscode.ThemeColor("charts.yellow")
      );
    case "discarded":
      return new vscode.ThemeIcon("x");
    default:
      return new vscode.ThemeIcon("debug-stop");
  }
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
