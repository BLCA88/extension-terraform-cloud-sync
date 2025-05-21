import { RunDetailsPanel } from "../controllers/run-details.controller.js";

export async function showRunDetails(
  workspaceId,
  workspaceName,
  token,
  organization,
  extensionUri
) {
  const panel = new RunDetailsPanel(
    workspaceId,
    workspaceName,
    token,
    organization,
    extensionUri
  );
  await panel.show();
}
