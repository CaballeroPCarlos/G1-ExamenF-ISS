
# Estructura General del Proyecto**

El proyecto está organizado bajo un patrón claro:

* **Rutas API** en `src/app/api/*` para manejar lógica de servidor (login, registro, solicitudes, administración).
* **Páginas cliente** como `admin/page.js`, `login/page.js`, etc.
* **Componentes reutilizables** (`AlertMessage`, `InputField`, `Modal`, etc.).
* **Contexto** (`UserContext`) para manejar el usuario en memoria.
* **Hooks** como `useAuth` para validar autenticación.
* **Prisma** para acceso seguro a base de datos.
* **Logger** para auditoría.
* **Middleware** para proteger algunas rutas API.
* **Pruebas Jest** para validar las APIs clave.

Todo el sistema se articula a partir de un flujo central: **autenticación + autorización + CRUD seguro**.

---

- [Volver](/README.md)
- [Siguiente](/docs/1-middleware.md)