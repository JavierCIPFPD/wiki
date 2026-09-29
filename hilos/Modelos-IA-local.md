# Modelos de IA local para un equipo doméstico

Ejecutar un modelo de lenguaje local significa descargar sus archivos y hacer la inferencia en nuestro propio equipo. La conversación no tiene que salir a un servicio externo, aunque el modelo, el programa que lo ejecuta y los datos de entrada sí ocupan memoria y recursos.

Esta guía está pensada para equipos domésticos con una **RTX 3080 de 10 GB** o una **RTX 3090 de 24 GB**, pero las reglas sirven también para otras tarjetas.

> Las velocidades de este documento son rangos orientativos, no una promesa de rendimiento. Cambian con el backend, los drivers, la cuantización, la temperatura, el tamaño del contexto, la longitud de la respuesta y el número de capas que se carguen en la GPU.

## La idea en una imagen

```text
                 MODELO LOCAL
                      |
      +---------------+----------------+
      |                                |
   Pesos del modelo                 Contexto
  "lo que ha aprendido"       "lo que recuerda del chat"
      |                                |
   VRAM o RAM                    KV cache: VRAM/RAM
      |                                |
      +---------------+----------------+
                      |
              tokens por segundo
```

La memoria necesaria tiene dos partes principales:

```text
Memoria total aproximada
= pesos cuantizados
+ KV cache del contexto
+ memoria temporal del motor
+ sistema operativo y otros programas
```

## Qué se puede ejecutar en casa

No hay un único modelo mejor para todo. La elección depende de si se busca conversación general, programación, razonamiento, visión o respuestas rápidas.

| Familia y tamaño | Para qué destaca | Cuantización doméstica habitual | Tarjeta orientativa |
| --- | --- | --- | --- |
| **Llama 3.1/3.2 3B-8B** | Conversación general, resumen y ayuda cotidiana | Q4 o Q5 | RTX 3080 y 3090 |
| **Mistral 7B** | Chat rápido, escritura y programación sencilla | Q4_K_M o Q5_K_M | RTX 3080 y 3090 |
| **Gemma 3 4B-12B** | Buen equilibrio, razonamiento y, según variante, imágenes | Q4 o Q5 | RTX 3080 y 3090 |
| **Qwen2.5 7B-14B** | Multilingüe, código y tareas generales | Q4_K_M | RTX 3080 y 3090 |
| **Phi-4 14B** | Razonamiento y código con un tamaño moderado | Q4_K_M | RTX 3090; 3080 con ajustes |
| **DeepSeek-R1-Distill-Qwen 7B-32B** | Respuestas con razonamiento visible | Q4_K_M | 7B en 3080; 14B-32B mejor en 3090 |
| **Qwen2.5 32B** | Calidad alta en texto y código | Q4, con poco margen | Principalmente RTX 3090 |
| **Llama 3.1 70B** | Calidad alta, pero modelo grande | Q4 con varias GPU o CPU | No es cómodo en una sola GPU doméstica |

Las etiquetas de familia y versión evolucionan. Antes de descargar un archivo, comprueba siempre su licencia, la ventana de contexto anunciada y que el formato sea compatible con el motor elegido.

## Pesos, parámetros y cuantización

Un modelo de **7B** tiene aproximadamente 7.000 millones de parámetros. El sufijo `B` significa *billion*, no gigabytes. El tamaño final depende de cuántos bits use cada parámetro:

| Formato aproximado | Bits por parámetro | Peso teórico de un modelo 7B | Uso práctico |
| --- | ---: | ---: | --- |
| FP16 | 16 | 14 GB | Mucha calidad, poca capacidad doméstica |
| INT8 | 8 | 7 GB | Buen equilibrio si hay memoria suficiente |
| Q6 | 6 | 5,25 GB | Pérdida pequeña, más memoria |
| Q5 | 5 | 4,4 GB | Buena calidad general |
| Q4 | 4 | 3,5 GB | Elección habitual en casa |
| Q3 | 3 | 2,6 GB | Ahorra memoria, puede perder calidad |

Los archivos reales son algo mayores porque incluyen metadatos y estructuras internas. Por eso una regla rápida más realista para los pesos es:

```text
Tamaño de pesos en GB ~= parámetros en miles de millones x bits / 8 x 1,10
```

Ejemplos aproximados para Q4:

| Modelo | Q4 teórico | Q4 práctico aproximado |
| ---: | ---: | ---: |
| 7B | 3,5 GB | 4-5 GB |
| 8B | 4,0 GB | 4,5-5,5 GB |
| 14B | 7,0 GB | 8-9,5 GB |
| 32B | 16,0 GB | 18-21 GB |
| 70B | 35,0 GB | 39-45 GB |

**Q4** no significa que la respuesta sea cuatro veces peor. Es una compresión de los pesos; la calidad depende del modelo, el método de cuantización y la tarea. `Q4_K_M`, por ejemplo, suele ser un buen punto de partida en motores compatibles con GGUF.

## VRAM, RAM y descarga parcial

La **VRAM** de la tarjeta es la memoria más rápida para las capas que se ejecutan en GPU. La **RAM** del equipo puede contener el modelo y servir para descargar parte de las capas, pero normalmente reduce bastante la velocidad.

```text
                 Modelo Q4 de 14B
                aproximadamente 8-10 GB

 RTX 3080 10 GB                 RTX 3090 24 GB
 +------------------+           +--------------------------+
 | pesos casi llenos|           | pesos                    |
 | poco margen para |           | + contexto amplio        |
 | KV cache         |           | + memoria temporal       |
 +------------------+           +--------------------------+
       puede requerir                  cabe con más margen
       RAM compartida
```

Si los pesos no caben por completo en VRAM, `llama.cpp`, LM Studio u otros motores pueden repartir capas entre GPU y CPU. Es útil para experimentar, pero no equivale a tener todo el modelo en la tarjeta:

```text
GPU offload parcial

[capas GPU] [capas GPU] [capas GPU] [capas RAM/CPU]
     rápido                         cuello de botella
```

Deja siempre margen para Windows, el navegador, el motor y la memoria del contexto. Una tarjeta de 10 GB no debería llenarse hasta el último megabyte.

## Contexto: con y sin contexto

El **contexto** es el texto que el modelo puede leer en una petición: instrucciones del sistema, conversación anterior, documentos recuperados y la pregunta actual. Una ventana de `32K` permite más texto que una de `8K`, pero necesita más memoria.

### Sin contexto adicional

Cuando se carga el modelo y todavía no se ha enviado una conversación larga, se paga principalmente el coste de los pesos y una pequeña reserva del motor:

```text
VRAM inicial ~= pesos cuantizados + memoria del motor
```

### Con contexto

Al procesar tokens, el motor crea una **KV cache**. Esa caché guarda las claves y valores de las capas para no recalcular toda la conversación en cada palabra nueva:

```text
VRAM/RAM ~= pesos + KV cache + buffers

2K tokens  -> contexto corto
8K tokens  -> conversación o documento medio
32K tokens -> documento largo, bastante más memoria
```

Una aproximación conceptual para la KV cache en precisión de 16 bits es:

```text
KV bytes ~= tokens x capas x 2 x (cabezas KV x dimensión de cabeza) x 2 bytes
```

El último `2` representa que se guardan claves y valores. La fórmula exacta depende de la arquitectura. Los modelos con **GQA** usan menos cabezas KV y, por tanto, suelen gastar menos memoria de contexto que un modelo antiguo con una cabeza KV por cabeza de atención.

| Modelo orientativo | Pesos Q4 | Memoria total a 8K | Memoria total a 32K | Comentario |
| --- | ---: | ---: | ---: | --- |
| 7B-8B con GQA | 4-5,5 GB | 5-7 GB | 7-10 GB | Cómodo en 3080 con 8K |
| 14B con GQA | 8-9,5 GB | 10-13 GB | 14-20 GB | Mejor en 3090 |
| 32B con GQA | 18-21 GB | 21-25 GB | 27-36 GB | Una 3090 necesita ajustar contexto |
| 70B con GQA | 39-45 GB | 44-52 GB | 55 GB o más | Varias GPU o RAM abundante |

Son rangos de planificación. La cifra real se debe consultar en el modelo concreto o medir con el motor. Aumentar el contexto máximo configurado no siempre reserva toda la memoria desde el primer segundo, pero sí permite que la KV cache crezca hasta ese límite.

## Métricas orientativas: RTX 3080 y RTX 3090

La siguiente tabla representa **generación de texto** en tokens por segundo (`tok/s`) con un backend tipo `llama.cpp` CUDA, un modelo GGUF Q4_K_M, una sola conversación y todo lo posible en GPU. No es una prueba de laboratorio universal.

| Modelo Q4 | RTX 3080 10 GB | RTX 3090 24 GB | Contexto razonable |
| --- | ---: | ---: | ---: |
| 7B-8B | 55-90 tok/s | 75-120 tok/s | 4K-8K |
| 14B | 25-45 tok/s | 40-70 tok/s | 4K-8K |
| 32B | 8-18 tok/s con descarga parcial | 20-35 tok/s | 4K-8K |
| 70B | 2-6 tok/s, principalmente CPU | 7-14 tok/s con descarga parcial | 2K-4K |

La **evaluación del prompt** suele ser más rápida que la generación token a token, pero puede variar mucho según el tamaño del documento. En un contexto largo, la primera respuesta puede tardar aunque la velocidad posterior parezca alta.

| Medida | Qué significa |
| --- | --- |
| Prompt eval (`pp`) | Velocidad al leer el contexto inicial, normalmente en tok/s |
| Generation (`tg`) | Velocidad al generar la respuesta, normalmente en tok/s |
| TTFT | Tiempo hasta el primer token |
| VRAM used | Memoria ocupada por pesos, caché y buffers |
| Context length | Tokens que caben en la conversación activa |

### Qué tarjeta elegir

| Situación | RTX 3080 10 GB | RTX 3090 24 GB |
| --- | --- | --- |
| Chat rápido de 7B-8B | Excelente | Excelente, con más margen |
| Modelos de 14B | Viable en Q4 y contexto moderado | Cómodo |
| Modelos de 32B | Offload parcial y paciencia | Viable en Q4 |
| Contextos de 16K-32K | Limitados en modelos medianos | Mucho más prácticos |
| Modelos grandes | Mejor usar RAM o varias GPU | También requiere descarga parcial |

La 3090 no duplica siempre los tokens por segundo: su ventaja principal es disponer de 24 GB de VRAM. Eso permite mantener más capas, un modelo mayor o una KV cache más grande dentro de la GPU.

## Cómo medirlo en tu equipo

Para comparar dos modelos, conserva las mismas condiciones:

1. Usa la misma cuantización y el mismo backend.
2. Anota el modelo, la versión del motor y el número de capas en GPU.
3. Prueba con el mismo contexto y una respuesta de longitud parecida.
4. Registra `prompt eval`, `generation`, VRAM ocupada y temperatura.
5. Repite la prueba dos o tres veces y descarta el primer arranque si estaba cargando archivos.

```text
Modelo: Qwen2.5-14B-Instruct Q4_K_M
GPU: RTX 3090 24 GB
Contexto: 8K
Capas en GPU: todas las que permite la VRAM
Prompt eval: ____ tok/s
Generation:  ____ tok/s
VRAM:        ____ GB
```

## Programas para ejecutarlos

| Programa | Enfoque | Cuándo elegirlo |
| --- | --- | --- |
| **LM Studio** | Interfaz gráfica y descarga sencilla | Primera prueba en Windows |
| **Ollama** | Comandos y API local | Integraciones y desarrollo |
| **llama.cpp** | Control fino y buen soporte GGUF | Medir, ajustar offload y exprimir hardware |
| **KoboldCpp** | Interfaz y generación narrativa | Escritura y ficción local |
| **Jan** | Interfaz de escritorio y modelos locales | Uso sencillo con alternativa abierta |

El formato **GGUF** es habitual en `llama.cpp`, LM Studio, KoboldCpp y otras herramientas. Ollama suele gestionar sus propios paquetes, aunque internamente también usa formatos cuantizados.

## Vídeos y recursos

El canal de [Ricardo Bertran en YouTube](https://www.youtube.com/@Ricardo_Bertran) puede servir como referencia práctica para comparar modelos, interfaces y configuraciones de IA local. Consulta sus [vídeos](https://www.youtube.com/@Ricardo_Bertran/videos) y contrasta siempre la fecha, la GPU y la cuantización usadas en cada prueba.

## Resumen rápido

```text
¿Tienes 8-10 GB de VRAM?
  -> 7B-8B Q4: opción rápida y cómoda
  -> 14B Q4: posible con contexto moderado

¿Tienes 24 GB de VRAM?
  -> 7B-14B: muy cómodos
  -> 32B Q4: opción viable
  -> 70B Q4: requiere RAM, descarga parcial o varias GPU

¿Quieres más contexto?
  -> reserva VRAM para la KV cache
  -> baja el tamaño del modelo o la cuantización si es necesario
  -> mide el resultado real con tu backend
```

La mejor configuración doméstica es la que mantiene una respuesta útil, una latencia aceptable y suficiente memoria libre para que el sistema siga siendo estable.