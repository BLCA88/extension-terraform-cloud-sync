import { callTFCApi } from "../api/tfc.api.js";

export async function getOrganizations(token) {
  try {
    const res = await callTFCApi({
      url: "/organizations",
      token,
    });

    return res.data.data;
  } catch {
    return false;
  }
}

export async function validateAuth(org, token) {
  try {
    const res = await callTFCApi({
      url: `/organizations/${org}/projects?page[size]=1`,
      token,
    });

    return res.data;
  } catch {
    return false;
  }
}
