
# **1. Pruebas de `/api/admin`**

Estas pruebas validan la **gestión de usuarios por parte de un administrador**, verificando que solo un usuario con rol `ADMIN` pueda listar, promover o degradar cuentas.
Todo funciona simulando el comportamiento real mediante *mocks* de Prisma y del logger.

### **a) GET — Validación de permisos y listado de usuarios**

Fragmento clave:

```js
prisma.usuario.findUnique.mockResolvedValue({ id: 2, rol: "USUARIO" });
```

El test simula que quien hace la solicitud no es administrador. Por tanto, el resultado esperado es:

```js
expect(res.status).toBe(403);
```

Luego, se prueba el caso correcto simulando:

```js
prisma.usuario.findUnique.mockResolvedValue({ id: 1, rol: "ADMIN" });
prisma.usuario.findMany.mockResolvedValue([{ id: 2, nombre: "Ana" }]);
```

Esto valida la **ruta completa de listados**, asegurando que solo los administradores pueden acceder al catálogo de usuarios.

---

### **b) PUT — Promover usuario a ADMIN**

El test simula dos consultas consecutivas:

1. El solicitante → debe ser admin
2. El usuario objetivo → su información actual

```js
prisma.usuario.findUnique
  .mockResolvedValueOnce({ id: 1, rol: "ADMIN" })
  .mockResolvedValueOnce({ id: 2, rol: "USUARIO" });
```

Luego se simula el cambio:

```js
prisma.usuario.update.mockResolvedValue({
    id: 2, rol: "ADMIN"
});
```

El objetivo es verificar que la API **permite elevar privilegios** correctamente.

---

### **c) PATCH — Degradar usuario a USUARIO**

Funciona igual que el caso anterior, pero en dirección contraria:

```js
prisma.usuario.update.mockResolvedValue({
    id: 2,
    rol: "USUARIO"
});
```

El test asegura que la API **gestiona la reducción de privilegios** con la misma lógica de seguridad.

---

# **2. Pruebas de `/api/login`**

Estas pruebas validan la lógica central de autenticación: validaciones, búsqueda de usuario y verificación de contraseñas mediante Argon2.

### **a) Rechazo de credenciales vacías**

```js
const req = { json: async () => ({ email: "", password: "" }) };
expect(res.status).toBe(400);
```

Aquí se confirma que la API **impone validaciones estrictas** antes de consultar la base de datos.

---

### **b) Usuario inexistente**

```js
prisma.usuario.findUnique.mockResolvedValue(null);
```

Esto simula que el email ingresado no existe. La API debe devolver:

```js
expect(res.status).toBe(401);
```

Garantiza que no se filtra información sensible (p.e. diferenciación entre email válido o inválido).

---

### **c) Login correcto**

```js
jest.spyOn(argon2, "verify").mockResolvedValue(true);
```

Este mock evita usar el hash real, pero simula exitosamente la verificación.
El test confirma que se devuelve el usuario correcto, validando todo el flujo principal.

---

# **3. Pruebas de `/api/registro`**

Evalúan validaciones con **Zod**, detección de duplicados y creación de usuarios con contraseña encriptada.

### **a) Datos inválidos**

El test proporciona valores que no cumplen los esquemas definidos en Zod:

```js
nombre: "Ca",
email: "mal",
password: "12"
```

La API debe responder:

```js
expect(res.status).toBe(400);
expect(res.json.ok).toBe(false);
```

Este test cubre la robustez de las validaciones antes de crear cuentas.

---

### **b) Correo ya registrado**

```js
prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
```

La API debe evitar duplicados:

```js
expect(res.json.error).toContain("ya está registrado");
```

Garantiza la integridad del sistema y evita conflictos.

---

### **c) Registro correcto**

Simulando que el correo no existe:

```js
prisma.usuario.findUnique.mockResolvedValue(null);
```

Y que Argon2 genera un hash válido:

```js
jest.spyOn(argon2, "hash").mockResolvedValue("hashed-password");
```

La API debe crear al usuario:

```js
expect(res.status).toBe(201);
```

Estas pruebas en conjunto validan el flujo seguro de creación de cuentas.

---

# **4. Pruebas de `/api/solicitudes`**

Evalúan el módulo de solicitudes, diferenciando permisos entre usuarios comunes y administradores.

---

### **a) GET — Solo ver solicitudes propias (si no es admin)**

```js
prisma.usuario.findUnique.mockResolvedValue({
    id: 1,
    rol: "USUARIO"
});
```

Luego se simula la recuperación:

```js
prisma.solicitud.findMany.mockResolvedValue([{ id: 1, titulo: "A" }]);
```

La API debe devolver solo las solicitudes del usuario correspondiente.
Este test verifica **control de acceso por rol y por identificación**.

---

### **b) POST — Crear solicitud válida**

Sin validaciones de rol (cualquier usuario puede crear):

```js
prisma.solicitud.create.mockResolvedValue({
    id: 10,
    titulo: "Prueba",
    descripcion: "Desc",
    usuarioId: 1
});
```

Valida que el endpoint crea correctamente la solicitud.

---

### **c) PUT — Actualizar estado (solo administrador)**

El solicitante debe ser admin:

```js
prisma.usuario.findUnique.mockResolvedValue({
    id: 1,
    rol: "ADMIN"
});
```

Simulación del cambio de estado:

```js
prisma.solicitud.update.mockResolvedValue({
    id: 5,
    estado: "APROBADO"
});
```

La lógica de verificación de permisos queda completamente cubierta.

---

# **5. Configuración de pruebas**

### **`.babelrc`**

Permite a Jest interpretar los archivos de Next.js con:

```json
{ "presets": ["next/babel"] }
```

---

### **`jest.config.mjs`**

Define:

* el entorno Node,
* la transformación con Babel,
* el mapeo de alias `@/`,
* y los archivos de configuración previos a cada test.

Esto integra correctamente Jest con Next.js.

---

### **`jest.setup.js`**

Se crea un mock minimalista de `NextResponse`:

```js
NextResponse: {
    json: (data, init = {}) => ({ json: data, status: init.status ?? 200 })
}
```

Esto permite ejecutar los endpoints en un entorno aislado sin cargar Next.js completo.

---

# **Conclusión general**

Las pruebas cubren:

1. **Autenticación**
2. **Registro seguro mediante hash Argon2 y Zod**
3. **Control estricto de roles en la administración**
4. **Gestión completa del ciclo de vida de solicitudes**
5. **Base de tests construida únicamente con mocks**, asegurando velocidad y aislamiento.

El conjunto conforma un **módulo seguro, coherente y validado**, donde cada ruta API es probada en su lógica interna sin dependencias externas.

---

[Volver](/README.md)
[Anterior](/docs/8-logout.md)
