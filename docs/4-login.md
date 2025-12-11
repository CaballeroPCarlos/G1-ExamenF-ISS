
# Funcionamiento del módulo de login

El módulo de autenticación sin JWT utiliza un enfoque directo basado en:

1. **Formulario en frontend**
2. **Validación ligera en UI**
3. **Envío seguro al backend**
4. **Validación estricta en servidor (Zod)**
5. **Verificación del hash Argon2**
6. **Devolución del usuario autenticado**
7. **Persistencia temporal en `sessionStorage`**

Este mecanismo permite mantener un flujo simple y seguro sin necesidad de tokens.

---

## 1. Interfaz de login (`login/page.js`)

El componente es un formulario controlado que captura correo y contraseña, muestra errores y redirige al usuario tras una autenticación exitosa.

Almacena datos en sus estados:

```js
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
```

El manejo del envío ejecuta la comunicación con el backend:

```js
const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
});
```

Luego analiza la respuesta:

```js
if (!data.ok) {
    setError(data.error || "Credenciales incorrectas");
} else {
    sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    router.push("/solicitudes");
}
```

Aquí destacan dos puntos:

* Guarda el usuario en **UserContext** → permite estado global de sesión.
* Guarda temporalmente en **sessionStorage** → mantiene sesión solo mientras la pestaña sigue abierta (medida deliberada para mayor seguridad).

---

## 2. Validación y autenticación en el backend (`api/login/route.js`)

El backend primero define un esquema Zod:

```js
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
```

Esto fuerza entrada válida y evita inyección por datos mal formados.

Luego se busca el usuario en la base de datos:

```js
const usuario = await prisma.usuario.findUnique({
    where: { email: data.email },
});
```

Si no existe:

```js
logger.warn(`Intento de login con correo inexistente: ${data.email}`);
return NextResponse.json({ ok: false, error: "Credenciales incorrectas." }, { status: 401 });
```

---

### Verificación del hash Argon2

El núcleo del proceso de autenticación:

```js
const valido = await argon2.verify(usuario.password, data.password);
```

* `usuario.password` → hash almacenado en BD.
* `data.password` → contraseña original enviada por el cliente.

Si el hash no coincide:

```js
logger.warn(`Contraseña incorrecta para: ${data.email}`);
return NextResponse.json({ ok: false, error: "Credenciales incorrectas." }, { status: 401 });
```

Si es correcto, se registra el acceso:

```js
logger.info(`Login exitoso: usuario ${usuario.email}`);
```

Y se devuelve una respuesta simplificada, sin tokens:

```js
return NextResponse.json({
    ok: true,
    usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
    }
});
```

Esto facilita mantener un frontend sencillo basado en estado.

---

## 3. Integración general del flujo

Una vez autenticado:

* El frontend guarda el usuario temporalmente.
* El contexto global permite acceder al rol y datos del usuario en cualquier vista.
* No se emplean JWT, evitando problemas de expiración, revocación o almacenamiento de tokens.
* El backend registra cada paso relevante mediante **logger**, permitiendo auditoría:

Ejemplo de log:

```js
logger.info(`Login exitoso: usuario ${usuario.email}`);
```

Y para intentos sospechosos:

```js
logger.warn(`Intento de login con correo inexistente: ${data.email}`);
```

Estos mecanismos ayudan a construir un módulo seguro y trazable.

---

# Conclusión

El flujo de login implementa un enfoque **seguro, claro y sin JWT**, compuesto por:

* Validación cliente → mejor experiencia.
* Validación servidor → garantiza integridad.
* Argon2 → protección robusta de contraseñas.
* Contexto + sessionStorage → manejo simple de sesión.
* Winston → auditoría fina de accesos correctos e intentos fallidos.
* Prisma → consultas tipadas y confiables.

El diseño favorece simplicidad sin sacrificar seguridad, manteniendo un control total del ciclo de autenticación.

---

[Volver](/README.md)
[Anterior](/docs/3-registro.md)
[Siguiente](5-dashboard.md)
