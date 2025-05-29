import fs from "fs";
import { parse } from "@cdktf/hcl2json";
import { callTFCApi } from "../api/tfc.api.js";

async function getExistingVariables(workspaceId, token) {
  const data = await callTFCApi({
    url: `/workspaces/${workspaceId}/vars`,
    token,
  });

  return data.data.data;
}

function flattenValue(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function isHcl(value) {
  return typeof value !== "string";
}

export async function uploadTfvarsToWorkspace(workspaceId, filePath, token) {
  const hclContent = fs.readFileSync(filePath, "utf8");
  const parsed = await parse(filePath, hclContent); // convierte a JSON

  const existingVars = await getExistingVariables(workspaceId, token);

  const entries = Object.entries(parsed);

  const createOrUpdate = entries.map(async ([key, value]) => {
    const stringifiedValue = flattenValue(value);
    const hcl = isHcl(value);

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
          value: stringifiedValue,
          category: "terraform",
          hcl,
          sensitive: false,
        },
        relationships: {
          workspace: {
            data: { type: "workspaces", id: workspaceId },
          },
        },
      },
    };

    const res = await callTFCApi({
      method,
      url,
      token,
      data: payload,
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
