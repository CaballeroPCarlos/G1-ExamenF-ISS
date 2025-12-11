## Explicación del funcionamiento de `src/middleware.js`

El archivo `src/middleware.js` define un middleware de Next.js cuyo propósito es añadir una capa de seguridad previa al procesamiento de las rutas del módulo de solicitudes. No realiza autenticación, pero sí incorpora cabeceras que fortalecen la protección desde el navegador.

Su funcionamiento es simple: antes de que la petición llegue al endpoint, genera una respuesta base con `NextResponse.next()`, añade las cabeceras de seguridad y la devuelve. Esto asegura que cada solicitud hacia las rutas protegidas reciba medidas mínimas de defensa sin modificar la lógica interna.

Cabeceras aplicadas:

* X-DNS-Prefetch-Control: off — evita la pre-resolución DNS.
* X-Frame-Options: DENY — bloquea la carga en iframes y previene clickjacking.
* X-Content-Type-Options: nosniff — evita la interpretación de tipos MIME incorrectos.
* Referrer-Policy: no-referrer — impide filtraciones de información en la cabecera referer.
* X-XSS-Protection: 1; mode=block — habilita un filtro básico contra XSS.

El middleware solo se aplica a rutas bajo `/api/solicitudes`, gracias al matcher configurado. Esto concentra la seguridad en las operaciones más sensibles del sistema sin intervenir en el resto de módulos.

En resumen, actúa como una barrera defensiva ligera pero esencial, mitigando riesgos como clickjacking, XSS, sniffing de MIME y fugas de referrer, sin añadir complejidad adicional al flujo de autenticación.

---

[Volver](/README.md)
[Anterior](/docs/0-estructura.md)
[Siguiente](/docs/2-layout.md)
