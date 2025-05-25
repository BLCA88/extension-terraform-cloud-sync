import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Handlebars.registerHelper("actionColor", function (action) {
  switch (action) {
    case "create":
      return "green";
    case "update":
      return "yellow";
    case "delete":
      return "rose";
    default:
      return "gray";
  }
});

Handlebars.registerHelper("statusCodicon", function (status) {
  switch (status) {
    case "pending":
      return "codicon-debug-pause";
    case "planned":
      return "codicon-check";
    case "applied":
    case "planned_and_finished":
      return "codicon-check-all";
    case "errored":
      return "codicon-error";
    case "discarded":
      return "codicon-chrome-close";
    default:
      return "codicon-question";
  }
});

Handlebars.registerHelper("statusColor", function (status) {
  switch (status) {
    case "pending":
      return "text-blue-400";
    case "applied":
    case "planned":
    case "planned_and_finished":
      return "text-green-400";
    case "errored":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
});

Handlebars.registerHelper("capitalize", function (text) {
  return text?.charAt(0).toUpperCase() + text?.slice(1);
});

Handlebars.registerHelper("slice", (str, start, end) => {
  return str?.slice(start, end);
});

export function renderHandlebarsTemplate(templateName, context = {}) {
  const templatePath = path.join(__dirname, "..", "templates", templateName);
  const source = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(source);
  return template(context);
}
