
# Funcionamiento del módulo de registro

El módulo implementa un **flujo completo y seguro de registro de usuarios**, abarcando interacción en frontend, validación, comunicación con backend, hashing de contraseñas y persistencia en la base de datos.

A continuación se detalla cada pieza del sistema y cómo cooperan entre sí.

---

## 1. Vista de Registro (`registro/page.js`)

El componente gestiona el formulario, valida datos en el cliente y envía la solicitud al backend.
Utiliza estados locales para controlar entradas, errores y mensajes de éxito.

Un fragmento representativo:

```js
const [nombre, setNombre] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
```

Antes de enviar la solicitud realiza validaciones básicas:

```js
if (nombre.trim().length < 3) {
    setError("El nombre debe tener al menos 3 caracteres.");
    return;
}
```

Si todo está correcto, envía la petición al backend:

```js
await fetch("/api/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password }),
});
```

Ante un registro exitoso muestra feedback y redirige al login:

```js
setSuccess("Usuario registrado correctamente...");
setTimeout(() => router.push("/login"), 1500);
```

---

## 2. Componentes auxiliares

### **InputField**

Abstrae los campos de entrada del formulario, agregando estilo, eventos de enfoque y soporte para textareas.

Fragmento:

```js
<input
    type={type}
    value={value}
    onChange={onChange}
    onFocus={handleFocus}
    onBlur={handleBlur}
/>
```

Esto reduce duplicación y mantiene coherencia visual en todo el proyecto.

### **AlertMessage**

Muestra mensajes de error, éxito o información con estilos diferenciados.
Incluye autodesaparición mediante temporizador:

```js
useEffect(() => {
    if (duration > 0) {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }
}, [duration]);
```

---

## 3. API de Registro (`api/registro/route.js`)

Aquí se procesan los datos del formulario, se validan, se registran logs, se hashea la contraseña y se guarda el usuario en la base de datos.

### **Validación con Zod**

Se define un esquema estricto:

```js
const schema = z.object({
    nombre: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});
```

Luego se valida el cuerpo recibido:

```js
const data = schema.parse(body);
```

### **Verificación de duplicado**

Se impide registrar el mismo correo dos veces:

```js
const existe = await prisma.usuario.findUnique({
    where: { email: data.email },
});
```

### **Hash seguro**

La contraseña no se guarda en texto plano; se usa **Argon2**, uno de los algoritmos más seguros:

```js
const hashedPassword = await argon2.hash(data.password);
```

### **Creación del usuario**

Se persistente en la base de datos con rol por defecto "USUARIO":

```js
const usuario = await prisma.usuario.create({
    data: { nombre, email, password: hashedPassword, rol: "USUARIO" },
});
```

### **Respuesta estructurada**

No se devuelve contraseña ni token, solo datos públicos:

```js
{
    ok: true,
    usuario: {
        id, nombre, email, rol
    }
}
```

En caso de error:

```js
logger.error(`Error en api/registro: ${err.message}`);
```

---

## 4. Logger (`lib/logger.js`)

Se usa **Winston** para registrar eventos importantes del sistema:

* errores → `errores.log`
* advertencias → `warn.log`
* eventos generales → `app.log`

Fragmento:

```js
const logger = createLogger({
    level: "info",
    transports: [
        new transports.File({ filename: "errores.log", level: "error" }),
        new transports.File({ filename: "app.log", level: "info" })
    ],
});
```

En desarrollo, también imprime en consola con colores.
Esto garantiza trazabilidad y auditoría, útil para el módulo seguro.

---

## 5. Cliente de base de datos (`lib/prisma.js`)

Gestiona la instancia de Prisma y evita múltiples conexiones durante desarrollo:

```js
if (!global.prisma) {
    global.prisma = new PrismaClient({
        log: ["query", "info", "warn", "error"],
    });
}
```

Esto reduce consumo de recursos y previene errores "Too many connections".

---

## 6. Modelo de Datos (`prisma/schema.prisma`)

Define la estructura SQL del sistema.
El modelo `Usuario` incluye:

```prisma
model Usuario {
  id        Int      @id @default(autoincrement())
  nombre    String
  email     String   @unique
  password  String
  rol       Rol      @default(USUARIO)
}
```

Y el modelo `Solicitud` permite la relación 1:N con los usuarios:

```prisma
usuarioId Int
usuario   Usuario @relation(fields: [usuarioId], references: [id])
```

El uso de enums como `Rol` y `EstadoSolicitud` aumenta la seguridad del dominio.

---

# Conclusión general

Este flujo de registro integra adecuadamente:

* **Validaciones en frontend** para mejorar UX.
* **Validaciones en backend con Zod** para asegurar integridad.
* **Hashing robusto (Argon2)** antes de guardar contraseñas.
* **Prisma** como ORM seguro y tipado.
* **Logs estructurados** para auditoría.
* **Componentización de inputs y alertas** para orden y accesibilidad.

En conjunto, el módulo cumple con buenas prácticas de seguridad, escalabilidad y claridad en el código.

---

[Volver](/README.md)
[Anterior](/docs/2-layout.md)
[Siguiente](4-login.md)
