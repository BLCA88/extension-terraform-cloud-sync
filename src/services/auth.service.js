import axios from "axios";

export async function getOrganizations(token) {
  const response = await axios.get(
    "https://app.terraform.io/api/v2/organizations",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
    }
  );
  return response.data.data;
}

export async function validateAuth(org, token) {
  try {
    const url = `https://app.terraform.io/api/v2/organizations/${org}/projects?page[size]=1`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
    });
    return !!response.data;
  } catch {
    return false;
  }
}
