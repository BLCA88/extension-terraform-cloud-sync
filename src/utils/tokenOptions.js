import * as vscode from "vscode";
import { translate } from "./i18n.js";
import fs from "fs";
import os from "os";

function getTerraformCLIToken() {
  const credentialsPath = `${os.homedir()}/.terraform.d/credentials.tfrc.json`;

  if (!fs.existsSync(credentialsPath)) {
    vscode.window.showErrorMessage(translate.cliTokenErrorFile);
    return null;
  }

  try {
    const raw = fs.readFileSync(credentialsPath, "utf8");
    const json = JSON.parse(raw);
    const token = json.credentials?.["app.terraform.io"]?.token;

    if (!token) {
      vscode.window.showErrorMessage(translate.cliTokenErrorMissing);
    }

    return token || null;
  } catch {
    vscode.window.showErrorMessage(translate.cliTokenErrorRead);
    return null;
  }
}

export async function getTokenFromOptions() {
  const selection = await vscode.window.showQuickPick(
    [
      {
        label: "$(file)  " + translate.tokenOptionCLI,
        detail: translate.tokenOptionCLIDescription,
        value: "cliToken",
      },
      {
        label: "$(key)  " + translate.tokenOptionManual,
        detail: translate.tokenOptionManualDescription,
        value: "manual",
      },
      {
        label: "$(cloud)  " + translate.tokenOptionWeb,
        detail: translate.tokenOptionWebDescription,
        value: "openWebsite",
      },
    ],
    {
      title: translate.tokenOptionTitle,
      placeHolder: translate.tokenOptionPlaceholder,
    }
  );

  if (!selection) return null;

  switch (selection.value) {
    case "cliToken": {
      const token = getTerraformCLIToken();
      return token || null;
    }

    case "manual":
      return await vscode.window.showInputBox({
        prompt: translate.promptToken,
        password: true,
        ignoreFocusOut: true,
      });

    case "openWebsite":
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://app.terraform.io/app/settings/tokens?source=vscode-terraform"
        )
      );
      return await vscode.window.showInputBox({
        prompt: translate.promptToken,
        password: true,
        ignoreFocusOut: true,
      });

    default:
      return null;
  }
}
