# Tareas de Implementación — Capital Life

## Orden de prioridad para hackathon (7 horas)

---

## Fase 1 — MVP Core (Horas 1-4)

- [ ] 1. Extender modelo User y migración base
  - [ ] 1.1 Crear migración para agregar columnas `role`, `parent_id`, `balance`, `phone` a la tabla `users`
  - [ ] 1.2 Actualizar `User.php` con relaciones `children()`, `parent()`, scopes `isParent()`, `isChild()`, y atributo `balance`
  - [ ] 1.3 Actualizar `UserFactory` para soportar creación de usuarios padre e hijo

- [ ] 2. Módulo de gastos (Req 2)
  - [ ] 2.1 Crear migración y modelo `Expense` con relación `belongsTo User`
  - [ ] 2.2 Crear `ExpenseController` con métodos `index`, `store`, `update`, `destroy`
  - [ ] 2.3 Crear `ExpenseRequest` (FormRequest) con validaciones de monto, categoría y fecha
  - [ ] 2.4 Definir constante/enum `CATEGORIES` con las 8 categorías predefinidas
  - [ ] 2.5 Registrar rutas resource `/expenses` en `routes/web.php`
  - [ ] 2.6 Crear página React `resources/js/pages/expenses/index.tsx` con listado y botón de crear/editar/eliminar
  - [ ] 2.7 Crear componente `ExpenseForm.tsx` reutilizable (crear y editar)

- [ ] 3. Dashboard principal (Req 3)
  - [ ] 3.1 Instalar `recharts` via npm para gráficas
  - [ ] 3.2 Crear `DashboardController` que calcula total del mes, distribución por categoría y últimos 5 gastos
  - [ ] 3.3 Actualizar página `resources/js/pages/dashboard.tsx` con tarjetas de stats y gráfica de torta/barras
  - [ ] 3.4 Crear componente `SpendingChart.tsx` usando Recharts
  - [ ] 3.5 Agregar selector de rango de fechas al dashboard con recálculo via Inertia

- [ ] 4. Navegación y layout
  - [ ] 4.1 Actualizar `app-sidebar.tsx` con items de navegación: Dashboard, Gastos, Control Parental, Misiones, Solicitudes
  - [ ] 4.2 Agregar lógica condicional en sidebar para mostrar items según rol (padre/hijo)

---

## Fase 2 — Control Parental Base (Horas 3-5)

- [ ] 5. Gestión de cuentas hijo (Req 5)
  - [ ] 5.1 Crear `ChildController` con métodos `index`, `store`, `destroy`
  - [ ] 5.2 Crear `ChildRequest` con validaciones (email único, no existente como padre, límite de 5 hijos)
  - [ ] 5.3 Registrar rutas `/children` en `routes/web.php` con middleware `auth`
  - [ ] 5.4 Crear página `resources/js/pages/children/index.tsx` con listado de hijos y formulario de creación
  - [ ] 5.5 Crear componente `ChildCard.tsx` con acciones de ver dashboard y eliminar

- [ ] 6. Dashboard del hijo (Req 6)
  - [ ] 6.1 Extender `DashboardController` para aceptar un `child_id` opcional y retornar datos del hijo
  - [ ] 6.2 Crear página `resources/js/pages/children/show.tsx` con el dashboard del hijo (reutiliza componentes del dashboard principal)
  - [ ] 6.3 Adaptar `dashboard.tsx` para mostrar saldo disponible cuando el usuario es hijo

---

## Fase 3 — Restricciones (Horas 4-6)

- [ ] 7. Restricciones de horario (Req 7)
  - [ ] 7.1 Crear migración y modelo `ScheduleRestriction` con relación `belongsTo User (child)`
  - [ ] 7.2 Crear `RestrictionController` con métodos para horario: `storeSchedule`, `updateSchedule`
  - [ ] 7.3 Agregar validación de horario en `ExpenseController@store`: verificar si el hijo tiene restricción activa y si el momento actual está fuera del intervalo
  - [ ] 7.4 Registrar rutas `/children/{child}/restrictions/schedule`
  - [ ] 7.5 Crear UI en `resources/js/pages/restrictions/index.tsx` para configurar horarios (selector de días y horas)

- [ ] 8. Restricciones de categoría (Req 8)
  - [ ] 8.1 Crear migración y modelo `CategoryRestriction` con relación `belongsTo User (child)`
  - [ ] 8.2 Agregar métodos `storeCategory`, `destroyCategory` en `RestrictionController`
  - [ ] 8.3 Agregar validación de categoría en `ExpenseController@store`: verificar si la categoría está bloqueada o si se alcanzó el límite mensual
  - [ ] 8.4 Registrar rutas `/children/{child}/restrictions/category`
  - [ ] 8.5 Extender UI de restricciones para gestionar categorías bloqueadas y límites
  - [ ] 8.6 Mostrar categorías bloqueadas y límites activos en el dashboard del hijo

---

## Fase 4 — Solicitudes y Gamificación (Horas 5-7)

- [ ] 9. Solicitudes de dinero (Req 9)
  - [ ] 9.1 Crear migración y modelo `MoneyRequest` con relaciones a hijo y padre
  - [ ] 9.2 Crear `MoneyRequestController` con métodos `store` (hijo), `approve` (padre), `reject` (padre)
  - [ ] 9.3 Implementar lógica de aprobación: `DB::transaction` que actualiza estado y suma monto al `balance` del hijo
  - [ ] 9.4 Implementar notificaciones in-app usando `User::notify()` con canal `database`
  - [ ] 9.5 Registrar rutas `/money-requests` con acciones de aprobar/rechazar
  - [ ] 9.6 Crear página `resources/js/pages/money-requests/index.tsx` con vistas diferenciadas para padre e hijo

- [ ] 10. Misiones y recompensas (Req 10)
  - [ ] 10.1 Crear migración y modelo `Mission` con relaciones a padre e hijo
  - [ ] 10.2 Crear `MissionController` con métodos `store` (padre), `complete` (hijo), `approve` (padre), `reject` (padre)
  - [ ] 10.3 Implementar lógica de aprobación: `DB::transaction` que actualiza estado y suma recompensa al `balance` del hijo
  - [ ] 10.4 Agregar advertencia al crear misión si la recompensa supera el saldo del padre
  - [ ] 10.5 Registrar rutas `/missions` con todas las acciones
  - [ ] 10.6 Crear página `resources/js/pages/missions/index.tsx` con vistas para padre (crear, aprobar) e hijo (ver activas, marcar completada, historial)
  - [ ] 10.7 Crear componente `MissionCard.tsx` con estado visual y acciones contextuales

---

## Fase 5 — Integración WhatsApp + IA (Si hay tiempo)

- [ ] 11. Integración WhatsApp + IA (Req 4)
  - [ ] 11.1 Instalar `openai-php/client` via composer para llamadas a OpenAI
  - [ ] 11.2 Crear `WhatsAppController` con método `webhook` para recibir mensajes de Twilio
  - [ ] 11.3 Crear `ExpenseParserService` que llama a OpenAI para extraer monto, categoría y descripción del mensaje
  - [ ] 11.4 Implementar lógica de respuesta: gasto registrado, monto no identificado, categoría no identificada, número no vinculado
  - [ ] 11.5 Registrar ruta pública `POST /webhook/whatsapp` (sin middleware auth)
  - [ ] 11.6 Agregar campo `phone` en la página de perfil del usuario para vincular número de WhatsApp

---

## Tareas transversales

- [ ] 12. Políticas de autorización (Laravel Policies)
  - [ ] 12.1 Crear `ExpensePolicy`: solo el dueño puede editar/eliminar su gasto
  - [ ] 12.2 Crear `ChildPolicy`: solo el padre puede gestionar sus hijos y sus restricciones
  - [ ] 12.3 Crear `MissionPolicy`: solo el padre asignado puede aprobar/rechazar
  - [ ] 12.4 Crear `MoneyRequestPolicy`: solo el padre correspondiente puede aprobar/rechazar

- [ ] 13. Seeders para demo del hackathon
  - [ ] 13.1 Crear `DemoSeeder` con un usuario padre, 2 hijos, 20+ gastos distribuidos en categorías y fechas del mes actual
  - [ ] 13.2 Agregar 3 misiones (1 activa, 1 en revisión, 1 completada) y 2 solicitudes de dinero
  - [ ] 13.3 Registrar `DemoSeeder` en `DatabaseSeeder`
