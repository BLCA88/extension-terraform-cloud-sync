import { callTFCApi } from "../api/tfc.api.js";

export async function getRunsForWorkspace(workspaceId, token) {
  try {
    const res = await callTFCApi({
      url: `/workspaces/${workspaceId}/runs`,
      token,
    });
    return res.data.data;
  } catch {
    return false;
  }
}

export async function getRuns(RunId, token) {
  try {
    const res = await callTFCApi({
      url: `/runs/${RunId}`,
      token,
    });
    return res.data.data;
  } catch {
    return false;
  }
}

export async function applyRun(runId, token) {
  const url = `/runs/${runId}/actions/apply`;

  const response = await callTFCApi({
    method: "post",
    url,
    token,
    data: {},
  });

  return response.status === 202;
}

export async function getPlanDetails(planId, token) {
  const res = await callTFCApi({
    url: `/plans/${planId}/json-output`,
    token,
  });
  if (res.status === 204) return res;

  return res.data;
}

export async function getGitInfoFromRun(runId, token) {
  try {
    const runRes = await callTFCApi({
      method: "get",
      url: `/runs/${runId}?include=configuration_version`,
      token,
    });

    const runData = runRes?.data?.data;
    if (!runData) return null;

    const configVersionId =
      runData.relationships?.["configuration-version"]?.data?.id;
    if (!configVersionId) return null;

    const ingressRes = await callTFCApi({
      method: "get",
      url: `/configuration-versions/${configVersionId}/ingress-attributes`,
      token,
    });

    const attributes = ingressRes?.data?.data?.attributes;
    return attributes ?? null;
  } catch (err) {
    console.error("Error al obtener gitInfo:", err);
    return null;
  }
}
