# Tutorial de Markdown

Markdown es una forma sencilla de dar formato al texto sin usar un editor visual. En esta wiki puedes crear una página escribiendo un archivo `.md` o `.markdown` dentro de `hilos/`.

## Títulos

Los signos `#` indican el nivel del título. Se recomienda empezar con un único título de nivel 1 y organizar el resto por niveles.

```markdown
# Título principal
## Sección
### Subsección
#### Apartado
##### Detalle
###### Nivel seis
```

## Texto y énfasis

Un párrafo se crea escribiendo texto normal. Deja una línea en blanco para empezar otro párrafo.

- **Negrita** se escribe con dos asteriscos.
- *Cursiva* se escribe con un asterisco.
- ***Negrita y cursiva*** combina ambos formatos.
- ~~Texto tachado~~ se escribe con dos virgulillas.
- `Código dentro de una frase` se escribe entre acentos graves.

También puedes escribir caracteres especiales precediéndolos de una barra inversa: \*este texto no aparece en cursiva\*.

## Enlaces

Un enlace tiene un texto visible entre corchetes y una dirección entre paréntesis:

```markdown
[Visitar GitHub](https://github.com/)
```

Resultado: [Visitar GitHub](https://github.com/).

Los enlaces a otras páginas de esta wiki se convierten en navegación interna:

```markdown
[Volver a la portada](Tutorial de Markdown.md)
```

Resultado: [Volver a la portada](Tutorial de Markdown.md).

Los enlaces web se abren en una pestaña nueva. Por seguridad, la wiki admite enlaces e imágenes externas mediante HTTPS.

## Imágenes

La sintaxis es `![texto alternativo](URL "título opcional")`:

```markdown
![Montañas al amanecer](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80 "Paisaje de montaña")
```

![Montañas al amanecer](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80 "Paisaje de montaña")

El texto alternativo ayuda a las personas que usan lectores de pantalla y aparece si la imagen no puede cargarse.

## Listas

### Lista sin ordenar

Usa `-`, `*` o `+` delante de cada elemento:

```markdown
- Primer elemento
- Segundo elemento
  - Elemento anidado
  - Otro elemento anidado
- Tercer elemento
```

- Primer elemento
- Segundo elemento
  - Elemento anidado
  - Otro elemento anidado
- Tercer elemento

### Lista ordenada

Escribe un número seguido de un punto:

```markdown
1. Preparar el contenido
2. Guardar el archivo
3. Publicar los cambios
```

1. Preparar el contenido
2. Guardar el archivo
3. Publicar los cambios

## Lista de tareas

Las tareas usan `[ ]` para pendientes y `[x]` para completadas:

```markdown
- [x] Crear la página
- [x] Revisar el contenido
- [ ] Compartir el enlace
```

- [x] Crear la página
- [x] Revisar el contenido
- [ ] Compartir el enlace

## Citas

El signo `>` crea una cita. Puedes añadir varios niveles:

```markdown
> Una buena documentación permite que las ideas continúen.
>
> > Esta es una cita dentro de otra cita.
```

> Una buena documentación permite que las ideas continúen.
>
> > Esta es una cita dentro de otra cita.

## Separadores

Tres guiones crean una línea horizontal entre secciones:

```markdown
---
```

---

## Tablas

Las tablas se crean separando las columnas con `|`. La segunda línea contiene guiones:

```markdown
| Marca | Uso | Ejemplo |
| --- | --- | --- |
| `**texto**` | Negrita | **texto** |
| `*texto*` | Cursiva | *texto* |
| `` `código` `` | Código | `código` |
```

| Marca | Uso | Ejemplo |
| --- | --- | --- |
| `**texto**` | Negrita | **texto** |
| `*texto*` | Cursiva | *texto* |
| `` `código` `` | Código | `código` |

Puedes alinear columnas con dos puntos:

```markdown
| Izquierda | Centro | Derecha |
| :--- | :---: | ---: |
| A | B | C |
```

| Izquierda | Centro | Derecha |
| :--- | :---: | ---: |
| A | B | C |

## Código

Para código corto usa acentos graves. Para varias líneas, usa tres acentos graves y, opcionalmente, el nombre del lenguaje:

```javascript
const mensaje = 'Hola desde la wiki';
console.log(mensaje);
```

El nombre del lenguaje activa el resaltado que admita el navegador o el renderizador. También puedes usar `text`, `html`, `css`, `php` o cualquier otro identificador:

```text
Este bloque conserva los espacios
y los saltos de línea.
```

## Vídeos

Un enlace HTTPS de YouTube se convierte automáticamente en un reproductor:

```markdown
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

También se admiten enlaces de Vimeo:

```markdown
https://vimeo.com/76979871
```

Los archivos `.mp4` y `.webm` se convierten en un reproductor HTML5 con controles:

```markdown
https://example.com/videos/presentacion.mp4
https://example.com/videos/animacion.webm
```

### Ejemplos de vídeos

Estos enlaces son ejemplos reales y se convierten automáticamente en reproductores al abrir la página:

En la previsualización final no se muestra la URL como un enlace normal:

- **YouTube y Vimeo** aparecen en un reproductor incrustado panorámico, con imagen de portada y botón de reproducción.
- **MP4 y WebM** aparecen en un reproductor HTML5 con botón de reproducción, barra de progreso, volumen y pantalla completa.
- El reproductor se adapta al ancho de la columna de lectura y mantiene la proporción del vídeo en móvil y escritorio.

Pulsa el botón de reproducción para comprobar el vídeo directamente en la página.

**YouTube**

https://www.youtube.com/watch?v=aqz-KE-bpKQ

**Vimeo**

https://vimeo.com/76979871

**MP4**

https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4

**WebM**

https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm

Usa vídeos públicos y estables. La carga del reproductor depende del servicio externo y de la conexión de cada persona.

## Lo que no se interpreta

Por seguridad, el HTML escrito directamente en Markdown no se ejecuta. Por ejemplo, esto se muestra como texto o se elimina:

```html
<script>alert('Este código no se ejecuta');</script>
```

La wiki limpia el contenido antes de mostrarlo. No incluyas contraseñas, tokens ni otra información privada en una página pública.

## Receta rápida

```markdown
# Mi nueva página

Una breve introducción.

## Puntos importantes

- **Idea principal**
- [ ] Tarea pendiente

> Una cita que resume la idea.

[Enlace relacionado](https://github.com/)
```

Guarda el archivo dentro de `hilos/`, publícalo en la rama `main` y la página aparecerá automáticamente en el índice de Moncalvillo.