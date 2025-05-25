import * as vscode from "vscode";
import { establishConnection } from "./auth.controller.js";
let instance = null;

export class TfCloudSession {
  constructor(globalState) {
    this.globalState = globalState;
    this.token = null;
    this.organization = null;
  }

  async initialize() {
    const creds = await establishConnection(this.globalState);
    if (!creds) {
      await vscode.commands.executeCommand(
        "setContext",
        "tfcloud.loggedIn",
        false
      );
      return false;
    }

    this.token = creds.token;
    this.organization = creds.organization;

    await vscode.commands.executeCommand(
      "setContext",
      "tfcloud.loggedIn",
      true
    );
    return true;
  }

  getToken() {
    return this.token;
  }

  getOrganization() {
    return this.organization;
  }

  getGlobalState() {
    return this.globalState;
  }

  static async getInstance(globalState) {
    if (!instance) {
      instance = new TfCloudSession(globalState);
      const initialized = await instance.initialize();
      if (!initialized) {
        instance = null;
        return null;
      }
    }
    return instance;
  }

  static reset() {
    instance = null;
  }
}
