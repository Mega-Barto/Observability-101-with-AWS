# Runbook: demostración en vivo — Observability 101 with AWS

Documento operativo para la charla **From Bug to Insight: Observability 101 with AWS** (30 minutos, formato híbrido). La infraestructura y los escenarios deben estar **desplegados y validados antes** de la sesión; durante la charla **no** se construye ni despliega la pila.

---

## 1. Resumen ejecutivo

| | |
|---|---|
| **Audiencia** | Nivel 100 — desarrollo, QA, operaciones, interés en AWS |
| **Mensaje central** | Logs, métricas y trazas responden preguntas distintas; juntas permiten investigar calidad en ejecución |
| **Arquitectura** | API Gateway → Lambda (`getById`) → DynamoDB; señales en CloudWatch y X-Ray |
| **Gancho** | La API “responde”, pero algo falla o tarda — ¿cómo encontrar la causa sin leer todo el código? |

---

## 2. Checklist previo (día anterior o misma mañana)

### Infraestructura

- [ ] Pila CloudFormation `observability-101-with-aws` en **CREATE_COMPLETE** (`us-east-1`).
- [ ] Anotar **`WebEndpoint`** (Outputs). Ejemplo actual — **cambia si borras y redespliegas**:

  `https://wqjjsknw9i.execute-api.us-east-1.amazonaws.com/Prod/`

- [ ] Ítem de demo en DynamoDB (`POST` con `id` = `demo-id`).
- [ ] Regla X-Ray `obs101-demo-api-100pct` activa (muestreo 100 % en stage Prod).
- [ ] Dashboard `observability-101-with-aws-observability-demo` abre sin error.
- [ ] Alarma `observability-101-with-aws-getById-duration-high` visible (estado OK antes de latencia).

### Cuenta y acceso

- [ ] Consola AWS en **us-east-1**, usuario con lectura de CloudWatch Logs, Metrics, Dashboards, Alarms y X-Ray.
- [ ] Terminal con `curl` o PowerShell (`Invoke-RestMethod`) y perfil `observability-demo` si usas CLI.
- [ ] Budget `observability-101-budget` (USD 30) con alertas configuradas.
- [ ] **Capturas de respaldo** (dashboard, log de error, traza de latencia) por si falla internet o la consola.

### Ensayo cronometrado

- [ ] Recorrido completo **≤ 12 min** (sección 5).
- [ ] Verificar que una petición de latencia dispara señales visibles en dashboard/alarma (puede tardar 1–2 min).

---

## 3. Recursos de consola (marcadores)

Sustituye `{region}` por `us-east-1` y confirma nombres si cambiaste el stack.

| Recurso | Dónde encontrarlo |
|--------|-------------------|
| **API (URL)** | CloudFormation → stack `observability-101-with-aws` → Outputs → `WebEndpoint` |
| **Logs Lambda demo** | CloudWatch → Log groups → `/aws/lambda/observability-101-with-aws-getById` |
| **Dashboard** | CloudWatch → Dashboards → `observability-101-with-aws-observability-demo` |
| **Alarma duración** | CloudWatch → Alarms → `observability-101-with-aws-getById-duration-high` |
| **Métricas Lambda** | Lambda → `observability-101-with-aws-getById` → Monitor |
| **Trazas** | CloudWatch → X-Ray traces (o X-Ray legacy console) → Service map / Traces |
| **Regla muestreo** | X-Ray → Sampling rules → `obs101-demo-api-100pct` |

---

## 4. Guion de la sesión (30 minutos)

### 4.1 Hook — 3 min

**Qué mostrar:** slide o browser con la URL base de la API (sin escenario).

**Qué decir (notas):**

- “Esta API REST serverless parece un CRUD normal: GET por id, POST para cargar datos.”
- “En producción, a veces el monitor dice ‘verde’ y aun así hay quejas de lentitud o errores esporádicos.”
- “Hoy no vamos a refactorizar código en vivo; vamos a **investigar con evidencia**: logs, métricas y trazas.”

**Transición:** “Primero, un marco común: qué es observabilidad y en qué se diferencia de ‘solo monitorear’.”

---

### 4.2 Contexto — 5 min

**Qué decir (notas):**

- **Observabilidad:** inferir el estado interno del sistema a partir de sus salidas (ideal para sistemas distribuidos).
- **Por qué importa:**
  - La petición cruza API, función y tabla; no hay un solo log local donde “esté” la causa.
  - Una alarma avisa que algo cambió; logs y trazas acortan el tiempo a ciegas.
  - La calidad en ejecución ve datos, carga y dependencias que un test aislado no cubre.
  - Dev, QA y ops pueden discutir el mismo request, la misma métrica y la misma traza.
- **Tres pilares:** 
  - *Logs* → ¿qué ocurrió en esta ejecución?  
  - *Métricas* → ¿cómo se comporta el servicio en el tiempo?  
  - *Trazas* → ¿por qué componente pasó esta solicitud y dónde se fue el tiempo?
- **Monitorizar vs investigar:** las alarmas avisan; la investigación explica *por qué* con contexto (logs + trazas + métricas).
- **Calidad de software:** no termina en tests pre-release; la ejecución real puede divergir (carga, dependencias, datos).

**Opcional (1 frase):** “En AWS serverless, Lambda, API Gateway y DynamoDB ya emiten señales; nosotros añadimos escenarios controlados y logs estructurados.”

---

### 4.3 Contenido principal — 5 min

**Qué mostrar:** diagrama del README (API → Lambda → DynamoDB; CloudWatch + X-Ray).

**Qué decir (notas):**

- Recorrido de la arquitectura desplegada (nombres reales de la pila).
- Escenarios reproducibles vía `GET /{id}?scenario=…`:
  - `normal` — línea base.
  - `error` — fallo intencional (invocación fallida).
  - `latency` — ~2,5 s de espera antes de DynamoDB.
- “Cada escenario es una **pregunta de investigación**; las señales no siempre coinciden en el mismo sitio.”

**Código en pantalla (Carbon, no desplegar en vivo).** Tres imágenes ya generadas a partir de `template.yaml`:

| Fragmento | Líneas | Qué señalar |
|-----------|--------|-------------|
| `Globals` | **7–18** | `Tracing: Active`, logs JSON y `TracingEnabled: true` en la API |
| Log groups + `getByIdFunction` | **21–37** y **61–81** | Retención de **7 días** y el log group de la función de la demo |
| Sampling y alarma | **112–144** | Regla X-Ray `FixedRate: 1.0` (solo demo) y alarma de Duration p99 > 2000 ms |

**Transición:** “Vamos a la consola con una historia: primero todo bien, luego algo se rompe o se alenta.”

---

### 4.4 Demo en vivo — 12 min

Detalle paso a paso en la **sección 5**. Mantén el dashboard en una pestaña y logs/X-Ray en otras.

---

### 4.5 Conclusiones — 2 min

**Qué decir (notas):**

- Los tres pilares son **complementarios**, no redundantes.
- Un `200` HTTP no garantiza calidad de negocio; un `502` con log claro acorta el MTTR.
- QA, dev y ops pueden alinearse en **evidencia compartida** (mismo dashboard, misma traza).
- Próximo paso personal: elegir un servicio propio y definir *una* métrica, *un* log estructurado y *una* traza útil.

---

### 4.5b Recomendaciones — dentro del cierre, antes del Q&A

**Qué decir (notas):**

Buenas prácticas que la demo ya muestra:

- Log JSON con contexto de la request; sin secretos ni cuerpos completos.
- Retención corta en ensayos (7 días en la plantilla).
- Una alarma cuyo umbral alguien va a revisar.
- Muestreo al 100 % solo mientras dura la demo.
- `sam delete` cuando el ensayo termine.

Próximos pasos para quien quiera aplicarlo:

- En un servicio propio: un log estructurado, una métrica y una traza útil.
- Un dashboard mínimo y una alarma accionable.
- Mirar Cost Explorer agrupado por servicio antes de dar por barato el diseño.
- En producción, sampling y retención se diseñan; SLO y OpenTelemetry quedan fuera de esta sesión.

---

### 4.6 Q&A — 3 min

**Preguntas frecuentes preparadas:**

- *¿X-Ray siempre muestra todas las requests?* — Muestreo por defecto; aquí hay regla al 100 % para la demo; en prod se diseña sampling y costo.
- *¿Cómo mido el costo?* — Cost Explorer, últimos 7 días, agrupado por servicio. En esta demo la cifra la mueven **CloudWatch Logs** (ingestión y retención de 7 días) y **X-Ray** con la regla al 100 %. Lambda, API Gateway y DynamoDB, con cientos de requests, suelen quedar en free tier o en centavos. El budget `observability-101-budget` (USD 30) **avisa**; no borra recursos. Los cargos pueden tardar hasta 24 h. El bucket de artefactos SAM sigue después de `sam delete`. No copies `FixedRate: 1.0` a producción.
- *¿Esto reemplaza tests?* — No; los complementa en runtime.

---

## 5. Demo en vivo — paso a paso (12 minutos)

Variables (rellena antes de empezar):

```text
WEB=https://<tu-api-id>.execute-api.us-east-1.amazonaws.com/Prod/
ID=demo-id
```

### Paso 0 — Sembrar datos (pre-demo o justo antes, ~30 s)

**Acción (PowerShell):**

```powershell
$WEB = "https://wqjjsknw9i.execute-api.us-east-1.amazonaws.com/Prod/"
Invoke-RestMethod -Method POST -Uri "$WEB" -ContentType "application/json" `
  -Body '{"id":"demo-id","name":"demo"}'
```

**Notas:** Si ya hay datos, omite; menciona que DynamoDB es el estado de la app.

**curl (alternativa):**

```bash
curl -s -X POST "${WEB}" -H "Content-Type: application/json" \
  -d '{"id":"demo-id","name":"demo"}'
```

---

### Paso 1 — Línea base normal (~2 min)

**Acción:**

```powershell
Invoke-RestMethod -Method GET -Uri "$WEB/demo-id"
```

**Consola:** Abre dashboard `observability-101-with-aws-observability-demo`.

**Qué decir:**

- “Request normal: esperamos 200 y un JSON con el ítem.”
- “En el dashboard vemos invocaciones y duración baja — **punto de referencia**.”

**Evidencia:** log en `/aws/lambda/observability-101-with-aws-getById` con `"scenario":"normal"` (opcional: abrir un log si hay tiempo).

---

### Paso 2 — Error controlado (~3 min)

**Acción:**

```powershell
try { Invoke-WebRequest -Uri "$WEB/demo-id?scenario=error" -UseBasicParsing } catch { $_.Exception.Response.StatusCode.value__ }
```

Esperado: **502** (API Gateway ante invocación fallida de Lambda).

**Consola (orden sugerido):**

1. CloudWatch → Log groups → último stream de `getById` → buscar `"controlled demo failure"` y `"scenario":"error"`.
2. Dashboard → pico en **Errors** (puede tardar ~1 min).
3. Lambda → Monitor → métrica **Errors**.

**Qué decir:**

- “El cliente ve 502; el usuario no ve nuestro mensaje interno — por eso investigamos **logs**.”
- “La métrica Errors confirma que no es un glitch del cliente: hubo fallo en la función.”
- “No asumimos la causa raíz de negocio solo con la métrica; el log da el contexto **controlado** del taller.”

---

### Paso 3 — Latencia artificial (~3 min)

**Acción:**

```powershell
Measure-Command { Invoke-RestMethod -Method GET -Uri "$WEB/demo-id?scenario=latency" }
```

Esperado: **200** en ~2,5–3,5 s.

**Consola:**

1. Dashboard → **Duration** (Average/Maximum) sube.
2. Alarma `observability-101-with-aws-getById-duration-high` → estado **In alarm** (si no cambia al instante, menciona periodo de 60 s).
3. X-Ray → Traces → filtrar por tiempo → abrir traza → subsegmento **`demo-artificial-latency`** y llamada a DynamoDB.

**Qué decir:**

- “Misma ruta HTTP, distinto comportamiento: la métrica de duración nos dice *que* algo cambió.”
- “La traza localiza *dónde* se fue el tiempo sin leer el código en vivo.”
- “En un caso real, compararíamos con baseline, despliegues recientes y dependencias.”

---

### Paso 4 — Cierre de la historia (~2 min)

**Qué decir (sin nuevas peticiones):**

| Pregunta | Log | Métrica | Traza |
|----------|-----|---------|-------|
| ¿Qué pasó en esta request? | Error / scenario | Errors, Duration | Segmentos |
| ¿Hay anomalía vs baseline? | Contexto JSON | Dashboard | Mapa de servicios |
| ¿Dónde profundizar? | Stack / message | Alarma | Subsegmento latencia |

**Frase de cierre demo:** “Monitorizar habría encendido la alarma de duración; investigar la traza nos dice en qué tramo empezar el análisis.”

---

### Paso 5 — Margen / plan B (~1 min)

Si X-Ray tarda: usa **captura de respaldo** de la traza ensayada.

Si la consola no carga: muestra logs vía CLI:

```powershell
sam logs -n getByIdFunction --stack-name observability-101-with-aws `
  --profile observability-demo --region us-east-1 --tail
```

---

## 6. Tabla de escenarios (referencia rápida)

| Escenario | URL | HTTP | Señal principal |
|-----------|-----|------|-----------------|
| Normal | `{WEB}{ID}` | 200 | Baseline duration / log `normal` |
| Error | `{WEB}{ID}?scenario=error` | 502 | Log `controlled demo failure`, Errors ↑ |
| Latencia | `{WEB}{ID}?scenario=latency` | 200 ~3 s | Duration ↑, alarma, subsegmento X-Ray |

---

## 7. Plan B (formato híbrido)

1. **Video o GIF corto** de una traza de latencia (ensayo previo).
2. **Screenshots:** dashboard con pico, log del error, service map X-Ray.
3. **Narración:** “En el ensayo vimos…” — honesto y profesional.
4. Tener **PDF o slide** con la tabla de la sección 6.

---

## 8. Después de la charla

### Apagar recursos (cuando ya no necesites la demo)

```powershell
sam delete --stack-name observability-101-with-aws --profile observability-demo --region us-east-1
```

Ver detalle en [README — Cleanup / Limpieza](../README.md).

### Redesplegar para otro ensayo

```powershell
sam build --no-cached
sam deploy --profile observability-demo
```

- Nueva **`WebEndpoint`** en Outputs.
- Volver a ejecutar **POST** del ítem demo.
- Actualizar marcadores y este runbook si cambia la URL.

---

## 9. Troubleshooting rápido

| Síntoma | Comprobación |
|---------|----------------|
| 502 en error no aparece | ¿URL con `?scenario=error`? Revisar logs Lambda |
| Latencia < 1 s | ¿Query param correcto? Cold start vs scenario — repetir |
| Sin trazas | Esperar 1–2 min; regla `obs101-demo-api-100pct`; nueva request |
| GET 200 pero body vacío | Falta ítem — ejecutar POST |
| Dashboard vacío | Periodo de tiempo en consola = “Last 1 hour”; generar tráfico |

---

## 10. Enlaces del repositorio

- Arquitectura y pilares: [README.md](../README.md)
- Eventos locales: [events/](../events/)
- Plantilla IaC: [template.yaml](../template.yaml)

---

*Última alineación con stack `observability-101-with-aws` y endpoint de ensayo en us-east-1. Actualiza la URL en la sección 2 y 5 tras cada redeploy.*
