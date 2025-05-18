import fs from "fs";
import path from "path";
import https from "https";

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(`Status ${res.statusCode}: ${data}`);
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function uploadTfvarsToWorkspace(workspaceId, filePath, token) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.includes("="));

  const vars = lines.map((line) => {
    const [key, value] = line.split("=").map((s) => s.trim());
    return { key, value: value.replace(/^"|"$/g, "") };
  });

  const existingVars = await getExistingVariables(workspaceId, token);

  const createOrUpdate = vars.map(async ({ key, value }) => {
    const existing = existingVars.find((v) => v.attributes.key === key);
    const payload = JSON.stringify({
      data: {
        type: "vars",
        attributes: {
          key,
          value,
          category: "terraform",
          hcl: false,
          sensitive: false,
        },
        relationships: {
          workspace: {
            data: { type: "workspaces", id: workspaceId },
          },
        },
      },
    });

    const options = {
      hostname: "app.terraform.io",
      method: existing ? "PATCH" : "POST",
      path: existing
        ? `/api/v2/vars/${existing.id}`
        : `/api/v2/workspaces/${workspaceId}/vars`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    return makeRequest(options, payload);
  });

  return Promise.all(createOrUpdate);
}

async function downloadTfvarsFromWorkspace(workspaceId, outputPath, token) {
  const variables = await getExistingVariables(workspaceId, token);
  const terraformVars = variables.filter(
    (v) => v.attributes.category === "terraform"
  );

  const content = terraformVars
    .map((v) => `${v.attributes.key} = ${v.attributes.value}`)
    .join("\n");
  fs.writeFileSync(outputPath, content);
}

function getExistingVariables(workspaceId, token) {
  const options = {
    hostname: "app.terraform.io",
    path: `/api/v2/workspaces/${workspaceId}/vars`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.api+json",
    },
  };

  return makeRequest(options).then((res) => res.data);
}

// 👇 Export como ESM
export { uploadTfvarsToWorkspace, downloadTfvarsFromWorkspace };
