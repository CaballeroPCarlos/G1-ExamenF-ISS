
# Funcionamiento del módulo de **Gestión de Solicitudes**

El flujo completo combina **interfaz**, **autenticación**, **modales**, **tabla interactiva** y **API segura con Prisma + Zod**. La página permite crear solicitudes, listarlas, y que un administrador apruebe, rechace o elimine registros.

---

## 1. Página principal: `solicitudes/page.js`

### a) Carga del usuario con `useAuth()`

La página obtiene el usuario autenticado mediante el hook:

```js
const { usuario } = useAuth();
```

Si no hay usuario, la página no continúa:

```js
if (!usuario) return <p>Redirigiendo al login...</p>;
```

### b) Obtención de solicitudes

La función `fetchSolicitudes()` hace una consulta a la API.
El usuario ADMIN recibe todas; los demás solo las suyas:

```js
const res = await fetch(`/api/solicitudes?usuarioId=${usuario.id}`, { method: "GET" });
```

La respuesta se guarda en el estado:

```js
if (data.ok) setSolicitudes(data.solicitudes);
```

### c) Crear solicitudes

El formulario ejecuta `handleCrear()`:

```js
await fetch("/api/solicitudes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titulo, descripcion, usuarioId: usuario.id }),
});
```

Aquí se valida input básico en el frontend antes de enviarlo.

### d) Actualizar (ADMIN)

El administrador puede seleccionar una solicitud y abrir un modal:

```js
onUpdate={(s) => {
    setSelectedSolicitud(s);
    setModalOpen(true);
}}
```

El modal confirma el cambio:

```js
handleActualizar(selectedSolicitud.id, selectedSolicitud.estado)
```

Esto envía un **PUT**:

```js
await fetch("/api/solicitudes", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id, estado: nuevoEstado, usuarioId: usuario.id }),
});
```

### e) Eliminar (ADMIN)

El botón *Eliminar* llama:

```js
await fetch(`/api/solicitudes?id=${id}&usuarioId=${usuario.id}`, { method: "DELETE" });
```

Solo ADMIN puede hacer esta operación.

---

## 2. Hook de autenticación: `useAuth.js`

Gestiona acceso sin JWT, usando **sessionStorage**:

### a) Inicialización

```js
const storedUser = sessionStorage.getItem("usuario");
```

Si el usuario no existe o no tiene el rol requerido:

```js
router.replace("/login");
```

### b) Login / Logout

El hook permite guardar y eliminar el usuario:

```js
sessionStorage.setItem("usuario", JSON.stringify(usuarioData));
```

```js
sessionStorage.removeItem("usuario");
```

Este estado controla toda la interfaz protegida.

---

## 3. Modal reutilizable: `Modal.js`

El modal solo se renderiza si está abierto:

```js
if (!isOpen) return null;
```

El fondo oscuro permite cerrar si se hace clic afuera:

```js
onClick={onClose}
```

El contenido evita el cierre accidental:

```js
onClick={(e) => e.stopPropagation()}
```

Y el botón **Confirmar** ejecuta la acción enviada desde la página:

```js
onClick={onSubmit}
```

---

## 4. Tabla dinámica: `SolicitudesTable.js`

Muestra todas las solicitudes, con acciones condicionadas por rol.

### Renderización principal

```js
{solicitudes.map((s) => (
  <tr key={s.id}>
    <td>{s.id}</td>
    <td>{s.titulo}</td>
    <td>{s.descripcion}</td>
    <td>{s.estado}</td>
    <td>{s.usuario?.nombre}</td>
```

### Acciones según el rol

```js
{rol === "ADMIN" ? (
  <>
    <button onClick={() => onUpdate(s)}>Actualizar</button>
    <button onClick={() => onDelete(s.id)}>Eliminar</button>
  </>
) : (
  <span>Sin permisos</span>
)}
```

---

## 5. API Backend: `api/solicitudes/route.js`

La API implementa validación, acceso por rol y operaciones CRUD con Prisma.

---

### ✔ GET — Listar solicitudes

Primero identifica al usuario:

```js
const usuarioId = Number(searchParams.get("usuarioId"));
const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
```

Si es ADMIN devuelve todas:

```js
await prisma.solicitud.findMany({ include: { usuario: true } })
```

Si no, solo las suyas:

```js
await prisma.solicitud.findMany({
  where: { usuarioId },
  include: { usuario: true },
});
```

---

### ✔ POST — Crear solicitud

Valida con **Zod**:

```js
const data = crearSchema.parse(body);
```

Luego crea registro:

```js
await prisma.solicitud.create({ data });
```

---

### ✔ PUT — Actualizar estado (solo ADMIN)

Valida la estructura:

```js
const data = actualizarSchema.parse(body);
```

Verifica privilegio:

```js
if (usuario.rol !== "ADMIN") return 403;
```

Actualiza:

```js
await prisma.solicitud.update({
  where: { id: data.id },
  data: { estado: data.estado },
});
```

---

### ✔ DELETE — Eliminar (solo ADMIN)

Obtiene parámetros:

```js
const id = Number(searchParams.get("id"));
```

Verifica ADMIN:

```js
if (usuario.rol !== "ADMIN") return 403;
```

Elimina:

```js
await prisma.solicitud.delete({ where: { id } });
```

---

# Conclusión general

Este módulo funciona como un sistema completo de gestión donde:

* **El frontend** controla autenticación local, formularios y visualización interactiva.
* **El hook `useAuth`** asegura que solo usuarios con rol válido accedan.
* **La tabla y los modales** permiten interacción fluida sin recargar la página.
* **La API** implementa validaciones fuertes con Zod y permisos estrictos.
* **Prisma** maneja el acceso seguro a la base de datos.

El conjunto crea una solución coherente, segura y modular para gestionar solicitudes con roles diferenciados entre usuario estándar y administrador.

---

[Volver](/README.md)
[Anterior](/docs/5-dashboard.md)
[Siguiente](7-admin.md)
