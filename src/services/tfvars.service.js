import fs from "fs";
import { parse } from "@cdktf/hcl2json";
import { callTFCApi } from "../api/tfc.api.js";

async function getExistingVariables(workspaceId, token) {
  const res = await callTFCApi({
    url: `/workspaces/${workspaceId}/vars`,
    token,
  });
  return res.data.data;
}

function flattenValue(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function isHcl(value) {
  return typeof value !== "string";
}

function formatPayload(key, value, hcl, workspaceId) {
  return {
    data: {
      type: "vars",
      attributes: {
        key,
        value,
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
}

export async function uploadTfvarsToWorkspace(workspaceId, filePath, token) {
  const hclContent = fs.readFileSync(filePath, "utf8");
  const parsed = await parse(filePath, hclContent);
  const parsedVars = Object.entries(parsed);

  const existingVars = await getExistingVariables(workspaceId, token);
  const existingMap = Object.fromEntries(
    existingVars.map((v) => [v.attributes.key, v])
  );

  // Crear o actualizar
  for (const [key, rawValue] of parsedVars) {
    const value = flattenValue(rawValue);
    const hcl = isHcl(rawValue);
    const payload = formatPayload(key, value, hcl, workspaceId);
    const existing = existingMap[key];

    if (existing) {
      if (
        existing.attributes.value !== value ||
        existing.attributes.hcl !== hcl
      ) {
        await callTFCApi({
          method: "patch",
          url: `/vars/${existing.id}`,
          token,
          data: payload,
        });
      }
    } else {
      await callTFCApi({
        method: "post",
        url: `/workspaces/${workspaceId}/vars`,
        token,
        data: payload,
      });
    }
  }

  const parsedKeys = new Set(parsedVars.map(([key]) => key));

  for (const key in existingMap) {
    if (!parsedKeys.has(key)) {
      await callTFCApi({
        method: "delete",
        url: `/vars/${existingMap[key].id}`,
        token,
      });
    }
  }
}

function formatValue(value, hcl) {
  if (hcl) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return `[\n  ${parsed.map((v) => JSON.stringify(v)).join(",\n  ")}\n]`;
      } else if (typeof parsed === "object" && parsed !== null) {
        return (
          "{\n" +
          Object.entries(parsed)
            .map(([k, v]) => `  ${JSON.stringify(k)} = ${JSON.stringify(v)}`)
            .join("\n") +
          "\n}"
        );
      }
    } catch {
      return value;
    }
    return value;
  } else {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
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
    .map((v) => {
      const { key, value, hcl } = v.attributes;
      return `${key} = ${formatValue(value, hcl)}`;
    })
    .join("\n\n");

  fs.writeFileSync(outputPath, content + "\n");
}
