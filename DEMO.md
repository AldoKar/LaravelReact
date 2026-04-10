# Capital Life - Demo Setup

## 🚀 Configuración Rápida para Demo

### 1. Resetear y Sembrar Base de Datos

```bash
php artisan migrate:fresh --seed
```

### 2. Credenciales de Demo

**Cuenta Padre:**
- Email: `roberto@capitallife.com`
- Password: `password`
- Saldo: $5,000.00

**Cuenta Hijo 1 (Sofia):**
- Email: `sofia@capitallife.com`
- Password: `password`
- Saldo: $250.00
- Restricciones: 
  - Horario: Lunes a Viernes, 9:00 AM - 6:00 PM
  - Límite en Entretenimiento: $100/mes

**Cuenta Hijo 2 (Fabian):**
- Email: `fabian@capitallife.com`
- Password: `password`
- Saldo: $180.00
- Restricciones:
  - Categoría "Entretenimiento" bloqueada

## 📊 Datos de Demo Incluidos

### Gastos
- **Padre**: 12 gastos variados del último mes
- **Sofia**: 15 gastos de los últimos 15 días
- **Fabian**: 12 gastos de los últimos 20 días

### Misiones
- **Sofia**: 
  - 1 misión activa ($50)
  - 1 misión en revisión ($75)
  - 1 misión completada ($100)
- **Fabian**: 
  - 1 misión activa ($80)
  - 1 misión completada ($60)
  - 1 misión rechazada ($120)

### Restricciones
- **Sofia**: Horario limitado + límite mensual en Entretenimiento
- **Fabian**: Categoría Entretenimiento bloqueada

## 🎯 Flujo de Demo Sugerido

1. **Login como Padre** → Ver dashboard con resumen familiar
2. **Ver Cuentas Hijo** → Mostrar Sofia y Fabian con sus saldos
3. **Ver Dashboard de Sofia** → Mostrar gastos y restricciones
4. **Ver Misiones** → Mostrar misiones activas, en revisión y completadas
5. **Aprobar Misión de Sofia** → Demostrar flujo de aprobación y acreditación
6. **Login como Sofia** → Mostrar vista de hijo
7. **Intentar registrar gasto fuera de horario** → Demostrar restricción
8. **Intentar registrar gasto en categoría bloqueada** → Demostrar bloqueo
9. **Marcar misión como completada** → Demostrar flujo hijo→padre

## 💡 Tips para la Presentación

- Los datos son realistas y variados
- Hay ejemplos de todos los flujos principales
- Las restricciones están configuradas para demostrar fácilmente
- Los saldos permiten crear nuevas misiones y gastos
