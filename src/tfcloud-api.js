import https from "https";
import { URL } from "url";
import axios from "axios";

function makeRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "app.terraform.io",
      path,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).data);
        } else {
          reject(`Status ${res.statusCode}: ${data}`);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

function makeRequestPaginated(path, token) {
  return new Promise((resolve, reject) => {
    let allData = [];

    function fetchPage(currentPath) {
      const options = {
        hostname: "app.terraform.io",
        path: currentPath,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/vnd.api+json",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            allData = allData.concat(json.data);
            const next = json.links && json.links.next;
            if (next) {
              const nextUrl = new URL(next);
              const nextPath = nextUrl.pathname + nextUrl.search;
              fetchPage(nextPath);
            } else {
              resolve(allData);
            }
          } else {
            reject(`Status ${res.statusCode}: ${data}`);
          }
        });
      });

      req.on("error", reject);
      req.end();
    }

    fetchPage(path);
  });
}

// 👇 Exportar como ES Module
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
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "app.terraform.io",
      path: `/api/v2/runs/${runId}/actions/apply`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
    };

    const req = https.request(options, (res) => {
      res.statusCode === 202 ? resolve() : reject(`Código ${res.statusCode}`);
    });

    req.on("error", reject);
    req.end();
  });
}

export async function getPlanDetails(planId, token) {
  const url = `https://app.terraform.io/api/v2/plans/${planId}/json-output`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
    },
    maxRedirects: 0, // no seguir redirect automáticamente
    validateStatus: (status) => status >= 200 && status < 400, // acepta 307
  });

  if (response.status === 200) {
    return response.data;
  }

  if (response.status === 307) {
    const redirectUrl = response.headers.location;

    // Segundo request manual al archivist
    const archivistRes = await axios.get(redirectUrl, {
      headers: {
        "Content-Type": "application/vnd.api+json",
      },
    });

    return archivistRes.data;
  }

  throw new Error(`Error al obtener el plan. Status: ${response.status}`);
}
