# Terraform Cloud Sync

![VSCode Extension](https://img.shields.io/badge/vscode-extension-blue?logo=visualstudiocode)
![Version](https://img.shields.io/badge/version-0.0.1-blue)

> 🔁 Upload and download `.tfvars` files from Terraform Cloud workspaces directly inside Visual Studio Code.

🌍 Available languages: [English](README.md) | [Español](README.es.md)

---

## ✨ Features

- 📤 Upload `.tfvars` files to a selected Terraform Cloud workspace
- 📥 Download `.tfvars` files from any workspace
- 🔐 Secure authentication using your Terraform Cloud API token
- 🌐 Auto-discovery of organizations, projects, and workspaces
- 🧾 View latest runs with status, message, and apply option
- 🗂️ Tree view integration with custom icons
- 🌍 Multilingual UI (auto-detects English or Spanish)

---

## 🚀 Getting Started

### 1. Install the extension

From a `.vsix` file:

```bash
code --install-extension terraform-cloud-sync-0.0.1.vsix

```

---

### 2. Authenticate

- Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
- Run: Terraform Cloud: Iniciar sesión
- Provide your organization name and API token

---

### 3. Upload or download `.tfvars`

- Right-click a workspace from the sidebar
- Choose:
  - `Upload archivo.tfvars`
  - `Download archivo.tfvars`
- Or run the commands from the Command Palette

---

## 📷 Screenshots

> _Add screenshots here showing:_
>
> - Sidebar with workspaces
> - Upload/download dialog
> - Run details panel with apply button

---

## 🧠 Requirements

- Terraform Cloud account
- API token with access to your organization and workspaces

---

## ⚙️ Configuration

No settings required for now. Future versions may support:

- Auto-sync `.tfvars` on save
- Default workspace selection

---

## 📦 Project Structure

```
media/              → SVG icons (light/dark)
src/
  panels/           → Webview renderers
  services/         → API integration
  tree/             → Sidebar logic
  utils/            → Helpers (i18n, templating)
templates/          → Handlebars HTML templates
```

---

## 👨‍💻 Author

**Jose Antúnez**
GitHub: [@joseantunez](https://github.com/blca88)

---
