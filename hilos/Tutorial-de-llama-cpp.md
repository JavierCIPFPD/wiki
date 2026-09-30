# Tutorial detallado de llama.cpp

`llama.cpp` es un proyecto de inferencia local implementado principalmente en C/C++. Permite ejecutar modelos cuantizados en formato GGUF, aprovechar CPU y distintos aceleradores, y levantar un servidor con una API compatible con OpenAI. No es una interfaz gráfica única: se usa con programas de línea de comandos y, si se desea, con la interfaz web incluida en `llama-server`.

Esta guía usa Windows y PowerShell para los ejemplos, pero las ideas se aplican también a Linux y macOS. El proyecto cambia con rapidez; si una opción no existe en tu paquete, consulta `--help` y la guía oficial de la versión instalada.

## 1. Qué necesitas

- Windows de 64 bits, con controladores actualizados.
- Espacio en disco para los binarios y los modelos GGUF.
- RAM suficiente para el modelo y el contexto que quieras usar.
- Una GPU compatible si deseas aceleración. El backend disponible depende de la tarjeta y del paquete o compilación: CUDA para NVIDIA, Vulkan en distintos fabricantes y otros backends documentados por el proyecto.

La forma más sencilla de empezar es descargar un binario ya compilado. Compilar desde el código fuente es útil si necesitas un backend concreto, quieres desarrollar con la biblioteca o estás depurando el proyecto.

![Captura oficial del proyecto mostrando una sesión interactiva con llama.cpp](https://github.com/user-attachments/assets/88726b48-1713-48aa-a525-95a02e78afc4)

*Captura publicada por el proyecto en su repositorio oficial; la sesión mostrada puede usar una versión diferente a la que descargues.*

## 2. Instalar en Windows con un binario precompilado

1. Abre las [releases oficiales de llama.cpp](https://github.com/ggml-org/llama.cpp/releases).
2. Descarga el paquete de Windows que corresponda a tu arquitectura y backend. Si no sabes cuál elegir, comienza con el paquete CPU. Para una tarjeta NVIDIA busca el paquete CUDA apropiado; no descargues uno CUDA sin tener un controlador NVIDIA compatible.
3. Extrae el archivo ZIP en una carpeta sencilla, por ejemplo `C:\llama.cpp`.
4. Abre PowerShell en esa carpeta. En el Explorador, puedes escribir `powershell` en la barra de direcciones.
5. Comprueba qué ejecutables incluye el paquete:

```powershell
Get-ChildItem
```

Las versiones recientes documentan el comando unificado `llama` con subcomandos como `cli` y `serve`. Algunos paquetes anteriores incluyen ejecutables separados, como `llama-cli.exe` y `llama-server.exe`. Los ejemplos de esta guía usan la interfaz unificada; si solo tienes los ejecutables separados, reemplaza `.in\llama.exe cli` por `.in\llama-cli.exe` y `.in\llama.exe serve` por `.in\llama-server.exe`.

## 3. Primera ejecución: descargar y probar un GGUF

`GGUF` es un formato de archivo de modelo usado por llama.cpp. Los repositorios pueden ofrecer varias cuantizaciones. Una cuantización de 4 bits ocupa menos memoria que el modelo de precisión completa, normalmente con cierto intercambio de calidad. Comprueba la ficha y la licencia del modelo antes de descargarlo.

El repositorio oficial de llama.cpp muestra como ejemplo `ggml-org/Qwen3.5-0.8B-GGUF`. Es un modelo pequeño, adecuado para confirmar que el ejecutable funciona; no es representativo de la calidad de modelos mayores.

Desde la carpeta que contiene `llama.exe`, ejecuta:

```powershell
.\llama.exe cli -hf ggml-org/Qwen3.5-0.8B-GGUF:Q4_K_M -c 4096 -n 256 --show-timings
```

La primera ejecución necesita Internet para descargar el modelo. `-hf` indica el repositorio de Hugging Face y `:Q4_K_M` pide esa cuantización si está publicada; el catálogo del repositorio determina los nombres reales disponibles. `-c 4096` limita el contexto a 4096 tokens y `-n 256` limita la salida. `--show-timings` muestra información de rendimiento.

Cuando aparezca el indicador interactivo, escribe un mensaje y pulsa Enter. Para cerrar, usa `Ctrl + C`. En una versión con ejecutables separados, un ejemplo equivalente es:

```powershell
.\llama-cli.exe -hf ggml-org/Qwen3.5-0.8B-GGUF:Q4_K_M -c 4096 -n 256 --show-timings
```

![Captura oficial de la interfaz web de llama-server con un modelo local](https://github.com/user-attachments/assets/b402f972-2e32-4def-8771-8d849f08cf2e)

*Captura oficial de la interfaz web del servidor; sirve como referencia visual del resultado, no como captura de cada cuadro del instalador.*

## 4. Menús, herramientas y comandos

Al contrario que LM Studio, llama.cpp no presenta una aplicación de escritorio con un único menú de navegación. Cada herramienta tiene sus propias opciones, que se enumeran con `--help`.

| Comando/herramienta | Función |
| --- | --- |
| `llama cli` | Cargar un modelo y conversar desde la terminal. |
| `llama serve` | Iniciar el servidor local y abrir su interfaz web y API HTTP. |
| `--help` | Mostrar las opciones válidas del comando instalado. |
| `-hf usuario/modelo` | Descargar o cargar un modelo desde Hugging Face. |
| `-m ruta\modelo.gguf` | Cargar un archivo GGUF local. |
| `-c` | Definir el tamaño del contexto. |
| `-ngl` | Establecer cuántas capas como máximo se descargan en VRAM; `auto` y `all` están disponibles en versiones actuales. |
| `-t` | Ajustar el número de hilos de CPU. |

Consulta las opciones reales de tu instalación antes de copiar comandos entre versiones:

```powershell
.\llama.exe cli --help
.\llama.exe serve --help
```

## 5. Compilar desde el código fuente

Compilar no es necesario para el uso normal. Para la compilación de CPU en Windows, instala Visual Studio 2022 con la carga **Desktop development with C++**, CMake y Git. Abre **Developer PowerShell for VS 2022**, clona el proyecto y compila en Release:

```powershell
git clone https://github.com/ggml-org/llama.cpp
Set-Location llama.cpp
cmake -B build
cmake --build build --config Release
```

Los binarios se generan bajo `build\bin` (en generadores multi-config, algunos quedan bajo `build\bin\Release`). Para compilar el backend CUDA para una GPU NVIDIA, instala el CUDA Toolkit compatible y configura:

```powershell
cmake -B build -DGGML_CUDA=ON
cmake --build build --config Release
```

Para Vulkan u otros aceleradores hay opciones CMake y dependencias distintas. Sigue la sección específica de tu backend en la [guía oficial de compilación](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md); no mezcles instrucciones de una tarjeta con otra.

## 6. Ejecutar un archivo GGUF descargado manualmente

Si ya tienes un `.gguf`, colócalo en una ruta sencilla, por ejemplo `C:\modelos\qwen.gguf`. Después cárgalo desde la terminal:

```powershell
.\llama.exe cli -m C:\modelos\qwen.gguf -c 4096 -n 256 -p "Explica en dos frases qué es un modelo GGUF."
```

Para conversar en una sesión interactiva, omite `-p` y ejecuta `llama cli -m C:\modelos\qwen.gguf`. El parámetro `-p` sirve para una instrucción inicial; `-n` limita la cantidad de tokens generados.

No renombres arbitrariamente las partes de un modelo dividido en varios archivos GGUF y conserva juntos todos sus fragmentos. En modelos multimodales puede haber además un archivo de proyección de imagen (`mmproj`); sigue las instrucciones del repositorio del modelo.

## 7. Acelerar y medir sin adivinar

La velocidad depende del modelo, cuantización, CPU, GPU, ancho de banda de memoria, contexto, backend y carga del equipo. Usa esta secuencia para diagnosticar:

1. Ejecuta primero el comando base y anota los tiempos que imprime `--show-timings`.
2. Asegúrate de que el paquete tiene el backend correcto. Un binario CPU no empezará a usar CUDA solo por añadir `-ngl`.
3. Prueba `-ngl auto` o `-ngl all` en un equipo con GPU compatible. El programa puede descargar solo las capas que quepan; observa los mensajes de inicio y el uso de VRAM.
4. Si aparece un error de memoria, reduce el número de capas descargadas, el contexto con `-c` o el tamaño del modelo. No fuerces un offload que excede la VRAM disponible.
5. Si el modelo corre principalmente en CPU y la generación es lenta, prueba `-t 1`, luego duplica el valor paso a paso. Más hilos no siempre significan más velocidad; una cantidad demasiado alta puede saturar la CPU.
6. Cambia una sola variable y repite el mismo prompt para comparar.

Ejemplo de prueba limitada a 4096 tokens de contexto, con offload automático y medición:

```powershell
.\llama.exe cli -hf ggml-org/Qwen3.5-0.8B-GGUF:Q4_K_M `
  -c 4096 -n 256 -ngl auto --show-timings
```

No confundas los tiempos de procesamiento del prompt con los de generación: el primer número mide cuánto tarda en leer la entrada; el segundo, cuántos tokens genera por segundo. La documentación oficial de [diagnóstico de rendimiento](https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md) explica cómo comprobar el uso de GPU y ajustar hilos.

## 8. Levantar una API y usarla desde código

Inicia un servidor local desde PowerShell:

```powershell
.\llama.exe serve -hf ggml-org/Qwen3.5-0.8B-GGUF:Q4_K_M `
  --host 127.0.0.1 --port 8080 -c 4096
```

La primera ejecución descarga el modelo si no está en caché. Cuando el servidor indique que está listo, abre `http://127.0.0.1:8080` para usar la interfaz web. Déjalo ligado a `127.0.0.1` para el uso local; no lo expongas a Internet sin configurar autenticación y controles de red.

### Ejemplo con PowerShell

Envía una petición al endpoint compatible con OpenAI:

```powershell
$body = @{
  model = "ggml-org/Qwen3.5-0.8B-GGUF:Q4_K_M"
  messages = @(
    @{ role = "user"; content = "Resume qué hace llama.cpp en una frase." }
  )
  temperature = 0.2
  max_tokens = 100
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8080/v1/chat/completions" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

El nombre de modelo en el JSON debe coincidir con el que publica el servidor; si una versión concreta muestra otro identificador en la interfaz o en `/v1/models`, utiliza ese.

### Ejemplo con Python

El servidor es compatible con el formato de chat de OpenAI. No hace falta una clave real para un servidor local sin autenticación, aunque el cliente espera que `api_key` tenga algún valor:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="local"
)

response = client.chat.completions.create(
    model="ggml-org/Qwen3.5-0.8B-GGUF:Q4_K_M",
    messages=[
        {"role": "user", "content": "Escribe una función Python que sume dos números."}
    ],
    temperature=0.2,
    max_tokens=160,
)

print(response.choices[0].message.content)
```

Instala el cliente si aún no lo tienes con `python -m pip install openai`. La API oficial del servidor documenta `/v1/chat/completions`, streaming, embeddings y otros endpoints.

## 9. Cuantización: elegir una variante

La cuantización representa los pesos con menos bits para reducir tamaño y uso de memoria. Para comenzar, suele ser más sencillo descargar directamente una variante GGUF ya cuantizada desde un publicador de confianza que convertir un modelo desde cero.

Como orientación, compara variantes de la misma familia que ofrezca el repositorio: Q4_K_M suele ser un equilibrio práctico entre tamaño y calidad; Q5 o Q6 suelen requerir más memoria y pueden conservar más fidelidad; Q2 o Q3 reducen más el tamaño con un intercambio potencialmente mayor de calidad. La nomenclatura y calidad concreta dependen del modelo, así que consulta su ficha y no asumas que todos los Q4 son idénticos.

La herramienta de cuantización se distribuye junto con compilaciones del proyecto en algunas versiones. Sus argumentos y opciones dependen del modelo y de la versión; obtén la ayuda con `llama-quantize --help` si el ejecutable está disponible, o consulta la documentación actual antes de convertir pesos. La cuantización requiere disponer del archivo de entrada y espacio adicional para el archivo de salida.

## 10. Videotutorial y capturas

Este videotutorial muestra llama.cpp en Windows, incluyendo GPU, GGUF y API local. Está en inglés; se incluye como acompañamiento visual a los pasos y comandos de esta guía:

**Llama.cpp on Windows: GPU, GGUF, and Local API Step-by-Step**

https://www.youtube.com/watch?v=9T-qmVZFAoY

La [documentación oficial de llama.cpp](https://github.com/ggml-org/llama.cpp) incluye capturas reales de la CLI y la interfaz web. Los binarios, el aspecto de la interfaz y los nombres de opciones pueden cambiar entre releases; utiliza `--help` para confirmar los argumentos disponibles en tu versión.

## 11. Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| PowerShell no reconoce el ejecutable | Sitúate en la carpeta extraída y ejecuta con el prefijo `.[0m`, por ejemplo `.[0mllama.exe`. Comprueba el nombre exacto con `Get-ChildItem`. |
| `-ngl` no acelera | Verifica que descargaste/compilaste el backend correcto y que el controlador está actualizado. Busca mensajes de offload al cargar. |
| Error de falta de memoria | Prueba un modelo/cuántización menor, menos capas GPU o un contexto menor. Cierra otros procesos pesados. |
| No se descarga desde Hugging Face | Revisa Internet, el identificador exacto del repositorio y si el modelo exige aceptar una licencia o autenticarse. |
| Respuestas de chat con formato extraño | Usa una variante Instruct/Chat con plantilla compatible y evita pasar un modelo base como si fuera conversacional. |
| El servidor no responde | Espera el mensaje de carga completada, comprueba el puerto 8080 y consulta `http://127.0.0.1:8080/health`. |

## Referencias oficiales

- [Repositorio oficial y ejemplos rápidos](https://github.com/ggml-org/llama.cpp)
- [Releases oficiales](https://github.com/ggml-org/llama.cpp/releases)
- [Guía de compilación y backends](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md)
- [Ayuda y opciones de la CLI](https://github.com/ggml-org/llama.cpp/tree/master/tools/cli)
- [Servidor HTTP, interfaz web y API](https://github.com/ggml-org/llama.cpp/tree/master/tools/server)
- [Consejos oficiales de rendimiento](https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md)