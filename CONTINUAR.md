# Continuar el proyecto

## Estado actual

- Repositorio: `https://github.com/JavierCIPFPD/wiki`
- Rama de publicación: `main`
- GitHub Pages: `https://javiercipfpd.github.io/wiki/`
- Fuente de contenido: `hilos/`
- Configuración pública: `wiki.env`
- Licencia del proyecto: MIT

La wiki es estática. GitHub Pages sirve `index.html`, `styles.css`, `app.js` y las librerías locales de `vendor/`. Al cargar la aplicación, JavaScript consulta la API pública de GitHub, detecta los archivos Markdown de primer nivel dentro de `hilos/` y descarga su contenido desde `raw.githubusercontent.com`.

## Flujo para añadir una página

1. Crear un archivo `.md` o `.markdown` dentro de `hilos/`.
2. Usar el nombre del archivo con la capitalización que se quiera mostrar en el índice.
3. Comprobar la página con un servidor local.
4. Hacer commit y push a `main`.
5. Esperar la reconstrucción de GitHub Pages y recargar la web.

`inicio.md` es la portada y no aparece como entrada del índice. Los guiones y guiones bajos de los demás nombres se muestran como espacios.

## Comprobaciones locales

Desde esta carpeta:

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8018 -t .
```

Abrir `http://127.0.0.1:8018/`. Para una instalación XAMPP normal también funciona `http://localhost/dwec/copilot/wiki/`.

Antes de publicar, comprobar:

```powershell
git diff --check
git status --short --branch
git push origin main
```

## Decisiones técnicas

- `markdown-it` y `DOMPurify` se sirven desde `vendor/`; no se usa CDN.
- El HTML escrito dentro del Markdown está desactivado y el resultado se sanitiza.
- Las imágenes externas deben usar HTTPS.
- YouTube, Vimeo, MP4 y WebM se convierten en reproductores desde enlaces HTTPS.
- La búsqueda carga el contenido de las páginas cuando se utiliza.
- `wiki.env` es público y no debe contener contraseñas, tokens ni claves privadas.
- Los rangos de rendimiento de la guía de IA local son orientativos; deben medirse en el equipo concreto.

## Estructura rápida

```text
index.html             Interfaz principal
app.js                 Carga, navegación, búsqueda y render Markdown
styles.css             Diseño y responsive
wiki.env               Configuración pública
hilos/inicio.md        Portada
hilos/*.md             Páginas de contenido
vendor/                Librerías y licencias locales
README.md              Uso general
CONTINUAR.md           Esta guía de continuidad
LICENSE                Licencia MIT
```
