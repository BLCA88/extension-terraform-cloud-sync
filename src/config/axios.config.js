import axios from "axios";

export const api = axios.create({
  baseURL: "https://app.terraform.io/api/v2",
  headers: {
    "Content-Type": "application/vnd.api+json",
  },
});
