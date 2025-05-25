import { RunDetailsPanel } from "../controllers/run-details.controller.js";

export async function showRunDetails(
  workspaceId,
  workspaceName,
  token,
  organization,
  extensionUri,
  runId
) {
  const panel = new RunDetailsPanel(
    workspaceId,
    workspaceName,
    token,
    organization,
    extensionUri,
    runId
  );
  await panel.show();
}
