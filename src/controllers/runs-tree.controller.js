import { getRunsForWorkspace } from "../services/run-details.service.js";
import { RunTreeItem } from "../tree/tf-item.js";
import { validateAuth } from "../services/auth.service.js";

export async function resolveRunsItems(
  workspaceId,
  workspaceName,
  token,
  organization
) {
  const isValid =
    token && organization && (await validateAuth(organization, token));

  if (!isValid || !workspaceId) return [];

  const runs = await getRunsForWorkspace(workspaceId, token);

  return runs.map(
    (run) =>
      new RunTreeItem(
        run.attributes.message || run.attributes.source,
        run.id,
        run.attributes.status,
        run.attributes["created-at"],
        workspaceId,
        workspaceName
      )
  );
}
