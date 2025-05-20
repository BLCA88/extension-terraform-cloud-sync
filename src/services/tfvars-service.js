import fs from "fs";
import axios from "axios";

const api = axios.create({
  baseURL: "https://app.terraform.io/api/v2",
  headers: {
    "Content-Type": "application/vnd.api+json",
  },
});

async function getExistingVariables(workspaceId, token) {
  const res = await api.get(`/workspaces/${workspaceId}/vars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
}

export async function uploadTfvarsToWorkspace(workspaceId, filePath, token) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.includes("="));

  const vars = lines.map((line) => {
    const [key, value] = line.split("=").map((s) => s.trim());
    return { key, value: value.replace(/^"|"$/g, "") };
  });

  const existingVars = await getExistingVariables(workspaceId, token);

  const createOrUpdate = vars.map(async ({ key, value }) => {
    const existing = existingVars.find((v) => v.attributes.key === key);
    const method = existing ? "patch" : "post";
    const url = existing
      ? `/vars/${existing.id}`
      : `/workspaces/${workspaceId}/vars`;

    const payload = {
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
    };

    const res = await api({
      method,
      url,
      data: payload,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  });

  return Promise.all(createOrUpdate);
}

export async function downloadTfvarsFromWorkspace(
  workspaceId,
  outputPath,
  token
) {
  const variables = await getExistingVariables(workspaceId, token);
  const terraformVars = variables.filter(
    (v) => v.attributes.category === "terraform"
  );

  const content = terraformVars
    .map((v) => `${v.attributes.key} = ${v.attributes.value}`)
    .join("\n");

  fs.writeFileSync(outputPath, content);
}
