# Documento de Requerimientos — Capital Life

## Introducción

Capital Life es una aplicación de finanzas personales construida sobre Laravel + Inertia + React. El producto tiene dos fases principales:

- **Fase 1**: App de finanzas general — registro de gastos con categorías, dashboard de análisis e integración opcional con WhatsApp + IA para registrar gastos por mensaje de texto.
- **Fase 2**: Control parental — cuentas de hijos vinculadas a la cuenta del padre, con restricciones de horario, límites por categoría, solicitudes de dinero y gamificación mediante misiones.

El contexto es un hackathon de 7 horas, por lo que los requerimientos priorizan el valor de negocio y la viabilidad de implementación rápida.

---

## Glosario

- **Sistema**: La aplicación web Capital Life.
- **Usuario_Padre**: Usuario adulto que posee la cuenta principal y puede tener cuentas de hijos vinculadas.
- **Usuario_Hijo**: Usuario menor de edad cuya cuenta está vinculada a la cuenta de un Usuario_Padre.
- **Gasto**: Registro de una transacción de dinero saliente asociada a un usuario, monto, categoría y fecha.
- **Categoría**: Clasificación temática de un gasto (ej. Alimentación, Transporte, Entretenimiento).
- **Dashboard**: Vista principal que muestra resúmenes y gráficas del estado financiero del usuario.
- **Agente_IA**: Componente que interpreta mensajes en lenguaje natural para extraer datos de un gasto.
- **Integración_WhatsApp**: Canal de comunicación vía WhatsApp Business API (Twilio o Meta) que recibe mensajes del usuario y los envía al Agente_IA.
- **Cuenta_Hijo**: Perfil de Usuario_Hijo creado y administrado por un Usuario_Padre.
- **Restriccion_Horario**: Regla que define los intervalos de tiempo en que la Cuenta_Hijo puede registrar gastos.
- **Restriccion_Categoria**: Regla que bloquea o limita el gasto en una Categoría específica para una Cuenta_Hijo.
- **Solicitud_Dinero**: Petición formal de un Usuario_Hijo al Usuario_Padre para recibir fondos adicionales.
- **Mision**: Tarea definida por el Usuario_Padre que, al ser completada por el Usuario_Hijo, desbloquea una recompensa monetaria.
- **Recompensa**: Monto de dinero que se transfiere al saldo del Usuario_Hijo al completar una Mision.

---

## Requerimientos

---

## FASE 1 — App de Finanzas General

---

### Requerimiento 1: Registro de cuenta de usuario

**Historia de usuario:** Como visitante, quiero crear una cuenta en Capital Life, para poder comenzar a registrar mis finanzas personales.

#### Criterios de aceptación

1. THE Sistema SHALL presentar un formulario de registro con los campos nombre, correo electrónico y contraseña.
2. WHEN un visitante envía el formulario de registro con datos válidos, THE Sistema SHALL crear una cuenta de Usuario_Padre y redirigirlo al Dashboard.
3. IF el correo electrónico ya está registrado, THEN THE Sistema SHALL mostrar el mensaje "Este correo ya está en uso. ¿Olvidaste tu contraseña?".
4. IF la contraseña tiene menos de 8 caracteres, THEN THE Sistema SHALL mostrar el mensaje "La contraseña debe tener al menos 8 caracteres".
5. WHEN un usuario registrado envía el formulario de inicio de sesión con credenciales válidas, THE Sistema SHALL autenticarlo y redirigirlo al Dashboard.
6. IF un usuario envía credenciales incorrectas, THEN THE Sistema SHALL mostrar el mensaje "Correo o contraseña incorrectos" sin especificar cuál campo falló.

---

### Requerimiento 2: Registro de gastos

**Historia de usuario:** Como Usuario_Padre, quiero registrar mis gastos con categoría, monto y fecha, para llevar un control detallado de mis finanzas.

#### Criterios de aceptación

1. THE Sistema SHALL presentar un formulario de registro de Gasto con los campos: monto, categoría, descripción opcional y fecha.
2. WHEN un usuario autenticado envía el formulario con datos válidos, THE Sistema SHALL persistir el Gasto y mostrarlo en el listado de gastos.
3. IF el monto ingresado es menor o igual a cero, THEN THE Sistema SHALL mostrar el mensaje "El monto debe ser mayor a cero".
4. IF el campo de categoría está vacío, THEN THE Sistema SHALL mostrar el mensaje "Selecciona una categoría".
5. THE Sistema SHALL ofrecer las siguientes categorías predefinidas: Alimentación, Transporte, Entretenimiento, Salud, Educación, Hogar, Ropa, Otros.
6. WHEN un usuario selecciona un Gasto existente y envía el formulario de edición con datos válidos, THE Sistema SHALL actualizar el Gasto y reflejar los cambios en el listado.
7. WHEN un usuario confirma la eliminación de un Gasto, THE Sistema SHALL eliminar el registro y removerlo del listado.

---

### Requerimiento 3: Dashboard de gastos

**Historia de usuario:** Como Usuario_Padre, quiero ver un resumen visual de mis gastos, para entender en qué estoy gastando mi dinero.

#### Criterios de aceptación

1. WHEN un usuario autenticado accede al Dashboard, THE Sistema SHALL mostrar el total de gastos del mes en curso.
2. WHEN un usuario autenticado accede al Dashboard, THE Sistema SHALL mostrar una gráfica de distribución de gastos por Categoría para el mes en curso.
3. WHEN un usuario autenticado accede al Dashboard, THE Sistema SHALL mostrar los 5 gastos más recientes con su monto, categoría y fecha.
4. WHEN un usuario selecciona un rango de fechas en el Dashboard, THE Sistema SHALL recalcular y mostrar los totales y la gráfica para el período seleccionado.
5. THE Sistema SHALL mostrar el Dashboard en menos de 2 segundos para conjuntos de hasta 1,000 registros de Gasto por usuario.

---

### Requerimiento 4: Integración con WhatsApp + IA para registro de gastos (opcional)

**Historia de usuario:** Como Usuario_Padre, quiero enviar un mensaje de WhatsApp con la descripción de un gasto, para registrarlo sin abrir la aplicación.

#### Criterios de aceptación

1. WHERE la Integración_WhatsApp está habilitada, THE Sistema SHALL recibir mensajes entrantes del usuario en el número de WhatsApp configurado.
2. WHEN el Sistema recibe un mensaje de texto de un usuario registrado, THE Agente_IA SHALL extraer el monto, la categoría y la descripción del mensaje.
3. WHEN el Agente_IA extrae correctamente los datos del mensaje, THE Sistema SHALL crear un Gasto con esos datos y responder al usuario con "Gasto registrado: [descripción] por $[monto] en [categoría]".
4. IF el Agente_IA no puede determinar el monto del mensaje, THEN THE Sistema SHALL responder al usuario con "No pude identificar el monto. Intenta con: 'Café 50 pesos'".
5. IF el Agente_IA no puede determinar la categoría del mensaje, THEN THE Sistema SHALL asignar la categoría "Otros" y notificar al usuario en la respuesta.
6. WHEN el Sistema recibe un mensaje de un número de teléfono no vinculado a ninguna cuenta, THE Sistema SHALL responder con "Este número no está vinculado a una cuenta de Capital Life. Regístrate en [URL]".
7. THE Sistema SHALL procesar el mensaje y responder al usuario en menos de 5 segundos desde la recepción.

---

## FASE 2 — Control Parental

---

### Requerimiento 5: Creación y gestión de Cuenta_Hijo

**Historia de usuario:** Como Usuario_Padre, quiero crear una cuenta para mi hijo vinculada a mi cuenta, para supervisar y controlar sus gastos.

#### Criterios de aceptación

1. WHEN un Usuario_Padre accede a la sección de control parental, THE Sistema SHALL mostrar el listado de Cuentas_Hijo vinculadas a su cuenta.
2. WHEN un Usuario_Padre envía el formulario de creación de Cuenta_Hijo con nombre y correo válidos, THE Sistema SHALL crear la Cuenta_Hijo vinculada al Usuario_Padre y enviar una invitación al correo del hijo.
3. IF el correo de la Cuenta_Hijo ya está registrado como Usuario_Padre, THEN THE Sistema SHALL mostrar el mensaje "Este correo ya tiene una cuenta principal. Usa otro correo".
4. WHEN un Usuario_Padre elimina una Cuenta_Hijo, THE Sistema SHALL desvincular la cuenta y conservar el historial de gastos del hijo.
5. THE Sistema SHALL permitir a un Usuario_Padre tener hasta 5 Cuentas_Hijo vinculadas simultáneamente.

---

### Requerimiento 6: Dashboard de gastos del hijo

**Historia de usuario:** Como Usuario_Padre, quiero ver el dashboard de gastos de mi hijo, para monitorear en qué está gastando su dinero.

#### Criterios de aceptación

1. WHEN un Usuario_Padre selecciona una Cuenta_Hijo, THE Sistema SHALL mostrar el Dashboard de esa cuenta con el total de gastos del mes en curso.
2. WHEN un Usuario_Padre accede al Dashboard de una Cuenta_Hijo, THE Sistema SHALL mostrar la gráfica de distribución de gastos por Categoría del hijo para el mes en curso.
3. WHEN un Usuario_Padre accede al Dashboard de una Cuenta_Hijo, THE Sistema SHALL mostrar los 5 gastos más recientes del hijo.
4. WHILE un Usuario_Hijo está autenticado, THE Sistema SHALL mostrar su propio Dashboard con sus gastos y saldo disponible.

---

### Requerimiento 7: Bloqueo de gastos por horario

**Historia de usuario:** Como Usuario_Padre, quiero definir los horarios en que mi hijo puede registrar gastos, para evitar compras fuera de horas permitidas.

#### Criterios de aceptación

1. WHEN un Usuario_Padre crea una Restriccion_Horario para una Cuenta_Hijo, THE Sistema SHALL persistir el intervalo de días y horas permitidos.
2. WHILE el horario actual está fuera del intervalo definido en la Restriccion_Horario, THE Sistema SHALL rechazar el registro de Gastos del Usuario_Hijo y mostrar el mensaje "No puedes registrar gastos en este horario".
3. WHILE el horario actual está dentro del intervalo permitido, THE Sistema SHALL permitir al Usuario_Hijo registrar Gastos normalmente.
4. WHEN un Usuario_Padre modifica una Restriccion_Horario existente, THE Sistema SHALL aplicar los nuevos intervalos de forma inmediata.
5. IF una Cuenta_Hijo no tiene Restriccion_Horario configurada, THEN THE Sistema SHALL permitir el registro de Gastos en cualquier horario.

---

### Requerimiento 8: Restricciones de gasto por categoría

**Historia de usuario:** Como Usuario_Padre, quiero bloquear o limitar el gasto de mi hijo en ciertas categorías, para orientar sus hábitos de consumo.

#### Criterios de aceptación

1. WHEN un Usuario_Padre crea una Restriccion_Categoria para una Cuenta_Hijo, THE Sistema SHALL persistir la categoría bloqueada o el límite de monto mensual para esa categoría.
2. WHILE una Categoría está bloqueada para una Cuenta_Hijo, THE Sistema SHALL rechazar el registro de Gastos en esa Categoría y mostrar el mensaje "Tu padre ha bloqueado esta categoría".
3. WHEN el total de Gastos de un Usuario_Hijo en una Categoría con límite mensual alcanza el límite configurado, THE Sistema SHALL rechazar nuevos Gastos en esa Categoría y notificar al Usuario_Padre.
4. WHEN un Usuario_Padre elimina una Restriccion_Categoria, THE Sistema SHALL permitir al Usuario_Hijo registrar Gastos en esa Categoría de forma inmediata.
5. THE Sistema SHALL mostrar al Usuario_Hijo las categorías bloqueadas y los límites activos en su Dashboard.

---

### Requerimiento 9: Solicitud de dinero al padre

**Historia de usuario:** Como Usuario_Hijo, quiero enviar una solicitud de dinero a mi padre, para recibir fondos adicionales cuando los necesite.

#### Criterios de aceptación

1. WHEN un Usuario_Hijo envía una Solicitud_Dinero con monto y motivo, THE Sistema SHALL persistir la solicitud con estado "pendiente" y notificar al Usuario_Padre.
2. WHEN un Usuario_Padre aprueba una Solicitud_Dinero, THE Sistema SHALL actualizar el estado a "aprobada" y acreditar el monto al saldo del Usuario_Hijo.
3. WHEN un Usuario_Padre rechaza una Solicitud_Dinero, THE Sistema SHALL actualizar el estado a "rechazada" y notificar al Usuario_Hijo con el motivo del rechazo.
4. IF un Usuario_Hijo tiene más de 3 Solicitudes_Dinero con estado "pendiente", THEN THE Sistema SHALL rechazar nuevas solicitudes y mostrar el mensaje "Tienes solicitudes pendientes. Espera a que tu padre las revise".
5. WHEN el estado de una Solicitud_Dinero cambia, THE Sistema SHALL notificar al usuario correspondiente mediante una notificación en la aplicación.

---

### Requerimiento 10: Gamificación — Misiones y recompensas

**Historia de usuario:** Como Usuario_Padre, quiero crear misiones para mi hijo con recompensas monetarias, para incentivar buenos hábitos y responsabilidad financiera.

#### Criterios de aceptación

1. WHEN un Usuario_Padre crea una Mision con título, descripción y Recompensa, THE Sistema SHALL persistir la Mision con estado "activa" y mostrarla al Usuario_Hijo.
2. WHEN un Usuario_Hijo marca una Mision como completada, THE Sistema SHALL cambiar el estado a "en revisión" y notificar al Usuario_Padre.
3. WHEN un Usuario_Padre aprueba la completación de una Mision, THE Sistema SHALL cambiar el estado a "completada" y acreditar la Recompensa al saldo del Usuario_Hijo.
4. WHEN un Usuario_Padre rechaza la completación de una Mision, THE Sistema SHALL cambiar el estado a "activa" y notificar al Usuario_Hijo con el motivo del rechazo.
5. IF la Recompensa de una Mision es mayor al saldo disponible del Usuario_Padre, THEN THE Sistema SHALL mostrar una advertencia al Usuario_Padre al momento de crear la Mision.
6. WHEN un Usuario_Hijo accede a su Dashboard, THE Sistema SHALL mostrar las Misiones activas con su título, descripción y Recompensa.
7. THE Sistema SHALL mostrar al Usuario_Hijo un historial de Misiones completadas con las Recompensas obtenidas.

---

## Notas de implementación para el hackathon

> Estas notas no son requerimientos formales, sino guía de priorización para las 7 horas disponibles.

**Prioridad alta (MVP):**
- Requerimientos 1, 2, 3 (Fase 1 core)
- Requerimientos 5, 6 (Fase 2 base)

**Prioridad media:**
- Requerimientos 7, 8 (restricciones)
- Requerimiento 9 (solicitudes)
- Requerimiento 10 (gamificación)

**Prioridad baja (si hay tiempo):**
- Requerimiento 4 (WhatsApp + IA)
