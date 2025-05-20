import * as vscode from "vscode";

export function getProviderImage(providerName, panel, extensionUri) {
  const baseUri = vscode.Uri.joinPath(extensionUri, "media", "providers");

  const resolveImage = (fileName) =>
    panel.webview
      .asWebviewUri(vscode.Uri.joinPath(baseUri, fileName))
      .toString();

  if (providerName === "registry.terraform.io/hashicorp/aws") {
    return resolveImage("aws.png");
  }

  if (providerName.startsWith("registry.terraform.io/nullplatform")) {
    return resolveImage("nullplatform.png");
  }

  if (providerName.startsWith("registry.terraform.io/hashicorp/")) {
    return resolveImage("hashicorp.png");
  }

  if (providerName.startsWith("registry.terraform.io/azure/")) {
    return resolveImage("azure.png");
  }

  if (providerName.startsWith("registry.terraform.io/google/")) {
    return resolveImage("gcp.png");
  }

  return null;
}
