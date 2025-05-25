import { callTFCApi } from "../api/tfc.api.js";

export async function makeRequestPaginated(path, token) {
  let allData = [];
  let nextUrl = path.startsWith("http")
    ? path
    : `https://app.terraform.io/api/v2${path}`;

  while (nextUrl) {
    const res = await callTFCApi({
      fullUrl: nextUrl,
      token,
    });

    const { data, links } = res.data;
    allData = allData.concat(data);
    nextUrl = links?.next || null;
  }

  return allData;
}

export function getProjects(org, token) {
  return makeRequestPaginated(`/organizations/${org}/projects`, token);
}

export function getWorkspacesByProject(org, projectId, token) {
  return makeRequestPaginated(
    `/organizations/${org}/workspaces?filter[project][id]=${projectId}`,
    token
  );
}
