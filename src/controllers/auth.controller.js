import * as vscode from "vscode";
import { getOrganizations, validateAuth } from "../services/auth.service.js";
import { translate } from "../utils/i18n.js";
import { getTokenFromOptions } from "../utils/tokenOptions.js";

export async function establishConnection(globalState) {
  const existingToken = globalState.get("tfcloud.token");
  const existingOrg = globalState.get("tfcloud.org");

  if (existingToken && existingOrg) {
    return { token: existingToken, organization: existingOrg };
  }

  const token = await getTokenFromOptions();
  if (!token) return null;

  try {
    const orgs = await getOrganizations(token);

    if (!orgs.length) {
      vscode.window.showErrorMessage(translate.noOrganizationsFound);
      return null;
    }

    const selected = await vscode.window.showQuickPick(
      orgs.map((org) => ({
        label: org.attributes.name,
        description: org.attributes["external-id"],
        id: org.id,
      })),
      { placeHolder: translate.selectOrganization }
    );

    if (!selected) return null;

    const isValid = await validateAuth(selected.label, token);
    if (!isValid) {
      vscode.window.showErrorMessage(translate.invalidToken);
      return null;
    }
    vscode.window.showInformationMessage(translate.connectionEstablishment);

    await globalState.update("tfcloud.token", token);
    await globalState.update("tfcloud.org", selected.label);

    return { token, organization: selected.label };
  } catch (err) {
    vscode.window.showErrorMessage(
      translate.organizationFetchError + err.message
    );
    return null;
  }
}
