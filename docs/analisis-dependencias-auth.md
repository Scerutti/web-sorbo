# Análisis Técnico: Dependencias de Autenticación Frontend-Backend

**Fecha:** 2024  
**Objetivo:** Diagnosticar qué espera el frontend respecto al sistema de autenticación del backend antes de implementar JWT real.

---

## 1. Endpoints Esperados por el Frontend

### 1.1. Endpoint: POST `/auth/login`

**Ubicación en código:** `src/services/auth.service.ts:31`

**Método:** `POST`  
**Ruta:** `/auth/login`  
**Body esperado:**
```typescript
{
  email: string
  password: string
}
```

**Respuesta esperada:**
```typescript
{
  accessToken: string
  user: {
    id: string
    email: string
    name: string
  }
}
```

**Status codes esperados:**
- `200 OK`: Login exitoso
- Otros: Error (el frontend captura excepciones)

**Cookies esperadas:**
- `refreshToken` en cookie **HttpOnly** (según comentarios en `httpPrivate.ts`)

**Notas:**
- El frontend NO envía `withCredentials: true` explícitamente en esta llamada (debería agregarse si el backend espera cookies).
- Actualmente la llamada está comentada: `// const response = await api.post<AuthResponse>('/auth/login', { email, password })`

---

### 1.2. Endpoint: POST `/auth/refresh`

**Ubicación en código:** `src/shared/httpPrivate.ts:64-68` y `src/services/auth.service.ts:72-77`

**Método:** `POST`  
**Ruta:** `/auth/refresh`  
**Body:** `{}` (vacío)  
**Headers/Cookies:**
- `withCredentials: true` (envía cookies HttpOnly automáticamente)
- El refresh token debe venir en cookie HttpOnly desde el backend

**Respuesta esperada:**
```typescript
{
  accessToken: string
}
```

**Status codes esperados:**
- `200 OK`: Refresh exitoso, nuevo accessToken en body
- `401 Unauthorized`: Refresh token inválido/expirado → redirige a `/login`

**Flujo actual:**
- El interceptor de Axios (`httpPrivate.ts:50-99`) detecta `401` en cualquier petición autenticada.
- Intenta llamar a `/auth/refresh` automáticamente.
- Si tiene éxito, actualiza `(window as any).__accessToken` y reintenta la petición original.
- Si falla, limpia el token y redirige a `/login`.

**Notas:**
- La implementación está comentada (líneas 62-78 de `httpPrivate.ts`).
- Actualmente simula un fallo y redirige a login.

---

### 1.3. Endpoint: POST `/auth/logout`

**Ubicación en código:** `src/services/auth.service.ts:46`

**Método:** `POST`  
**Ruta:** `/auth/logout`  
**Body:** `{}`  
**Headers/Cookies:**
- `withCredentials: true` (para limpiar cookie HttpOnly del refreshToken)

**Respuesta esperada:**
- Sin body (void)
- Status `200 OK` o `204 No Content`

**Flujo:**
- El frontend limpia `accessToken` de memoria incluso si la llamada falla (`useAuth.tsx:53-64`).
- El backend debe invalidar/eliminar la cookie `refreshToken`.

---

### 1.4. Endpoint: POST `/auth/reset-password`

**Ubicación en código:** `src/services/auth.service.ts:59`

**Método:** `POST`  
**Ruta:** `/auth/reset-password`  
**Body:**
```typescript
{
  email: string
}
```

**Respuesta esperada:**
- Sin body (void)
- Status `200 OK` o `202 Accepted`

**Notas:**
- Endpoint público, no requiere autenticación.
- El frontend solo muestra mensaje de éxito/error.

---

### 1.5. Endpoint: GET `/auth/me` (NO IMPLEMENTADO PERO RECOMENDADO)

**Ubicación en código:** `src/hooks/useAuth.tsx:36-40`

**Estado actual:**
- El frontend tiene un TODO para verificar sesión al montar la app.
- Comentario: `// TODO: Verificar si hay sesión activa llamando al backend`
- Actualmente no hace nada y deja `isLoading: false` sin verificar.

**Recomendación para backend:**
- Implementar `GET /auth/me` que devuelva el `User` actual basado en el token/cookie.
- El frontend debería llamar esto al inicio para:
  - Restaurar sesión después de recargar la página (si hay refreshToken válido).
  - Verificar si la sesión sigue activa.

**Respuesta esperada:**
```typescript
{
  user: {
    id: string
    email: string
    name: string
  }
}
```

**Status codes:**
- `200 OK`: Sesión válida
- `401 Unauthorized`: Sesión inválida/expirada

---

## 2. Headers y Cookies

### 2.1. Authorization Header

**Formato:** `Authorization: Bearer <accessToken>`

**Ubicación:** `src/shared/httpPrivate.ts:32-35`

**Implementación:**
- El interceptor de request adjunta el header automáticamente en TODAS las peticiones.
- Obtiene el token de `(window as any).__accessToken`.
- Este token se sincroniza desde el contexto de React (`useAuth.tsx:27-33`).

**Nota:** Actualmente funciona con variable global `window.__accessToken` porque los interceptores de Axios no pueden acceder directamente a React Context.

---

### 2.2. Cookies HttpOnly (Refresh Token)

**Tipo:** Cookie HttpOnly  
**Nombre esperado:** `refreshToken` (implícito, no explícito en código)

**Configuración:**
- El frontend configura Axios con `withCredentials: true` (`httpPrivate.ts:14`).
- Esto envía cookies automáticamente en TODAS las peticiones al mismo dominio.

**Flujo:**
1. Login: Backend debe SETEAR cookie HttpOnly con `refreshToken`.
2. Refresh: Frontend envía cookie automáticamente, backend valida y devuelve nuevo `accessToken`.
3. Logout: Backend debe ELIMINAR/INVALIDAR la cookie.

---

## 3. Almacenamiento de Tokens

### 3.1. Access Token

**Ubicación:** Memoria (React Context + variable global `window.__accessToken`)

**Archivos relacionados:**
- `src/hooks/useAuth.tsx:22-33`: Estado en React Context
- `src/shared/httpPrivate.ts:32`: Lectura desde `window.__accessToken`

**Persistencia:**
- ❌ **NO se guarda en localStorage**
- ❌ **NO se guarda en sessionStorage**
- ✅ **Solo en memoria (React state + window global)**

**Vida útil:**
- Se pierde al recargar la página.
- Depende del refreshToken en cookie para restaurar la sesión (pero esto NO está implementado actualmente).

---

### 3.2. Refresh Token

**Ubicación:** Cookie HttpOnly (manejada por el backend)

**Acceso desde frontend:**
- ❌ **NO accesible desde JavaScript** (HttpOnly)
- ✅ **Se envía automáticamente con `withCredentials: true`**

---

### 3.3. User Data

**Ubicación:** Memoria (React Context)

**Archivo:** `src/hooks/useAuth.tsx:22`

**Persistencia:**
- ❌ **NO se guarda en localStorage**
- Se pierde al recargar la página.

---

## 4. Mecanismos de Seguridad y Persistencia

### 4.1. Request Interceptor (Adjunta Token)

**Ubicación:** `src/shared/httpPrivate.ts:21-42`

**Funcionalidad:**
- Intercepta TODAS las peticiones HTTP antes de enviarlas.
- Adjunta `Authorization: Bearer <token>` si existe `window.__accessToken`.

**Estado actual:**
- ✅ Implementado y funcional.

---

### 4.2. Response Interceptor (Auto-Refresh)

**Ubicación:** `src/shared/httpPrivate.ts:50-99`

**Funcionalidad:**
1. Detecta respuesta `401 Unauthorized`.
2. Si es la primera vez (`!originalRequest._retry`), intenta refresh.
3. Llama a `POST /auth/refresh` con `withCredentials: true`.
4. Si exitoso: actualiza token y reintenta petición original.
5. Si falla: limpia token y redirige a `/login`.

**Estado actual:**
- ⚠️ **Implementación comentada** (líneas 62-78).
- Actualmente solo simula fallo y redirige a login.

**Requisitos para activar:**
1. Backend debe implementar `POST /auth/refresh`.
2. Descomentar líneas 62-78 de `httpPrivate.ts`.
3. Actualizar `window.__accessToken` con el nuevo token.

---

### 4.3. Rutas Protegidas

**Ubicación:** `src/App.tsx:18-40`

**Componente:** `ProtectedRoute`

**Funcionalidad:**
- Verifica `isAuthenticated` del contexto.
- Si `isLoading: true`, muestra spinner.
- Si `!isAuthenticated`, redirige a `/login`.
- Si autenticado, renderiza children.

**Rutas protegidas:**
- `/dashboard`
- `/products`
- `/sales`
- `/costs`
- `/expenses`

**Rutas públicas:**
- `/login`
- `/reset-password`

---

### 4.4. Rutas Públicas (Solo sin Auth)

**Ubicación:** `src/App.tsx:45-67`

**Componente:** `PublicRoute`

**Funcionalidad:**
- Si el usuario YA está autenticado, redirige a `/dashboard`.
- Solo permite acceso si `!isAuthenticated`.

---

### 4.5. Verificación de Sesión al Iniciar

**Ubicación:** `src/hooks/useAuth.tsx:35-40`

**Estado actual:**
- ❌ **NO implementado**
- Comentario: `// TODO: Verificar si hay sesión activa llamando al backend`
- Actualmente deja `isLoading: false` sin verificar nada.
- Esto significa que **cada recarga de página requiere login nuevamente**.

**Recomendación:**
- Implementar llamada a `GET /auth/me` o similar.
- Si hay refreshToken válido en cookie, restaurar sesión.

---

## 5. Servicios que Dependen de Autenticación

Todos los servicios usan `httpPrivate.ts` (instancia de Axios con interceptores), por lo que TODAS las peticiones autenticadas envían el token automáticamente:

### 5.1. `productsService`
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

**Estado:** Llamadas comentadas, usa mocks si `VITE_USE_MOCKS=true`.

---

### 5.2. `salesService`
- `GET /sales`
- `GET /sales/:id`
- `POST /sales`

**Estado:** Llamadas comentadas, usa mocks si `VITE_USE_MOCKS=true`.

---

### 5.3. `costsService`
- `GET /costs`
- `GET /costs/:id`
- `POST /costs`
- `PUT /costs/:id`
- `DELETE /costs/:id`

**Estado:** Llamadas comentadas, usa mocks si `VITE_USE_MOCKS=true`.

---

## 6. Qué Pasaría Ahora Mismo Sin Backend de Auth

### 6.1. Escenario: `VITE_USE_MOCKS=false` y Backend SIN `/auth/login`

**Resultado:**
1. Usuario intenta login → `authService.login()` lanza error: `"Login no implementado sin mocks"`.
2. `LoginPage` muestra error genérico.
3. ❌ **Login falla completamente**.

---

### 6.2. Escenario: `VITE_USE_MOCKS=false`, Login funciona, pero Backend NO tiene `/auth/refresh`

**Resultado:**
1. Usuario hace login exitoso → recibe `accessToken`.
2. Usuario navega por la app.
3. Cuando el `accessToken` expira (según backend):
   - Cualquier petición autenticada recibe `401`.
   - Interceptor intenta refresh → llama a `/auth/refresh` (comentado, pero si se activa).
   - ❌ **404 Not Found** o **401** en refresh.
   - Interceptor limpia token y redirige a `/login`.
   - ⚠️ **Usuario pierde sesión sin aviso claro** (a menos que se muestre mensaje).

---

### 6.3. Escenario: Backend SIN cookies HttpOnly para refreshToken

**Resultado:**
1. Login funciona y devuelve `accessToken`, pero NO setea cookie `refreshToken`.
2. Cuando el `accessToken` expira:
   - Interceptor llama a `/auth/refresh` sin cookie.
   - ❌ **401 Unauthorized** en refresh.
   - Usuario es redirigido a login.
   - ⚠️ **No hay persistencia de sesión**, cada expiración requiere login.

---

### 6.4. Escenario: Backend NO protege rutas (no valida token)

**Resultado:**
1. Frontend envía `Authorization: Bearer <token>` (o token inválido/null).
2. Backend NO valida → devuelve datos igual.
3. ⚠️ **Vulnerabilidad de seguridad**: cualquiera puede acceder a datos sin autenticación real.
4. Frontend cree que está autenticado pero no hay protección real.

---

### 6.5. Escenario: Recarga de página (sin `/auth/me`)

**Resultado:**
1. Usuario recarga página.
2. `useAuth` inicia con `user: null`, `accessToken: null`.
3. `isAuthenticated: false`.
4. `ProtectedRoute` redirige a `/login`.
5. ❌ **Usuario debe hacer login nuevamente**, incluso si el refreshToken en cookie sigue válido.

---

### 6.6. Escenario: Logout sin backend

**Resultado:**
1. Usuario hace logout → `authService.logout()` intenta `POST /auth/logout`.
2. Si `VITE_USE_MOCKS=false` y backend no existe:
   - ❌ **404 Not Found** o error de red.
   - Frontend continúa con logout local (`useAuth.tsx:59-63`).
   - ✅ **Funciona parcialmente**: limpia token local, pero backend NO invalida refreshToken.
   - ⚠️ **RefreshToken sigue válido** si no se implementa invalidación en backend.

---

## 7. Riesgos Actuales

### 7.1. Riesgos Críticos

#### ❌ **Login No Funcional Sin Mocks**
- Si `VITE_USE_MOCKS=false` y backend no tiene `/auth/login`, login falla completamente.
- **Impacto:** Usuario no puede acceder a la aplicación.

#### ❌ **Sesión No Persiste al Recargar**
- No hay verificación de sesión al iniciar (`GET /auth/me` no implementado).
- Cada recarga de página requiere login.
- **Impacto:** Mala experiencia de usuario.

#### ❌ **Auto-Refresh No Implementado**
- El interceptor de refresh está comentado.
- Si el `accessToken` expira, usuario es redirigido a login sin intentar renovar.
- **Impacto:** Sesiones cortas, interrupciones frecuentes.

---

### 7.2. Riesgos Moderados

#### ⚠️ **Logout No Invalida RefreshToken**
- Frontend limpia token local, pero si backend no implementa invalidación, el refreshToken sigue válido.
- **Impacto:** Posible re-autenticación no autorizada si alguien roba el refreshToken.

#### ⚠️ **Sin Manejo de Errores Específicos**
- El frontend no diferencia entre "credenciales inválidas" y "servidor caído".
- **Impacto:** Mensajes de error confusos para el usuario.

#### ⚠️ **Token en Variable Global**
- `window.__accessToken` es una solución temporal.
- Riesgo bajo de XSS (solo si hay vulnerabilidades en otras partes).
- **Impacto:** No ideal, pero aceptable si no hay XSS.

---

### 7.3. Riesgos Menores

#### ⚠️ **Sin Timeout de Sesión en Frontend**
- El frontend no expira el token localmente.
- Depende 100% del backend para validar expiración.
- **Impacto:** Menor, pero podría mejorar UX mostrando "sesión expirará pronto".

#### ⚠️ **Sin Logout Automático por Inactividad**
- No hay detección de inactividad.
- **Impacto:** Menor, funcionalidad opcional.

---

## 8. Ajustes Necesarios en Frontend para Integración Real

### 8.1. Implementar Verificación de Sesión al Iniciar

**Archivo:** `src/hooks/useAuth.tsx:35-40`

**Cambio requerido:**
```typescript
useEffect(() => {
  const verifySession = async () => {
    try {
      // Llamar a GET /auth/me
      const response = await api.get<User>('/auth/me')
      setUser(response.data)
      // NO tenemos accessToken aquí, el backend debe devolverlo o validar cookie
      // O alternativamente, llamar a refresh primero
    } catch {
      setIsLoading(false)
    }
  }
  verifySession()
}, [])
```

**Alternativa:** Si backend no tiene `/auth/me`, llamar a `refreshToken()` directamente al iniciar.

---

### 8.2. Activar Auto-Refresh en Interceptor

**Archivo:** `src/shared/httpPrivate.ts:62-78`

**Cambio requerido:**
- Descomentar y completar la lógica de refresh.
- Asegurar que actualiza `window.__accessToken` y el contexto de React.

---

### 8.3. Agregar `withCredentials` en Login

**Archivo:** `src/services/auth.service.ts:31`

**Cambio requerido:**
```typescript
const response = await api.post<AuthResponse>('/auth/login', { email, password }, { withCredentials: true })
```

---

### 8.4. Manejo de Errores Mejorado

**Recomendación:**
- Diferenciar errores de red, autenticación y validación.
- Mostrar mensajes específicos al usuario.

---

## 9. Checklist de Implementación Backend

Para que el frontend funcione correctamente, el backend debe implementar:

- [ ] `POST /auth/login` → Devuelve `{ accessToken, user }` y setea cookie `refreshToken` HttpOnly
- [ ] `POST /auth/refresh` → Valida cookie `refreshToken`, devuelve `{ accessToken }`
- [ ] `POST /auth/logout` → Invalida/elimina cookie `refreshToken`
- [ ] `POST /auth/reset-password` → Envía email de recuperación
- [ ] `GET /auth/me` (recomendado) → Valida token/cookie, devuelve `{ user }`
- [ ] Validar `Authorization: Bearer <token>` en TODAS las rutas protegidas
- [ ] Devolver `401 Unauthorized` si token inválido/expirado
- [ ] Configurar CORS para aceptar `withCredentials: true` y cookies

---

## 10. Resumen Ejecutivo

### Estado Actual
- ✅ Frontend tiene estructura completa de autenticación (hooks, servicios, interceptores).
- ⚠️ Funciona **solo con mocks** (`VITE_USE_MOCKS=true`).
- ❌ **NO funciona sin backend de auth** si `VITE_USE_MOCKS=false`.

### Endpoints Críticos Faltantes
1. `POST /auth/login` → **CRÍTICO** (login no funciona sin esto)
2. `POST /auth/refresh` → **CRÍTICO** (sesiones no persisten)
3. `POST /auth/logout` → **IMPORTANTE** (logout no invalida refreshToken)
4. `GET /auth/me` → **RECOMENDADO** (mejora UX al recargar página)

### Riesgo Principal
**Si se ejecuta el flujo de login/register con backend actual (sin auth):**
- ❌ Login falla con error: `"Login no implementado sin mocks"`
- ❌ Usuario NO puede acceder a ninguna funcionalidad protegida
- ❌ Todas las rutas protegidas redirigen a `/login`
- ✅ Mocks funcionan si `VITE_USE_MOCKS=true`

### Conclusión
El frontend está **preparado arquitectónicamente** para JWT real, pero **depende completamente** de que el backend implemente los endpoints de autenticación. Sin ellos, la aplicación **solo funciona en modo mock**.

---

**Documento generado automáticamente mediante análisis de código fuente.**  
**Última actualización:** 2024

