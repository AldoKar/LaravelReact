# Capital Life - README Tecnico

Version: 1.0  
Idioma: Espanol  
Fecha: 2026-04-10

## 1. Resumen Ejecutivo

Capital Life es una aplicacion web de finanzas familiares construida con Laravel + Inertia + React.

Roles principales:
- `parent`: administra dinero, hijos, restricciones y misiones.
- `child`: registra gastos y ejecuta misiones bajo reglas parentales.

Objetivos funcionales:
- Registro y seguimiento de gastos.
- Cuentas hijo vinculadas a una cuenta padre.
- Restricciones por horario y por categoria para cuentas child.
- Misiones con recompensa economica.
- Transferencias `parent -> child` con registro contable.
- Integracion WhatsApp + IA para operaciones conversacionales.

## 2. Stack Tecnologico

### Backend
- PHP 8.3
- Laravel Framework 13
- Inertia Laravel 3
- Laravel Fortify (auth, email verification, 2FA)
- Laravel AI (agentes y tools)
- Laravel Wayfinder (rutas tipadas)

### Frontend
- React 19
- Inertia React 3
- TypeScript
- Tailwind CSS v4
- Radix UI
- Chart.js + react-chartjs-2
- Sonner (toasts)

### Calidad y Tooling
- Pest (testing)
- Pint (estilo PHP)
- ESLint + Prettier
- Vite 8 (build y dev)

## 3. Estructura General del Proyecto

```text
app/
  Http/Controllers      -> Logica HTTP y reglas de negocio por modulo
  Http/Requests         -> Validaciones de entrada (FormRequest)
  Models                -> Entidades Eloquent
  Ai/Agents, Ai/Tools   -> IA conversacional para WhatsApp
  Providers             -> Configuracion de servicios

resources/js/
  pages                 -> Vistas Inertia por dominio
  components            -> Componentes UI reutilizables
  routes, wayfinder     -> Helpers de rutas tipadas
  hooks/types/layouts   -> Infraestructura frontend

routes/
  web.php               -> Rutas principales auth + verified
  settings.php          -> Rutas de configuracion de usuario

database/
  migrations            -> Esquema de datos
  factories/seeders     -> Datos de prueba

tests/
  Feature, Unit         -> Pruebas Pest
```

## 4. Modelo de Datos y Relaciones

### User
- Campos clave: `role`, `parent_id`, `balance`, `phone`.
- Roles: `parent | child`.

Relaciones:
- User hasMany children (self relation)
- User hasMany expenses
- User hasMany categories
- User hasMany missions creadas (`parent_id`)
- User hasMany missions asignadas (`child_id`)

### Expense
- `user_id`, `category_id`, `amount`, `description`, `date`.
- Base para historial financiero y graficas.

### Category
- `user_id`, `name`, `icon`.
- Catalogo de categorias por usuario.

### Mission
- `parent_id`, `child_id`, `title`, `description`, `reward`, `status`, `reject_reason`.
- Flujo de estado: `activa -> en_revision -> completada/rechazada`.

### ScheduleRestriction
- `child_id`, `days[]`, `start_time`, `end_time`.
- Define ventanas permitidas para registrar gastos.

### CategoryRestriction
- `child_id`, `category_id`, `type(blocked|limited)`, `monthly_limit`.
- Bloquea o limita gasto por categoria para child.

## 5. Modulos Funcionales

### 5.1 Gastos
- CRUD en `ExpenseController`.
- Endpoint de resumen por periodo (`day/week/month`) para graficas.

En cuentas `child`:
- valida horario permitido,
- valida categoria bloqueada/limitada,
- valida saldo suficiente,
- ajusta balance en `store/update/destroy` dentro de transacciones.

En cuentas `parent`:
- registra gasto sin descuento automatico en el flujo general (excepto flujos especiales).

### 5.2 Cuentas Hijo
- `parent` puede crear, listar, ver detalle y desvincular hijos.
- `child` no debe acceder al modulo de gestion de hijos.

Transferencias directas `parent -> child`:
- endpoint `give-money`,
- incrementa balance del hijo,
- decrementa balance del padre,
- registra gasto en parent con categoria `Family`.

### 5.3 Restricciones
- Restriccion de horario (`schedule`): dias + rango horario.
- Restriccion por categoria:
  - `blocked`: no se permite gasto,
  - `limited`: limite mensual.
- Se configuran por parent para cada child.
- Se aplican al crear gastos de cuentas child.

### 5.4 Misiones
- parent crea misiones para un child.
- child marca mision como completada -> `en_revision`.

Al aprobar:
- pasa a `completada`,
- child recibe `reward`,
- parent se debita por el reward,
- se registra gasto parent en categoria `Family`.

Al rechazar:
- pasa a `rechazada`,
- se conserva `reject_reason`.

### 5.5 Dashboard y Visualizacion
- Dashboard principal con saldo y actividad.
- Dashboard child con analitica por periodos.
- Charts con Chart.js para historico y distribucion.

## 6. Autenticacion y Seguridad

Fortify habilita:
- login/registro,
- reset de password,
- verificacion de email,
- 2FA.

Seguridad operativa:
- rutas protegidas por middleware `auth + verified`,
- autorizacion por rol y ownership en controladores,
- validaciones server-side con FormRequest y validaciones inline.

Observacion:
- El webhook WhatsApp esta fuera de CSRF por necesidad tecnica.

## 7. Integracion IA + WhatsApp

Flujo:
1. WhatsApp envia evento al webhook.
2. Se identifica usuario por numero de telefono.
3. Se instancia `WhatsAppExpenseAgent` (provider gemini).
4. El agente invoca tools para acciones financieras.
5. Se responde por Graph API de WhatsApp.

Tools activas:
- `RegisterExpenseTool`
- `GetExpenseHistoryTool`
- `CheckChildrenExpensesTool`
- `RegisterChildExpenseTool`
- `GetChildExpenseHistoryTool`
- `CreateMissionTool`
- `CompleteMissionTool`

Variables de entorno:
- `WHATSAPP_PHONE_ID`
- `WHATSAPP_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `GOOGLE_API_KEY`

## 8. Frontend e Inertia

- Arquitectura por paginas Inertia en `resources/js/pages`.
- Sidebar y navegacion dinamica segun rol.
- Wayfinder para rutas tipadas en frontend.
- Sonner + hook de flash para notificaciones temporales.
- SSR de Inertia habilitado en `config/inertia.php`.

Nota SSR:
- Variables no importadas en componentes compartidos pueden romper el render inicial.
- Validar imports tras refactors en layout/sidebar.

## 9. Rutas Principales

### Publica
- `/` (welcome)

### Protegidas (`auth + verified`)
- `/dashboard`
- `/expenses` (resource + summary)
- `/children` (resource + give-money)
- `/children/{child}/restrictions/*`
- `/missions/*`
- `/categories`
- `/capital-family`
- `/travel`

### Webhook
- `GET /webhook/whatsapp` (verificacion)
- `POST /webhook/whatsapp` (mensajes)

## 10. Ejecucion, Build y Calidad

### Setup rapido
```bash
composer run setup
```

### Desarrollo
```bash
composer run dev
```

Este comando ejecuta:
- `php artisan serve`
- `php artisan queue:listen`
- `php artisan pail`
- `npm run dev`

### Build
```bash
npm run build
npm run build:ssr
```

### Calidad
```bash
composer run test
composer run lint
npm run lint:check
npm run format:check
npm run types:check
composer run ci:check
```

## 11. Pruebas y Cobertura Actual

- Tests de autenticacion, dashboard y restricciones de horario.
- Suite base Pest para flujos criticos.

Cobertura recomendada adicional:
- Aprobacion de mision con registro de gasto Family.
- Transferencia `give-money` con doble movimiento de balance.
- Restricciones `category limited` en limites mensuales.
- Webhook WhatsApp con mocks/fakes del proveedor externo.

## 12. Riesgos Tecnicos y Deuda

Riesgos observables:
- Complejidad creciente en controladores de negocio (`Expense/Mission/Child`).
- Reglas distribuidas en varios modulos (riesgo de inconsistencia).
- Integracion WhatsApp sin reintentos robustos por mensaje.
- Balance agregado sin ledger transaccional historico.

Mejoras recomendadas:
- Introducir capa de servicios de dominio para dinero (`wallet/ledger`).
- Crear tabla de transacciones monetarias auditables.
- Anadir politicas Laravel (`Policies`) para autorizacion centralizada.
- Fortalecer tests de regresion en operaciones monetarias.
- Aplicar rate limit explicito al webhook + idempotencia de eventos.

## 13. Guia de Mantenimiento

Buenas practicas:
- Mantener reglas de dinero dentro de transacciones DB atomicas.
- Evitar logica financiera en frontend.
- Documentar cada endpoint nuevo con:
  - rol permitido,
  - impacto en balance,
  - tablas afectadas,
  - manejo de errores.
- Si se agregan categorias especiales (ej. `Family`), mantener consistencia entre:
  - creacion backend,
  - filtros/listados,
  - graficas y colores.

## 14. Estado Actual

El proyecto esta funcional como MVP robusto orientado a familia:
- control parental operativo,
- registro de gastos y restricciones activas,
- misiones con aprobacion/rechazo,
- movimientos parent-child con trazabilidad por expense,
- integracion IA/WhatsApp lista para entorno con credenciales.

---

Documento preparado para uso tecnico, onboarding de desarrolladores y continuidad de mantenimiento.
