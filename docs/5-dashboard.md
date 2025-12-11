
## Funcionamiento general de la página principal y sus componentes

La estructura combina lógica de autenticación en cliente, rendering condicional según el rol del usuario y una interfaz simple compuesta por tarjetas enlazables. La interacción entre **page.js**, **CardLink.js** y **page.module.css** define tanto el flujo funcional como la experiencia visual.

---

## 1. Validación del usuario y renderizado condicional (page.js)

La página principal se comporta como un componente cliente (`"use client"`), por lo que puede acceder directamente al `sessionStorage`. El objetivo es verificar si existe un usuario autenticado; de no ser así, redirige al login.

El bloque central es el siguiente:

```js
useEffect(() => {
  const storedUser = sessionStorage.getItem("usuario");

  if (!storedUser) {
    setError("No autenticado. Redirigiendo a login...");
    setTimeout(() => (window.location.href = "/login"), 1500);
    setLoading(false);
    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser);
    setUsuario(parsedUser);
  } catch {
    setError("Error al procesar usuario. Redirigiendo a login...");
    setTimeout(() => (window.location.href = "/login"), 1500);
  } finally {
    setLoading(false);
  }
}, []);
```

Este mecanismo cubre tres aspectos esenciales:

1. **Autenticación mínima en cliente:**
   Si no existe información del usuario, el sistema evita mostrar contenido protegido y redirige de forma segura.

2. **Protección ante datos corruptos:**
   El `try/catch` asegura que un JSON inválido no cause fallos visibles.

3. **Control de estados:**
   Valores como `loading` y `error` gobiernan qué se muestra en pantalla mientras los datos se procesan.

Una vez que el usuario es válido, la página muestra su nombre y rol:

```jsx
<h1>Bienvenido, {usuario.nombre}!</h1>
<p>Tu rol: <strong>{usuario.rol}</strong></p>
```

Además, habilita enlaces específicos según permisos. Por ejemplo, solo un administrador puede ver la sección administrativa:

```jsx
{usuario.rol === "ADMIN" && (
  <CardLink href="/admin" title="Sección Administrativa" description="Accede a funciones de administración." />
)}
```

Este esquema implementa un **control de acceso en interfaz**, complementando el control real que debe existir también en el backend.

---

## 2. Tarjetas navegables con animación (components/CardLink.js)

Este componente encapsula un enlace con estilo de tarjeta interactiva. Emplea un pequeño estado interno para ofrecer animación al pasar el cursor:

```js
const [hover, setHover] = useState(false);
```

El estilo dinámico se aplica directamente al `<a>`:

```jsx
style={{
  transform: hover ? "translateY(-3px)" : "translateY(0)",
  boxShadow: hover ? "0 4px 10px rgba(0,0,0,0.1)" : "none",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
}}
```

Su función es proporcionar retroalimentación visual sin depender de clases adicionales. El contenido se compone del título y la descripción:

```jsx
<h3>{title}</h3>
<p>{description}</p>
```

Este diseño modular permite reutilizar la tarjeta en múltiples partes del proyecto con mínima configuración.

---

## 3. Estilo estructural de la página (page.module.css)

El archivo de estilos define la estructura y la composición general del layout. Destacan tres secciones:

1. **Contenedor principal** (`.page`):
   Centra el contenido y aplica un fondo neutro:

```css
.page {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}
```

2. **Caja del contenido** (`.main`):
   Funciona como un panel limpio, con padding amplio y sombra:

```css
.main {
    padding: 40px 60px;
    max-width: 800px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

3. **Distribución de enlaces** (`.links`):
   Presenta las tarjetas en columna con espaciado consistente:

```css
.links {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
```

Aunque el componente `CardLink` usa estilos inline, el módulo CSS define el layout general y los estilos de tarjetas genéricas utilizadas en otras partes.

---

## Conclusión

La lógica presentada constituye la base funcional de una **página de inicio autenticada**, donde:

* Se valida al usuario en cliente.
* Se muestra contenido adaptado según rol.
* Se ofrecen enlaces interactivos mediante tarjetas reutilizables.
* Se estructura todo dentro de un layout visual limpio y consistente.

El resultado es una vista sencilla pero robusta, diseñada para servir como punto de entrada a las funcionalidades del sistema respetando la seguridad mínima desde el lado del cliente.

---

[Volver](/README.md)
[Anterior](/docs/4-login.md)
[Siguiente](6-solicitudes.md)
