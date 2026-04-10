# Diseño Técnico — Capital Life

## Overview

Capital Life es una app de finanzas personales con dos fases: (1) registro y análisis de gastos para usuarios adultos, y (2) control parental con cuentas de hijos vinculadas, restricciones, solicitudes de dinero y gamificación mediante misiones.

El stack es **Laravel 13 + Inertia.js + React (TypeScript)**, sobre la base existente del proyecto que ya incluye autenticación con Fortify, modelos de usuario, migraciones base y componentes UI con shadcn/ui.

Dado el contexto de hackathon (7 horas), el diseño prioriza:
- Convenciones de Laravel sobre configuración personalizada
- Componentes React reutilizables y simples
- Mínima superficie de API (todo via Inertia, sin REST API separada)
- SQLite para desarrollo, compatible con MySQL/PostgreSQL en producción

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│  Pages: Dashboard, Expenses, Children, Missions, etc.   │
└────────────────────────┬────────────────────────────────┘
                         │ Inertia.js (XHR + full-page)
┌────────────────────────▼────────────────────────────────┐
│                  Laravel (Controllers)                   │
│  ExpenseController, ChildController, MissionController  │
│  MoneyRequestController, RestrictionController          │
└────────────────────────┬────────────────────────────────┘
                         │ Eloquent ORM
┌────────────────────────▼────────────────────────────────┐
│                      Database (SQLite)                   │
│  users, expenses, child_accounts, category_restrictions │
│  schedule_restrictions, money_requests, missions        │
└─────────────────────────────────────────────────────────┘
```

**Decisiones de arquitectura:**
- **Sin API REST separada**: Inertia maneja todo. Elimina la necesidad de serialización JSON manual y autenticación de tokens.
- **Un solo modelo User con rol**: En lugar de dos tablas de usuarios, se agrega `role` (parent/child) y `parent_id` al modelo `User` existente. Simplifica auth y relaciones.
- **Restricciones evaluadas en el servidor**: Las restricciones de horario y categoría se validan en el `ExpenseController` antes de persistir, no en el frontend.
- **Notificaciones via Laravel Notifications**: Se usa el sistema de notificaciones de Laravel con el canal `database` para notificaciones in-app. Sin WebSockets para el hackathon.
- **Saldo como columna calculada**: El saldo del hijo (`balance`) se guarda como columna en `users` y se actualiza transaccionalmente al aprobar solicitudes/misiones.

---

## Components and Interfaces

### Backend — Controllers

```
app/Http/Controllers/
├── DashboardController.php          # Dashboard principal (padre e hijo)
├── ExpenseController.php            # CRUD de gastos + validación de restricciones
├── ChildController.php              # Gestión de cuentas hijo
├── RestrictionController.php        # Restricciones de horario y categoría
├── MoneyRequestController.php       # Solicitudes de dinero
└── MissionController.php            # Misiones y recompensas
```

### Backend — Models

```
app/Models/
├── User.php                         # Extendido con role, parent_id, balance, phone
├── Expense.php                      # Gasto con user_id, amount, category, description, date
├── ScheduleRestriction.php          # Restricción de horario por hijo
├── CategoryRestriction.php          # Restricción de categoría por hijo
├── MoneyRequest.php                 # Solicitud de dinero hijo→padre
└── Mission.php                      # Misión padre→hijo con recompensa
```

### Frontend — Pages (Inertia)

```
resources/js/pages/
├── dashboard.tsx                    # Dashboard principal (adapta según rol)
├── expenses/
│   ├── index.tsx                    # Listado de gastos
│   └── form.tsx                     # Formulario crear/editar gasto
├── children/
│   ├── index.tsx                    # Listado de hijos (vista padre)
│   └── show.tsx                     # Dashboard del hijo (vista padre)
├── restrictions/
│   └── index.tsx                    # Gestión de restricciones (vista padre)
├── money-requests/
│   └── index.tsx                    # Solicitudes de dinero
└── missions/
    └── index.tsx                    # Misiones y recompensas
```

### Frontend — Shared Components

```
resources/js/components/
├── expenses/
│   ├── ExpenseForm.tsx              # Formulario reutilizable de gasto
│   └── ExpenseList.tsx             # Tabla/lista de gastos
├── dashboard/
│   ├── SpendingChart.tsx           # Gráfica de distribución por categoría (Recharts)
│   └── StatsCard.tsx               # Tarjeta de estadística
├── children/
│   └── ChildCard.tsx               # Tarjeta de cuenta hijo
├── missions/
│   └── MissionCard.tsx             # Tarjeta de misión
└── money-requests/
    └── RequestCard.tsx             # Tarjeta de solicitud de dinero
```

---

## Data Models

### Tabla: `users` (extendida)

```sql
ALTER TABLE users ADD COLUMN role ENUM('parent', 'child') DEFAULT 'parent';
ALTER TABLE users ADD COLUMN parent_id BIGINT UNSIGNED NULL REFERENCES users(id);
ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;  -- para integración WhatsApp
```

### Tabla: `expenses`

```sql
CREATE TABLE expenses (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount      DECIMAL(10,2) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    date        DATE NOT NULL,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

**Categorías válidas (enum en PHP):** `Alimentación`, `Transporte`, `Entretenimiento`, `Salud`, `Educación`, `Hogar`, `Ropa`, `Otros`

### Tabla: `schedule_restrictions`

```sql
CREATE TABLE schedule_restrictions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id    BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    days        JSON NOT NULL,          -- ["monday","tuesday",...]
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

### Tabla: `category_restrictions`

```sql
CREATE TABLE category_restrictions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id        BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        VARCHAR(50) NOT NULL,
    type            ENUM('blocked', 'limited') NOT NULL,
    monthly_limit   DECIMAL(10,2) NULL,   -- solo si type = 'limited'
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    UNIQUE KEY unique_child_category (child_id, category)
);
```

### Tabla: `money_requests`

```sql
CREATE TABLE money_requests (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id    BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id   BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount      DECIMAL(10,2) NOT NULL,
    reason      VARCHAR(255) NOT NULL,
    status      ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
    reject_reason VARCHAR(255) NULL,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

### Tabla: `missions`

```sql
CREATE TABLE missions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id   BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id    BIGINT UNSIGNED NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(100) NOT NULL,
    description TEXT NULL,
    reward      DECIMAL(10,2) NOT NULL,
    status      ENUM('activa','en_revision','completada','rechazada') DEFAULT 'activa',
    reject_reason VARCHAR(255) NULL,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

### Relaciones Eloquent

```
User (parent)
  ├── hasMany Expense
  ├── hasMany User as children (parent_id)
  ├── hasMany Mission as createdMissions
  └── hasMany MoneyRequest as parentRequests

User (child)
  ├── hasMany Expense
  ├── belongsTo User as parent
  ├── hasOne ScheduleRestriction
  ├── hasMany CategoryRestriction
  ├── hasMany MoneyRequest as childRequests
  └── hasMany Mission as assignedMissions

Expense
  └── belongsTo User

Mission / MoneyRequest
  ├── belongsTo User as child
  └── belongsTo User as parent
```

---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de corrección verificables automáticamente.*

### Property 1: Registro con datos válidos crea usuario

*Para cualquier* combinación válida de (nombre, email único, contraseña ≥ 8 caracteres), enviar el formulario de registro debe crear exactamente un registro de usuario en la base de datos con rol `parent`.

**Validates: Requirements 1.2**

### Property 2: Contraseña corta es rechazada

*Para cualquier* string de contraseña con longitud entre 1 y 7 caracteres, el intento de registro debe ser rechazado con el mensaje "La contraseña debe tener al menos 8 caracteres".

**Validates: Requirements 1.4**

### Property 3: Login con credenciales válidas autentica

*Para cualquier* usuario registrado, enviar sus credenciales correctas en el formulario de login debe resultar en una sesión autenticada y redirección al dashboard.

**Validates: Requirements 1.5**

### Property 4: Gasto válido es persistido y aparece en listado

*Para cualquier* combinación válida de (monto > 0, categoría válida, fecha), crear un gasto debe resultar en un registro persistido que aparece en el listado de gastos del usuario.

**Validates: Requirements 2.2**

### Property 5: Monto no positivo es rechazado

*Para cualquier* valor de monto ≤ 0, el intento de crear un gasto debe ser rechazado con el mensaje "El monto debe ser mayor a cero".

**Validates: Requirements 2.3**

### Property 6: Actualización de gasto refleja nuevos valores

*Para cualquier* gasto existente y cualquier conjunto válido de nuevos valores (monto, categoría, fecha), después de la actualización el registro debe contener exactamente los nuevos valores.

**Validates: Requirements 2.6**

### Property 7: Eliminación de gasto lo remueve del listado

*Para cualquier* gasto existente, después de su eliminación no debe aparecer en el listado de gastos del usuario.

**Validates: Requirements 2.7**

### Property 8: Total del dashboard es la suma de gastos del mes

*Para cualquier* conjunto de gastos del mes en curso con montos conocidos, el total mostrado en el dashboard debe ser igual a la suma aritmética de esos montos.

**Validates: Requirements 3.1**

### Property 9: Gráfica agrupa gastos correctamente por categoría

*Para cualquier* conjunto de gastos distribuidos en categorías, los datos de la gráfica deben agrupar los gastos por categoría con totales que sumen exactamente los montos de cada categoría.

**Validates: Requirements 3.2**

### Property 10: Filtro por rango de fechas incluye solo gastos del período

*Para cualquier* rango de fechas [inicio, fin] y cualquier conjunto de gastos, el total calculado debe incluir únicamente los gastos cuya fecha cae dentro del rango.

**Validates: Requirements 3.4**

### Property 11: Creación de cuenta hijo la vincula al padre

*Para cualquier* par válido (nombre, email único), crear una cuenta hijo debe resultar en un registro de usuario con `parent_id` apuntando al padre creador, recuperable en el listado de hijos del padre.

**Validates: Requirements 5.2**

### Property 12: Eliminación de cuenta hijo preserva historial de gastos

*Para cualquier* cuenta hijo con gastos registrados, después de desvincularla los registros de gastos del hijo deben seguir existiendo en la base de datos.

**Validates: Requirements 5.4**

### Property 13: Restricción de horario bloquea gastos fuera del intervalo

*Para cualquier* restricción de horario con intervalo [inicio, fin] y cualquier momento fuera de ese intervalo, el intento de registrar un gasto por el hijo debe ser rechazado con el mensaje "No puedes registrar gastos en este horario".

**Validates: Requirements 7.2**

### Property 14: Categoría bloqueada rechaza gastos en esa categoría

*Para cualquier* categoría marcada como bloqueada para un hijo, el intento de registrar un gasto en esa categoría debe ser rechazado con el mensaje "Tu padre ha bloqueado esta categoría".

**Validates: Requirements 8.2**

### Property 15: Límite mensual de categoría rechaza gastos al alcanzarse

*Para cualquier* categoría con límite mensual L y gastos acumulados en el mes que sumen ≥ L, un nuevo gasto en esa categoría debe ser rechazado.

**Validates: Requirements 8.3**

### Property 16: Aprobación de solicitud incrementa saldo del hijo

*Para cualquier* solicitud de dinero pendiente con monto A, después de la aprobación del padre el saldo del hijo debe incrementarse en exactamente A.

**Validates: Requirements 9.2**

### Property 17: Aprobación de misión acredita recompensa al hijo

*Para cualquier* misión en estado "en_revision" con recompensa R, después de la aprobación del padre el saldo del hijo debe incrementarse en exactamente R y el estado de la misión debe ser "completada".

**Validates: Requirements 10.3**

### Property 18: Rechazo de misión la devuelve a estado activo

*Para cualquier* misión en estado "en_revision", después del rechazo del padre el estado debe volver a "activa".

**Validates: Requirements 10.4**

---

## Error Handling

### Validación de formularios
- Usar `FormRequest` de Laravel para todas las validaciones del servidor
- Inertia propaga los errores de validación automáticamente al componente React via `usePage().props.errors`
- Mostrar errores inline junto al campo correspondiente usando el componente `InputError` existente

### Restricciones de acceso
- Middleware `auth` en todas las rutas protegidas (ya configurado)
- Policy de Laravel para verificar que un padre solo accede a sus propios hijos
- Verificación de restricciones de horario y categoría en `ExpenseController@store` antes de persistir

### Errores de negocio
- Retornar errores de negocio (restricción activa, límite alcanzado) via `back()->withErrors(['message' => '...'])` o como prop de Inertia
- El frontend muestra estos mensajes en un componente `Alert` existente

### Transacciones de base de datos
- Usar `DB::transaction()` para operaciones que modifican saldo (aprobación de solicitudes y misiones)
- Garantiza consistencia si falla algún paso intermedio

---

## Testing Strategy

### Enfoque dual: Unit + Property-Based

**Unit tests (Pest PHP):**
- Casos específicos y condiciones de borde
- Integración entre controladores y modelos
- Flujos de autenticación y autorización

**Property-based tests (Pest + `edalzell/pest-plugin-faker` o generadores manuales):**
- Propiedades universales definidas en la sección anterior
- Mínimo 100 iteraciones por propiedad
- Cada test referencia su propiedad con el tag: `// Feature: capital-life, Property N: <texto>`

### Estructura de tests

```
tests/
├── Unit/
│   ├── ExpenseValidationTest.php
│   ├── RestrictionEnforcementTest.php
│   └── BalanceCalculationTest.php
├── Feature/
│   ├── Auth/
│   │   └── RegistrationTest.php
│   ├── Expenses/
│   │   └── ExpenseCrudTest.php
│   ├── Dashboard/
│   │   └── DashboardDataTest.php
│   ├── Children/
│   │   └── ChildManagementTest.php
│   ├── Restrictions/
│   │   └── RestrictionEnforcementTest.php
│   ├── MoneyRequests/
│   │   └── MoneyRequestFlowTest.php
│   └── Missions/
│       └── MissionFlowTest.php
└── Property/
    ├── ExpensePropertiesTest.php    # Properties 4-7
    ├── DashboardPropertiesTest.php  # Properties 8-10
    ├── AuthPropertiesTest.php       # Properties 1-3
    ├── ChildPropertiesTest.php      # Properties 11-12
    ├── RestrictionPropertiesTest.php # Properties 13-15
    └── FinancialPropertiesTest.php  # Properties 16-18
```

### Configuración de property tests

```php
// Ejemplo de property test con Pest
it('rejects expenses with non-positive amounts', function () {
    // Feature: capital-life, Property 5: Monto no positivo es rechazado
    $user = User::factory()->create(['role' => 'parent']);
    
    repeat(100, function () use ($user) {
        $amount = fake()->randomFloat(2, -1000, 0);
        $response = actingAs($user)->post('/expenses', [
            'amount' => $amount,
            'category' => 'Alimentación',
            'date' => today()->toDateString(),
        ]);
        $response->assertSessionHasErrors(['amount']);
    });
});
```

### Tests de integración para WhatsApp (Req 4)
- Mockear el cliente de Twilio/Meta
- Mockear el cliente de OpenAI/LLM
- Verificar el flujo completo con 2-3 ejemplos representativos
