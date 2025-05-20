import axios from "axios";

async function makeRequest(path, token) {
  const url = `https://app.terraform.io${path}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
    },
  });
  return res.data.data;
}

async function makeRequestPaginated(path, token) {
  let allData = [];
  let nextUrl = `https://app.terraform.io${path}`;

  while (nextUrl) {
    const res = await axios.get(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
    });

    const json = res.data;
    allData = allData.concat(json.data);
    nextUrl = json.links && json.links.next ? json.links.next : null;
  }

  return allData;
}

export function getProjects(org, token) {
  return makeRequestPaginated(`/api/v2/organizations/${org}/projects`, token);
}

export function getWorkspacesByProject(org, projectId, token) {
  return makeRequestPaginated(
    `/api/v2/organizations/${org}/workspaces?filter[project][id]=${projectId}`,
    token
  );
}

export function getRunsForWorkspace(workspaceId, token) {
  return makeRequest(
    `/api/v2/workspaces/${workspaceId}/runs?page[size]=5`,
    token
  );
}

export async function validateAuth(org, token) {
  try {
    const result = await makeRequest(
      `/api/v2/organizations/${org}/projects?page[size]=1`,
      token
    );
    return !!result;
  } catch {
    return false;
  }
}

export async function applyRun(runId, token) {
  const url = `https://app.terraform.io/api/v2/runs/${runId}/actions/apply`;
  const res = await axios.post(
    url,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
      validateStatus: (status) => status === 202,
    }
  );
  return res.status === 202;
}

export async function getPlanDetails(planId, token) {
  const url = `https://app.terraform.io/api/v2/plans/${planId}/json-output`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
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
