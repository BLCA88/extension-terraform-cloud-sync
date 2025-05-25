import axios from "axios";

export async function callTFCApi({
  method = "get",
  url,
  fullUrl = null,
  token,
  data = null,
  params = {},
  validateStatus = (status) => status >= 200 && status < 400,
}) {
  try {
    const response = await axios({
      method,
      url: fullUrl || `https://app.terraform.io/api/v2${url}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
      data,
      params,
      maxRedirects: 0,
      validateStatus,
    });

    if (response.status === 200) {
      return response;
    }

    if (response.status === 307 && response.headers.location) {
      const redirectRes = await axios.get(response.headers.location);
      return redirectRes;
    }

    if (response.status === 204) return response;

    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (err) {
    throw new Error(
      `Terraform API error: ${err.response?.status} - ${err.message}`
    );
  }
}
