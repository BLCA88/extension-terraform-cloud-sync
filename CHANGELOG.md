# Registro de Cambios

Todos los cambios relevantes de este proyecto se documentan en este archivo.

Este proyecto sigue las reglas de [Versionado Semántico](https://semver.org/lang/es/).

---

## [0.1.0] - 2025-05-25

### Agregado

- Autenticación mejorada con detección automática de la organización desde el token
- Soporte para seleccionar token desde `credentials.tfrc.json`, ingreso manual o generación automática
- Visualización de _runs_ en el panel lateral al seleccionar un workspace
- Panel web interactivo para ver detalles del run, cambios detectados y aplicar el plan
- Íconos dinámicos (Codicons) según el estado del run (`pending`, `planned`, `errored`, etc.)
- Advertencia visible cuando un run está pendiente por otro en progreso
- Soporte para mostrar la fecha local según la configuración regional del sistema
- Iconos de la barra lateral ocultos cuando no hay sesión iniciada (`tfcloud.loggedIn`)
- Eliminación del TreeView cuando se cierra la sesión
- Tooltips dinámicos al pasar el mouse sobre ítems del árbol

### Cambiado

- Refactorización de `TfCloudSession` como singleton centralizado para manejar credenciales
- Separación clara de comandos para login, logout y refresh
- Reconstrucción dinámica del TreeView con `createTreeViews` al iniciar sesión

### Corregido

- Error al acceder a `planId` cuando el plan aún no estaba listo
- Error de ejecución al seleccionar un run vacío (`run.id` indefinido)
- Problemas de refresco del árbol al cerrar sesión

---

## [0.0.1] - 2025-05-19

### Agregado

- Lanzamiento inicial de **Terraform Cloud Sync**
- Subir archivos `.tfvars` a un workspace de Terraform Cloud
- Descargar archivos `.tfvars` desde un workspace
- Panel con detalles del run y soporte para aplicar el plan
- Integración con TreeView e iconos personalizados
- Soporte multilenguaje (i18n) con detección automática de inglés o español
- Iconos SVG adaptables para temas claros y oscuros
