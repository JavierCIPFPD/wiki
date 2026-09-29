# Wiki Moncalvillo

Wiki pública y estática. La interfaz se sirve como HTML, CSS y JavaScript; las páginas se leen desde la carpeta `hilos/` del repositorio público configurado.

## Configuración

Edita `wiki.env` antes de publicar:

- `GITHUB_OWNER`: usuario u organización propietaria del repositorio.
- `GITHUB_REPOSITORY`: nombre del repositorio.
- `GITHUB_BRANCH`: rama publicada, normalmente `main`.
- `CONTENT_DIRECTORY`: carpeta de Markdown, normalmente `hilos`.
- `SITE_NAME`, `SITE_DESCRIPTION` y los colores: identidad y estilo.

`wiki.env` se publica y se descarga en el navegador. Debe contener solo configuración pública, nunca contraseñas ni tokens. No es necesario mantener un índice: al cargar la web se consulta GitHub y se detectan automáticamente los archivos Markdown de primer nivel en la carpeta configurada.

## Añadir contenido

1. Añade o modifica archivos `.md` o `.markdown` en `hilos/`.
2. Publica los cambios en la rama configurada.
3. La wiki los detectará al volver a cargarse.

`inicio.md` es la portada y no aparece en el índice. Los nombres de los demás archivos forman los títulos de las páginas; los guiones y guiones bajos se muestran como espacios.

Se admite Markdown CommonMark/GFM, incluidos encabezados, listas, tablas, citas, tareas, tachado y bloques de código. Las imágenes deben enlazarse mediante URL HTTPS. Los vídeos de YouTube, Vimeo y los archivos MP4/WebM se convierten en reproductores. Por seguridad, no se interpreta HTML escrito dentro de Markdown.

## Probar en XAMPP

Coloca esta carpeta bajo `htdocs`, configura `wiki.env` con el repositorio y la rama correctos y abre la carpeta desde `http://localhost/`. Se mostrarán los archivos ya publicados en GitHub; los cambios locales sin publicar no aparecen. También se puede iniciar el servidor incluido de PHP desde esta carpeta con `C:\xampp\php\php.exe -S localhost:8000`.

## Dependencias locales

- `vendor/markdown-it.min.js` (markdown-it 14.1.0): MIT.
- `vendor/purify.min.js` (DOMPurify 3.2.6): Apache-2.0/MPL-2.0.

Se cargan desde el propio sitio; no se usan CDN.