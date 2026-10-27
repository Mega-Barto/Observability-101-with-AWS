# Kahoot — Observability 101 with AWS

Preguntas para la sesión **From Bug to Insight: Observability 101 with AWS** (nivel 100). Formato listo para cargar en Kahoot: 4 opciones, una correcta.

**Sugerencia de tiempo:** 20 s por pregunta (30 s en la 4 y la 6 si el grupo es nuevo en el tema).

---

## 1. ¿Cuáles son los tres pilares de la observabilidad?

- [ ] A) Dashboards, alarmas y tickets
- [x] B) Logs, métricas y trazas
- [ ] C) Tests, CI/CD y monitoreo
- [ ] D) API Gateway, Lambda y DynamoDB

**Respuesta:** B  
**Nota para el speaker:** Los servicios de la app no son pilares; son el sistema que observamos.

---

## 2. ¿Qué pregunta responde principalmente un *log*?

- [x] A) ¿Qué ocurrió en esta ejecución?
- [ ] B) ¿Cómo se comporta el servicio a lo largo del tiempo?
- [ ] C) ¿Por qué componente pasó esta solicitud?
- [ ] D) ¿Cuánto cuesta CloudWatch este mes?

**Respuesta:** A  
**Nota para el speaker:** Métricas → patrones en el tiempo; trazas → dónde investigar en el recorrido.

---

## 3. En la demo, ¿por dónde pasa una petición dentro de la aplicación?

- [ ] A) Por el dashboard y la alarma
- [ ] B) Por el log, la métrica y la traza
- [x] C) Por la API, la función y la tabla
- [ ] D) Por el test y el despliegue

**Respuesta:** C  
**Nota para el speaker:** Esa ruta es API Gateway → Lambda → DynamoDB. CloudWatch y X-Ray la observan; no forman la app.

---

## 4. Quieres seguir una solicitud a través de varios componentes y ver dónde se fue el tiempo. ¿Qué usas?

- [ ] A) Solo CloudWatch Alarms
- [ ] B) Solo `sam validate`
- [x] C) AWS X-Ray (trazas / service map)
- [ ] D) Solo el código fuente en el IDE

**Respuesta:** C  
**Nota para el speaker:** En la demo hay muestreo al 100 %; en prod el sampling se diseña con costo.

---

## 5. En la demo, ¿cómo provocamos el *error controlado*?

- [ ] A) Creando un ítem nuevo
- [x] B) Consultando un ítem con `?scenario=error`
- [ ] C) Borrando el ítem
- [ ] D) Apagando la base de datos

**Respuesta:** B  
**Nota para el speaker:** Ruta real: `GET /{id}?scenario=error`. Resultado típico: `502` en API Gateway; log con `controlled demo failure` y métrica Errors de Lambda.

---

## 6. ¿Cuál es la diferencia clave entre *monitorear* e *investigar*?

- [ ] A) Monitorear es gratis; investigar siempre cuesta más
- [ ] B) Son lo mismo: ambos solo miran dashboards verdes/rojos
- [x] C) Monitorear avisa del estado; investigar explica el *por qué* con evidencia (logs, métricas, trazas)
- [ ] D) Investigar solo se hace en pre-producción; monitorear solo en prod

**Respuesta:** C  
**Nota para el speaker:** Cierra el mensaje de la charla: calidad también en runtime, con evidencia compartida entre QA, dev y ops.

---

## Clave rápida

| # | Correcta |
|---|----------|
| 1 | B |
| 2 | A |
| 3 | C |
| 4 | C |
| 5 | B |
| 6 | C |

## Cómo cargarlo en Kahoot

1. Crear un Kahoot nuevo (quiz).
2. Pegar cada enunciado y las 4 opciones.
3. Marcar la opción con `[x]` como correcta.
4. (Opcional) Añadir la nota del speaker como “explanation” tras revelar la respuesta.
