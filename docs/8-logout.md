
# **Funcionamiento de `api/logout/route.js`**

Este endpoint implementa un **logout simplificado**, ya que el proyecto no utiliza JWT ni cookies de autenticación. Su propósito es ofrecer una salida coherente dentro del flujo de sesión, registrando la acción y devolviendo una respuesta uniforme al cliente.

---

## **1. Importaciones esenciales**

El módulo utiliza `NextResponse` para generar respuestas HTTP y un `logger` para registrar eventos:

```js
import { NextResponse } from "next/server";
import logger from "@/lib/logger";
```

Esto permite manejar respuestas JSON y mantener auditoría básica.

---

## **2. Punto de entrada: método POST**

El logout se expone únicamente como petición **POST**, respetando buenas prácticas de diseño REST para acciones que modifican el estado de la sesión.

```js
export async function POST() {
    try {
        logger.info("Logout simulado (sin JWT ni cookies)");
```

Desde el inicio se registra el evento, lo cual es relevante para auditoría y trazabilidad, especialmente en sistemas con control de accesos.

---

## **3. Respuesta exitosa: sesión cerrada**

El endpoint no tiene que invalidar tokens ni borrar cookies, porque el sistema usa `sessionStorage` en el cliente. Por ello, el servidor únicamente responde:

```js
return NextResponse.json(
    { ok: true, message: "Sesión cerrada" },
    { status: 200 }
);
```

La responsabilidad real de “cerrar sesión” recae en el cliente, que debe limpiar su almacenamiento local.

---

## **4. Manejo de errores**

Si ocurre algún fallo interno, se registra el error y se devuelve una respuesta clara al cliente:

```js
} catch (err) {
    logger.error(`Error en logout: ${err.message}`);
    return NextResponse.json(
        { ok: false, error: "Error al cerrar la sesión." },
        { status: 500 }
    );
}
```

Esto protege contra fallos inesperados y garantiza uniformidad en la estructura de errores.

---

# **Conclusión**

El endpoint `/api/logout` proporciona un mecanismo de cierre de sesión coherente y seguro dentro de un sistema sin tokens ni cookies. Registra la acción para auditoría, devuelve un estado predecible y centraliza la responsabilidad del logout, mientras que el cliente se encarga de limpiar los datos locales de la sesión.

---

[Volver](/README.md)
[Anterior](/docs/7-admin.md)
[Siguiente](9-pruebas.md)
