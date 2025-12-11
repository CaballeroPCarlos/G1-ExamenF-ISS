## **Título: Funcionamiento integrado del Layout, Contexto Global y Header**

El archivo `layout.js` establece la estructura base de toda la aplicación. Desde el inicio incorpora fuentes optimizadas y estilos globales:

```js
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
```

Luego define el diseño general, colocando el UserProvider y el Header dentro del `<body>` para que todos los componentes puedan acceder al estado global del usuario:

```jsx
<UserProvider>
  <Header />
  <main>{children}</main>
</UserProvider>
```

Con esto, cualquier página renderizada dentro de `children` comparte el mismo contexto de usuario y mantiene un encabezado y pie de página uniformes.

---

El archivo `context/UserContext.js` crea un contexto que conserva los datos del usuario autenticado. Declara un estado global accesible desde cualquier componente:

```js
export const UserContext = createContext({
  usuario: null,
  setUsuario: () => {}
});
```

Además, recupera la sesión almacenada al recargar la página:

```js
useEffect(() => {
  const stored = sessionStorage.getItem("usuario");
  if (stored) setUsuario(JSON.parse(stored));
}, []);
```

De esta forma, la autenticación persiste entre recargas y mantiene la interfaz coherente.

---

El archivo `styles/globals.css` define estilos globales que afectan a toda la aplicación: suavizado de texto, eliminación de márgenes, corrección del overflow horizontal y estilo uniforme para enlaces:

```css
html, body {
  overflow-x: hidden;
  font-size: 1.05rem;
}
* {
  box-sizing: border-box;
  margin: 0;
}
```

Esto garantiza una base visual estable y consistente.

---

El componente `Header.js` utiliza el UserContext para mostrar opciones diferentes según el usuario esté autenticado o no:

```js
const { usuario, setUsuario } = useContext(UserContext);
```

Si existe un usuario, se muestran enlaces adicionales como Solicitudes o Admin:

```jsx
{usuario && usuario.rol === "ADMIN" && (
  <Link href="/admin">Admin</Link>
)}
```

También implementa la función de cierre de sesión:

```js
const handleLogout = () => {
  sessionStorage.removeItem("usuario");
  setUsuario(null);
  router.push("/login");
};
```

Esto elimina la sesión, actualiza el contexto y redirige automáticamente.

---

En conjunto, el Layout define la estructura general, el contexto administra el estado global del usuario, los estilos garantizan coherencia visual y el Header adapta dinámicamente la interfaz según la autenticación. El resultado es un sistema ordenado, reactivo y seguro, donde cada capa está conectada para ofrecer consistencia y control del flujo del usuario.

---

[Volver](/README.md)
[Anterior](/docs/1-middleware.md)
[Siguiente](3-registro.md)
