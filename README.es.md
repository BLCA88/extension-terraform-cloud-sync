# Terraform Cloud Sync

![Extensión VSCode](https://img.shields.io/badge/vscode-extensión-blue?logo=visualstudiocode)
![Versión](https://img.shields.io/badge/version-1.0.0-blue)

> Sincronice `.tfvars` y verifique ejecuciones desde espacios de trabajo de Terraform Cloud, directamente desde VSCode..

---

## Funcionalidades

- Carga de archivos `.tfvars` a cualquier workspaces de Terraform Cloud
- Descarga de archivos `.tfvars` desde cualquier workspace
- Autenticación segura mediante token de Terraform Cloud
- Detección automática de organizaciones, proyectos y workspaces
- Vista detallada de las ejecuciones con estado, mensaje y botón de apply según estado.
- Integración con panel lateral personalizado
- Interfaz multilenguaje (detecta inglés o español automáticamente)

---

## Primeros pasos

### 1. Instalar la extensión

Desde un archivo `.vsix`:

```bash
code --install-extension terraform-cloud-sync-0.0.1.vsix

```

---

### 2. Autenticarse

- Abrí la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`)
- Ejecutá: `Terraform Cloud: Conectar`
- Podés elegir entre estos 3 métodos:
  - Usar un token existente desde el archivo `~/.terraform.d/credentials.tfrc.json`
  - Ingresar el token manualmente
  - Generar uno nuevo directamente desde Terraform Cloud
- La extensión detecta automáticamente la organización asociada al token

---

### 3. Subir o descargar archivos `.tfvars`

- Hacé clic derecho sobre un workspace en la barra lateral
- Elegí una de las opciones:
  - `Subir archivo .tfvars`
  - `Descargar archivo .tfvars`
- También podés ejecutar estos comandos desde la paleta de comandos

---

### 4. Visualizar los runs y detalles

- Hacé clic en un **workspace** para listar los últimos _runs_ en el panel lateral "RUNS"
- Luego, hacé clic en cualquiera de los _runs_ para abrir un **panel web interactivo**
- En este panel podrás ver:
  - El estado del run (`pending`, `planned`, etc.)
  - Cambios detectados en el plan
  - Información de Git asociada (rama, commit, autor)
  - Un botón para aplicar el plan (si está disponible)

---

## Capturas de pantalla

> ![Conectarse](https://private-user-images.githubusercontent.com/108241395/447305361-adb6c566-5bde-4f5a-a49e-9cb2b4772024.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDgxNTA5MDAsIm5iZiI6MTc0ODE1MDYwMCwicGF0aCI6Ii8xMDgyNDEzOTUvNDQ3MzA1MzYxLWFkYjZjNTY2LTViZGUtNGY1YS1hNDllLTljYjJiNDc3MjAyNC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNTI1JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDUyNVQwNTIzMjBaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wNDZmMmY2MDY2NmZjZDkzYzAzMGJmZGM1MzY4MmJkOTFjMGJiNGI5MTA2OTk3MzQwNzU2MDgyYTM5YmM0MGI5JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.PMZ1gNJHIiBBYCNC2s993nntPUW59zvBLZoo66recpY)

---

## Requisitos

- Cuenta activa en Terraform Cloud
- Token de API con permisos de acceso a tu organización y workspaces

---

## Configuración

Actualmente no se requiere configuración adicional. En versiones futuras se podría incluir:

- Sincronización automática de `.tfvars` al guardar
- Generar nuevos runs.
- Consultar en detalle el tfstate de terraform y descargarlo.
- Forzar desbloqueo
- Mas detalles en el panel web.

---

## Estructura del proyecto

```
media/              → Íconos SVG (modo claro/oscuro)
src/
  api/              → Cliente base para llamadas HTTP reutilizables
  controllers/      → Lógica principal y controladores de eventos de VSCode
  panels/           → Renderizado de paneles webview
  services/         → Integración con API de Terraform Cloud
  tree/             → Lógica del árbol lateral
  template/         → Carga y compilación de plantilla Webview Panel
  utils/            → Utilidades (i18n, Handlebars, etc.)
  extension.js        → Archivo principal de activación y registro de comandos y vistas

```

---

## 👨‍💻 Autor

**José Antúnez**  
GitHub: [@joseantunez](https://github.com/blca88)

---
