# Tutorial detallado de LM Studio

LM Studio permite descargar y ejecutar modelos de lenguaje en el propio ordenador mediante una aplicación de escritorio. Una vez descargado un modelo, la conversación puede funcionar sin enviar los mensajes a un servicio remoto. La búsqueda y la descarga inicial sí necesitan Internet.

Esta guía se centra en Windows, aunque LM Studio también ofrece versiones para macOS con Apple Silicon y Linux. Los nombres y la ubicación de algunos controles pueden cambiar entre versiones y traducciones; si tu pantalla no coincide exactamente, busca el nombre indicado en la documentación enlazada.

## 1. Antes de instalar

Comprueba primero qué equipo tienes. En Windows x64 se requiere una CPU con instrucciones AVX2. LM Studio recomienda al menos 16 GB de RAM y 4 GB de VRAM dedicada como punto de partida. Se puede probar con menos memoria si se eligen modelos pequeños, pero el tamaño del modelo no es el único consumo: también cuentan el contexto, el sistema operativo y otras aplicaciones abiertas.

Anota estos datos antes de elegir un modelo:

- RAM instalada.
- Modelo de procesador y si admite AVX2.
- Tarjeta gráfica y VRAM disponible.
- Espacio libre en el disco donde guardarás los modelos.

Los modelos descargados pueden ocupar desde cientos de megabytes hasta decenas de gigabytes. Es útil reservar una carpeta en un disco con espacio suficiente.

![Pantalla oficial Discover de LM Studio, donde se buscan y descargan modelos](https://lmstudio.ai/assets/marketing/docs/discover.png)

*Captura oficial de Discover. La distribución y el catálogo pueden variar con la versión.*

## 2. Descargar e instalar LM Studio

1. Abre la [página oficial de descargas](https://lmstudio.ai/download). Evita instaladores de páginas de terceros.
2. Descarga la versión de Windows que corresponda a la arquitectura de tu equipo. La página oficial detecta normalmente la versión adecuada.
3. Abre el instalador descargado y acepta los pasos del asistente de Windows.
4. Inicia LM Studio desde el menú Inicio. La primera apertura puede tardar mientras se prepara la aplicación.
5. Si Windows muestra una solicitud del firewall, permite acceso solo si vas a usar conscientemente las funciones de servidor local o de red. Para conversar en la propia aplicación no hace falta exponer un puerto a la red.

La versión publicada y los requisitos cambian; consulta la [página oficial de requisitos](https://lmstudio.ai/docs/app/system-requirements) antes de instalar en equipos antiguos. En la página de descarga se publica la versión estable actual y sus notas de publicación.

### Primeros ajustes

LM Studio está disponible en español. En el modo que expone los ajustes, abre **Settings**, entra en **Preferences** y selecciona **Language > Spanish**. En Windows y Linux se puede abrir Settings con `Ctrl + ,`.

Si la aplicación solo muestra la interfaz básica, cambia a **Developer mode** desde **Settings > Developer**. El modo **User** simplifica la experiencia y automatiza opciones; **Developer** muestra parámetros de carga, inferencia y funciones avanzadas. Para empezar, puedes quedarte en User y activar Developer cuando necesites ajustar el modelo.

## 3. Recorrido por los menús principales

Los nombres que siguen son los que usa la interfaz en inglés; pueden aparecer traducidos en tu instalación.

| Sección | Para qué sirve |
| --- | --- |
| **Discover** | Buscar en el catálogo, comparar variantes y descargar modelos compatibles. Requiere conexión a Internet. |
| **Chat** | Cargar un modelo en memoria, abrir conversaciones y cambiar los parámetros de generación. |
| **My Models** | Revisar los modelos descargados, administrarlos y configurar opciones predeterminadas de carga. |
| **Settings** | Preferencias de idioma, modo de usuario/desarrollador, runtimes y otras opciones de la aplicación. |

La barra lateral de Chat también permite crear conversaciones, organizar chats en carpetas y duplicar una conversación desde su menú. Los chats no entrenan ni modifican los pesos del modelo.

![Captura oficial del cargador de modelos de LM Studio](https://lmstudio.ai/assets/marketing/docs/loader.png)

*El cargador aparece desde Chat. Permite escoger un modelo local y revisar opciones antes de cargarlo.*

## 4. Buscar y descargar un modelo

1. Abre **Discover**.
2. Busca por familia o nombre, por ejemplo `Qwen`, `Gemma` o `Llama`. También se puede buscar por el identificador `usuario/modelo` o pegar una URL de Hugging Face.
3. Abre la ficha de un resultado y comprueba el autor, el formato, el tamaño de los archivos y las instrucciones de uso.
4. Elige una variante que quepa en la memoria disponible y pulsa **Download**.
5. Espera a que termine la descarga y verifica que el modelo aparezca en **My Models**.

Una misma familia puede tener varios archivos cuantizados. La cuantización reduce el tamaño y el consumo de memoria, con cierto intercambio de fidelidad. Una variante de 4 bits suele ser un punto de partida razonable; no es una garantía de que cualquier modelo quepa en cualquier GPU. El tamaño indicado en la ficha es una primera referencia, no la memoria total que se usará durante la inferencia.

Si la unidad del sistema tiene poco espacio, cambia la carpeta de modelos desde **My Models** o desde los ajustes relacionados con el almacenamiento antes de descargar muchos modelos.

## 5. Cargar el modelo y entender sus opciones

1. Abre **Chat** y pulsa el selector o cargador de modelos.
2. Selecciona un modelo descargado.
3. Revisa los parámetros de carga antes de confirmar.
4. Espera a que termine la carga; el modelo reserva RAM y, si se configura, VRAM.

Las opciones concretas dependen del modelo y del runtime. Las más importantes para comenzar son:

- **Context length / n_ctx:** máximo de tokens que el modelo mantiene como contexto de la conversación. Un contexto mayor puede atender documentos o historiales más extensos, pero también consume más memoria. Empieza con 4096 o con un valor moderado admitido por el modelo; aumenta solo si lo necesitas y el equipo tiene margen.
- **GPU offload:** cantidad de capas que se colocan en la GPU. **Auto** es el comienzo más sencillo. Si sabes cuánto espacio libre tiene tu GPU, puedes probar a aumentarlo. Si aparece un error de memoria, reduce el valor o deja más trabajo en la CPU.
- **Flash Attention:** acelera o reduce ciertos costes de memoria en los modelos y runtimes compatibles. Déjalo en **Auto** al principio; actívalo manualmente solo cuando esté disponible y sea estable en tu equipo.
- **Runtime:** el motor con el que se ejecuta el archivo, por ejemplo `llama.cpp` para modelos GGUF. Si falta un runtime, LM Studio puede ofrecer instalarlo o actualizarlo desde su gestor de runtimes.

No aumentes el contexto a su máximo solo porque la ficha del modelo lo permita: la memoria requerida puede crecer mucho. Cambia un parámetro cada vez para saber qué produjo el cambio.

![Captura oficial de los ajustes predeterminados de un modelo en My Models](https://lmstudio.ai/assets/marketing/docs/model-settings-gear.webp)

*La rueda de ajustes de My Models permite guardar valores predeterminados para una carga futura.*

![Captura oficial de la configuración de carga de un modelo](https://lmstudio.ai/assets/marketing/docs/load-model.png)

*La ventana de carga muestra controles avanzados cuando se usa Developer mode.*

## 6. Probar el modelo en Chat

Cuando el indicador del modelo señale que está cargado, escribe un mensaje en el cuadro de chat y envíalo. Prueba primero una tarea breve cuya respuesta puedas evaluar, por ejemplo:

> Resume en tres viñetas la diferencia entre RAM y VRAM. No uses más de 60 palabras.

En el panel de generación podrás ajustar parámetros como temperatura o límite de salida. La temperatura controla principalmente la variación de las respuestas: para una comprobación reproducible usa un valor bajo o el valor predeterminado. No es un control de velocidad del modelo.

![Captura oficial de una conversación en LM Studio](https://lmstudio.ai/assets/marketing/docs/chat.png)

*Captura oficial de Chat. Los controles y el tema visual pueden cambiar entre versiones.*

Los chats y los documentos adjuntos se procesan localmente cuando se usan modelos locales. No obstante, una búsqueda en Discover, una descarga de modelos o la comprobación de actualizaciones sí requieren conexión. Consulta [Offline Operation](https://lmstudio.ai/docs/app/offline) para distinguir esas operaciones.

## 7. Optimizar el rendimiento con un ejemplo completo

Vamos a descargar, probar y ajustar `Qwen3.5-0.8B-GGUF`, una opción pequeña para verificar que el entorno funciona. Es deliberadamente un modelo de pruebas: no esperes la calidad de un modelo de mayor tamaño. Si no aparece con ese nombre exacto en tu catálogo, busca `ggml-org/Qwen3.5-0.8B-GGUF` o selecciona otro modelo instruct pequeño que ofrezca LM Studio. Comprueba siempre la licencia y la ficha del publicador.

### Descargar

1. Ve a **Discover** y busca `ggml-org/Qwen3.5-0.8B-GGUF`.
2. En las variantes disponibles, selecciona **Q4_K_M** si aparece. Para un modelo de esta escala es una cuantización equilibrada para la primera prueba.
3. Comprueba el tamaño del archivo y pulsa **Download**.
4. Cuando termine, localiza el modelo en **My Models**.

Si no se ofrece Q4_K_M, elige una variante de 4 bits disponible. Evita escoger un archivo mayor sin comprobar antes el espacio libre y la memoria del equipo.

### Prueba inicial

1. En **Chat**, carga el modelo con **Context length = 4096** o el valor moderado disponible más cercano.
2. Deja GPU offload y Flash Attention en **Auto** para tener una referencia inicial.
3. Envía el mismo mensaje dos veces, sin adjuntar documentos:

```text
Escribe una función en Python que reciba una lista de números y devuelva la media.
Incluye una comprobación para la lista vacía y explica el código en dos frases.
```

4. Observa cuánto tarda la primera respuesta y si el modelo sigue correctamente las instrucciones. Anota también la velocidad de generación que muestra la aplicación, si está disponible.

### Ajuste gradual

1. Si tu GPU tiene memoria libre, cambia solo **GPU offload** y vuelve a cargar el modelo. Aumenta el offload de forma gradual o utiliza Auto; no fuerces todas las capas si el equipo se queda sin VRAM.
2. Repite exactamente la misma consulta y compara la velocidad y la estabilidad. Si LM Studio avisa de falta de memoria, vuelve al valor anterior.
3. Prueba a reducir el contexto si no necesitas conversaciones largas. El contexto influye en el consumo aunque el prompt de prueba sea corto.
4. Activa **Flash Attention** solo si el modelo/runtime lo admite; compara con el valor anterior y revierte el cambio si da errores.
5. Cierra aplicaciones que consuman mucha RAM o VRAM antes de repetir las mediciones.
6. Guarda la configuración que funcione como valor predeterminado del modelo desde **My Models > engranaje**, si quieres reutilizarla.

La comparación más útil consiste en mantener constante el prompt y cambiar una sola opción cada vez. Anota los resultados: modelo, cuantización, contexto, offload y tokens por segundo. Si la respuesta tarda demasiado incluso con un contexto reducido y una cuantización pequeña, prueba un modelo más pequeño antes de seguir tocando parámetros avanzados.

## 8. Problemas frecuentes

| Síntoma | Qué comprobar |
| --- | --- |
| El modelo no aparece tras descargarlo | Revisa **My Models**, el espacio libre y que la descarga haya finalizado. |
| Error de memoria al cargar | Escoge una cuantización menor, reduce el contexto u offload, y cierra aplicaciones que usen GPU/RAM. |
| La GPU no parece utilizarse | Revisa el runtime instalado, la GPU seleccionada y el offload. Una carga en CPU puede seguir funcionando, pero normalmente será más lenta. |
| Respuestas lentas | Prueba un modelo menor, contexto moderado y Auto para offload; comprueba también qué otras aplicaciones usan el equipo. |
| Discover no encuentra modelos | Comprueba Internet; la búsqueda y descarga del catálogo dependen de servicios externos. |
| Un vídeo o una captura no coincide con la interfaz | Puede ser otra versión, sistema operativo o traducción. Confirma el control en la documentación oficial enlazada. |

## Videotutoriales

Los vídeos pueden mostrar versiones anteriores o un hardware distinto. Úsalos como apoyo visual y contrasta las opciones de carga con la documentación vigente.

**LM Studio actualizado: instalación, modelos y documentos (IA Latinoamérica)**

https://www.youtube.com/watch?v=iVtHrGFJnoc

**LM Studio Tutorial 2026 (IA Latinoamérica)**

https://www.youtube.com/watch?v=2sJgLuknvNQ

## Documentación y descargas

- [Descargar LM Studio](https://lmstudio.ai/download)
- [Requisitos del sistema](https://lmstudio.ai/docs/app/system-requirements)
- [Primeros pasos oficiales](https://lmstudio.ai/docs/app/basics)
- [Descargar modelos](https://lmstudio.ai/docs/app/basics/download-model)
- [Administrar chats](https://lmstudio.ai/docs/app/basics/chat)
- [Modo User y Developer](https://lmstudio.ai/docs/app/user-interface/modes)
- [Configuración predeterminada por modelo](https://lmstudio.ai/docs/app/advanced/per-model)
- [Uso sin conexión](https://lmstudio.ai/docs/app/offline)