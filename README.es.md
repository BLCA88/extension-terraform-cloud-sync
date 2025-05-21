# Terraform Cloud Sync

![Extensión VSCode](https://img.shields.io/badge/vscode-extensión-blue?logo=visualstudiocode)
![Versión](https://img.shields.io/badge/version-0.0.1-blue)
![Licencia](https://img.shields.io/badge/license-MIT-green)

> 🔁 Sube y descarga archivos `.tfvars` desde workspaces de Terraform Cloud directamente en Visual Studio Code.

---

## ✨ Funcionalidades

- 📤 Subida de archivos `.tfvars` a workspaces de Terraform Cloud
- 📥 Descarga de archivos `.tfvars` desde cualquier workspace
- 🔐 Autenticación segura mediante token de Terraform Cloud
- 🌐 Detección automática de organizaciones, proyectos y workspaces
- 🧾 Vista detallada del último run con estado, mensaje y botón de apply
- 🗂️ Integración con panel lateral personalizado
- 🌍 Interfaz multilingüe (detecta inglés o español automáticamente)

---

## 🚀 Primeros pasos

### 1. Instalar la extensión

Desde un archivo `.vsix`:

```bash
code --install-extension terraform-cloud-sync-0.0.1.vsix

```

---

### 2. Autenticarse

- Abrí la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`)
- Ejecutá: `Terraform Cloud: Iniciar sesión`
- Ingresá el **nombre de tu organización** y tu **token de API**

---

### 3. Subir o descargar archivos `.tfvars`

- Hacé clic derecho sobre un workspace en la barra lateral
- Elegí una de las opciones:
  - `Subir archivo.tfvars`
  - `Descargar archivo.tfvars`
- También podés ejecutar estos comandos desde la paleta de comandos

---

## 📷 Capturas de pantalla

> _Agregá capturas que muestren:_
>
> - La barra lateral con los workspaces detectados
> - El cuadro de diálogo de subida/descarga
> - El panel con detalles del run y botón "Apply"

---

## 🧠 Requisitos

- Cuenta activa en Terraform Cloud
- Token de API con permisos de acceso a tu organización y workspaces

---

## ⚙️ Configuración

Actualmente no se requiere configuración adicional. En versiones futuras se podría incluir:

- Sincronización automática de `.tfvars` al guardar
- Selección predeterminada de workspace

---

## 📦 Project Structure

```
media/              → Íconos SVG (modo claro/oscuro)
src/
  panels/           → Renderizado de paneles webview
  services/         → Integración con API de Terraform Cloud
  tree/             → Lógica del árbol lateral
  utils/            → Utilidades (i18n, Handlebars, etc.)
templates/          → Plantillas HTML en Handlebars

```

---

## 👨‍💻 Autor

**José Antúnez**  
GitHub: [@joseantunez](https://github.com/blca88)

---

## 🛡️ Licencia

Este proyecto es propietario y de código cerrado.  
No se permite su copia, modificación ni redistribución sin autorización expresa del autor.

Todos los derechos reservados © 2025.
