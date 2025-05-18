import https from "https";
import { URL } from "url";

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
