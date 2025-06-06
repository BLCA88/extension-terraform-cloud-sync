# Terraform Cloud Sync

> Sync `.tfvars` and verify runs from Terraform Cloud workspaces — directly from VSCode..

Available languages: [English](README.md) | [Español](README.es.md)

---

## Features

- Upload `.tfvars` files to a selected Terraform Cloud workspace
- Download `.tfvars` files from any workspace
- Secure authentication using your Terraform Cloud API token
- Auto-discovery of organizations, projects, and workspaces
- View latest runs with status, message, and apply option
- Tree view integration with custom icons
- Multilingual UI (auto-detects English or Spanish)

---

## Getting Started

### 1. Install the extension

From a `.vsix` file:

```bash
code --install-extension terraform-cloud-sync-0.1.0.vsix

```

---

### 2. Authenticate

- Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
- Run: `Terraform Cloud: Connect`
- You can choose from these 3 methods:
  - Use an existing token from the `~/.terraform.d/credentials.tfrc.json` file
  - Manually enter a token
  - Generate a new token directly from Terraform Cloud
- The extension automatically detects the organization linked to the token

---

### 3. Upload or download `.tfvars` files

- Right-click on a workspace in the sidebar
- Choose one of the available options:
  - `Upload .tfvars file`
  - `Download .tfvars file`
- You can also run these commands from the command palette

---

### 4. View runs and details

- Click on a **workspace** to list recent _runs_ in the "RUNS" sidebar panel
- Then click on any of the _runs_ to open an **interactive web panel**
- Inside the panel you'll find:
  - The run status (`pending`, `planned`, etc.)
  - Detected changes in the plan
  - Associated Git metadata (branch, commit, author)
  - A button to apply the plan (if available)

---

## Screenshots

>

---

## Requirements

- Terraform Cloud account
- API token with access to your organization and workspaces

---

## Configuration

No settings required for now. Future versions may support:

- Auto-sync `.tfvars` on save
- Generate new runs
- View the tfstate of terraform in detail and download it.
- Force unlock
- More details on the web panel.

---

## Project Structure

```
media/              → SVG icons (light/dark)
src/
  api/              → Base client for reusable HTTP calls
  controllers/      → Main logic and VSCode event controllers
  panels/           → Webview renderers
  services/         → API integration
  tree/             → Sidebar logic
  template/         → Webview Panel template loading and compilation
  utils/            → Helpers (i18n, templating)
  extension.js        → Main entry file for activating the extension and registering commands and views
```

---

## Author

**Jose Antúnez**
GitHub: [@joseantunez](https://github.com/blca88)

---
