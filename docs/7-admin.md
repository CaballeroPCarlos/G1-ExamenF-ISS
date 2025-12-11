
# **Funcionamiento del módulo administrativo**

El sistema implementa una interfaz administrativa que permite listar usuarios, promoverlos a **ADMIN** o degradarlos a **USUARIO**. Este proceso combina validaciones en el cliente y en la API, evitando accesos indebidos y asegurando que solo un administrador legítimo pueda ejecutar cambios de privilegios.

---

## **1. Lógica en el Cliente (admin/page.js)**

### **a) Verificación del usuario autenticado**

El componente inicia revisando la información almacenada en `sessionStorage`:

```js
const stored = sessionStorage.getItem("usuario");
if (!stored) {
    setError("No autenticado. Redirigiendo...");
    setTimeout(() => (window.location.href = "/login"), 1500);
    return;
}
```

Luego valida el rol del usuario:

```js
const parsed = JSON.parse(stored);
if (parsed.rol !== "ADMIN") {
    setError("Acceso denegado. Redirigiendo...");
    setTimeout(() => (window.location.href = "/"), 1500);
} else {
    setUsuario(parsed);
}
```

Esto asegura que **solo los administradores accedan** a esta página.

---

### **b) Carga de usuarios**

Una vez validado el usuario, se solicita al backend la lista de usuarios:

```js
const res = await fetch(`/api/admin?usuarioId=${usuario.id}`);
const data = await res.json();
```

Este llamado solo devuelve usuarios distintos al administrador, evitando riesgos como la autodegradación accidental.

---

### **c) Acciones administrativas (promover / degradar)**

El cliente distingue dos operaciones:

#### **Promover a ADMIN**

```js
await fetch("/api/admin", {
    method: "PUT",
    body: JSON.stringify({ id, usuarioId: usuario.id }),
});
```

#### **Degradar a USUARIO**

```js
await fetch("/api/admin", {
    method: "PATCH",
    body: JSON.stringify({ id, usuarioId: usuario.id }),
});
```

Ambas operaciones:

* Deshabilitan temporalmente el botón con `accionando`.
* Muestran mensajes de éxito o error.
* Recargan la lista de usuarios.

---

### **d) Renderizado**

La tabla muestra usuarios junto con botones dinámicos según su rol:

```js
{u.rol === "USUARIO" ? (
    <button onClick={() => promover(u.id)}>Hacer Admin</button>
) : (
    <button onClick={() => degradar(u.id)}>Hacer Usuario</button>
)}
```

Esto mantiene una interfaz intuitiva para la gestión de privilegios.

---

## **2. Lógica en el Servidor (api/admin/route.js)**

La API valida rigurosamente que la acción la realice un **ADMIN real**, independientemente del cliente.

---

### **a) Validación del administrador**

Función compartida por PUT y PATCH:

```js
async function getAdminUserFromBody(body) {
    const adminId = Number(body.usuarioId);
    const admin = await prisma.usuario.findUnique({ where: { id: adminId } });

    if (!admin || admin.rol !== "ADMIN") throw new Error("Acceso denegado");
    return admin;
}
```

Esto impide que un atacante manipule el frontend para hacerse pasar por administrador.

---

### **b) Listado de usuarios (GET)**

Sólo devuelve usuarios distintos al administrador actual:

```js
const usuarios = await prisma.usuario.findMany({
    where: { NOT: { id: admin.id } },
    select: { id, nombre, email, rol }
});
```

---

### **c) Promoción (PUT)**

```js
if (target === admin.id) throw new Error("No puedes modificar tu propio rol");
if (usuario.rol === "ADMIN") throw new Error("El usuario ya es ADMIN");
```

Actualiza el rol:

```js
await prisma.usuario.update({
    where: { id: target },
    data: { rol: "ADMIN" }
});
```

Además queda registrado en logs:

```js
logger.info("ADMIN %s promovió a %s", admin.email, actualizado.email);
```

---

### **d) Degradación (PATCH)**

Aunque similar a PUT, controla el caso inverso:

```js
if (usuario.rol === "USUARIO") throw new Error("El usuario ya es USUARIO");
```

Y aplica la actualización:

```js
data: { rol: "USUARIO" }
```

También registra la acción en logs.

---

# **Conclusión**

El módulo administrativo implementa un flujo robusto de control de privilegios combinando:

* **Validación en cliente** (para usabilidad y modularidad).
* **Validación obligatoria en servidor** (seguridad real).
* **Protección contra auto-modificación de rol**.
* **Registro de auditoría mediante logger**.
* **Interfaz que gestiona estados, errores y procesos en curso**.

La arquitectura asegura que solo administradores legítimos puedan modificar roles, manteniendo tanto la integridad de la aplicación como una experiencia de uso clara y controlada.

---

[Volver](/README.md)
[Anterior](/docs/6-solicitudes.md)
[Siguiente](8-logout.md)
