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
