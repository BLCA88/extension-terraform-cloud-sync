// src/services/run.service.js
import axios from "axios";
import { api } from "../config/axios.config.js";

export async function getRunsForWorkspace(workspaceId, token) {
  const url = `/workspaces/${workspaceId}/runs?page[size]=5`;
  const res = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
}

export async function applyRun(runId, token) {
  const url = `/runs/${runId}/actions/apply`;
  const res = await api.post(
    url,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 202,
    }
  );
  return res.status === 202;
}

export async function getPlanDetails(planId, token) {
  const url = `/plans/${planId}/json-output`;

  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    maxRedirects: 0,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  if (response.status === 200) {
    return response.data;
  }

  if (response.status === 307) {
    const redirectUrl = response.headers.location;
    const archivistRes = await axios.get(redirectUrl, {
      headers: {
        "Content-Type": "application/vnd.api+json",
      },
    });
    return archivistRes.data;
  }

  throw new Error(`Error al obtener el plan. Status: ${response.status}`);
}

export async function getGitInfoFromRun(runId, token) {
  try {
    const runUrl = `/runs/${runId}?include=configuration_version`;

    const runRes = await api.get(runUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const runData = runRes?.data?.data;
    if (!runData) return null;

    const configVersionId =
      runData.relationships["configuration-version"]?.data?.id;

    if (!configVersionId) return null;

    const ingressRes = await api.get(
      `/configuration-versions/${configVersionId}/ingress-attributes`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const attributes = ingressRes?.data?.data?.attributes;

    if (!attributes) return null;

    return attributes;
  } catch (err) {
    console.error("Error al obtener gitInfo:", err);
    return null;
  }
}
