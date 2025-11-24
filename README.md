# Web Sorbo Sabores

SPA (Single Page Application) 100% responsive desarrollada con Vite + TypeScript para la gestión de productos, ventas y gastos de Sorbo Sabores.

## 🚀 Características

- ✅ 100% Responsive (mobile-first design)
- ✅ TypeScript estricto
- ✅ Patrón escalable: feature folders + shared + hooks + services
- ✅ Sistema de autenticación seguro (tokens en memoria)
- ✅ Dark/Light theme con persistencia
- ✅ Mocks integrados para desarrollo (productos, ventas, costos, gastos)
- ✅ Paginación automática
- ✅ Validaciones robustas
- ✅ Accesibilidad básica (ARIA, keyboard navigation)

## 📁 Estructura del Proyecto

```
web-sorbos/
├── src/
│   ├── components/      # Componentes reutilizables y por feature
│   ├── hooks/           # Custom hooks (useAuth, useTheme, usePagination)
│   ├── layouts/         # Layouts (AuthLayout, MainLayout)
│   ├── mocks/           # Datos mockeados y utilidades
│   ├── pages/           # Páginas de la aplicación (Dashboard, Products, Sales, Costs, Expenses)
│   ├── services/        # Servicios API (auth, products, sales, costs)
│   └── shared/          # Utilidades compartidas, tipos, constantes
├── .github/workflows/   # GitHub Actions para CI/CD
├── Dockerfile           # Imagen Docker multi-stage
└── docker-compose.yml   # Docker Compose (opcional)
```

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd web-sorbos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:4001
   VITE_USE_MOCKS=true
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build de producción
- `npm run typecheck` - Verifica tipos TypeScript

## 🌐 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base del backend API | `http://localhost:4001` |
| `VITE_USE_MOCKS` | Activar/desactivar mocks | `true` |

## 🔐 Autenticación y Seguridad

### Almacenamiento de Tokens

- **Access Token**: Almacenado en memoria (React Context) - **NO en localStorage**
- **Refresh Token**: En cookie HttpOnly (manejado por backend)
- **Tema/UI preferences**: En localStorage (OK para esto)

### Flujo de Autenticación

1. Usuario hace login → Backend emite:
   - `accessToken` en body response
   - `refreshToken` en cookie HttpOnly
2. Cliente guarda `accessToken` en memoria
3. Requests autenticados incluyen: `Authorization: Bearer ${accessToken}`
4. Si recibe 401 → Interceptor llama `/auth/refresh` → Actualiza token en memoria
5. Logout → Llama `/auth/logout` → Limpia cookies y memoria

### Integración con Backend Real

Para cambiar de mocks a API real:

1. **Configurar variable de entorno:**
   ```env
   VITE_USE_MOCKS=false
   VITE_API_BASE_URL=https://tu-backend.com
   ```

2. **Descomentar llamadas axios en servicios:**
   - `src/services/auth.service.ts`
   - `src/services/products.service.ts`
   - `src/services/sales.service.ts`
   - `src/services/costs.service.ts`

3. **Ejemplo en auth.service.ts:**
   ```typescript
   // Descomentar:
   const response = await api.post<AuthResponse>('/auth/login', { email, password })
   return response.data
   
   // Comentar/eliminar:
   // return mockResponse<AuthResponse>({...}, 800)
   ```

4. **Actualizar httpPrivate.ts:**
   - Descomentar lógica de refresh token en interceptor
   - Asegurar que `useAuth` provea token a httpPrivate

## 📡 Endpoints Esperados del Backend

### Autenticación
- `POST /auth/login` - Login (body: `{email, password}`) → `{accessToken, user}`
- `POST /auth/logout` - Logout (con cookies)
- `POST /auth/refresh` - Refresh token (con cookies) → `{accessToken}`
- `POST /auth/reset-password` - Reset password (body: `{email}`)

### Productos
- `GET /products` - Lista de productos
- `GET /products/:id` - Detalle de producto
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

### Ventas
- `GET /sales` - Lista de ventas
- `GET /sales/:id` - Detalle de venta
- `POST /sales` - Crear venta

### Costos
- `GET /costs` - Lista de costos operativos
- `GET /costs/:id` - Detalle de costo
- `POST /costs` - Crear costo
- `PUT /costs/:id` - Actualizar costo
- `DELETE /costs/:id` - Eliminar costo

## 🎨 Temas (Dark/Light)

- Detecta preferencia del sistema al iniciar
- Permite toggle manual
- Persiste preferencia en localStorage
- Implementado en `src/hooks/useTheme.ts`

## 📄 Paginación

- Por defecto: 20 items por página
- Si total <= 20, el paginador se oculta automáticamente
- Configurable en `src/shared/constants.ts` (`ITEMS_PER_PAGE`)

## 💰 Gestión de Costos y Precios

- Los costos operativos se gestionan desde la página `Costos` (`/costs`) con un CRUD completo sobre la entidad `CostItem`.
- Cada producto define:
  - `precioCosto` (costo base),
  - `costos` calculados automáticamente según su tipo (`general`, `blend`, `caja`, `gin`, `amortizable`),
  - `porcentajeGanancia`,
  - `precioVenta` calculado con la fórmula centralizada en `calculateProductSalePrice`.
- Al actualizar costos o porcentajes de ganancia, los precios de todos los productos se recalculan automáticamente mediante utilidades en `src/shared/functions.tsx`.
- Las ventas guardan un *snapshot* de los valores aplicados (costo base, costos agregados, margen y precio de venta) para auditar cambios históricos.

## 🧪 Testing

Para activar mocks durante desarrollo:
```env
VITE_USE_MOCKS=true
```

Los servicios detectan esta variable y usan datos mockeados automáticamente.

## 🐳 Docker

### Build
```bash
docker build -t web-sorbos .
```

### Run
```bash
docker run -p 8080:80 web-sorbos
```

### Docker Compose
```bash
docker-compose up
```

La aplicación estará disponible en `http://localhost:8080`

## 📦 Build y Despliegue

### GitHub Actions
El workflow `.github/workflows/ci-build.yml`:
- Instala dependencias
- Ejecuta type check
- Hace build
- Sube artifacts

### Build Manual
```bash
npm run build
```

Los archivos se generan en `dist/`

## 🔒 Checklist de Seguridad

- ✅ No tokens en localStorage (excepto preferencias UI)
- ✅ HTTPS en producción (configurar en servidor)
- ✅ Axios con `withCredentials: true` para cookies
- ✅ Validación de inputs (client-side)
- ✅ Sanitización de datos (backend requerido)
- ✅ CSRF protection (backend debe implementar)
- ⚠️ Rate limiting (documentado, requiere backend)

## 📝 Notas de Desarrollo

### Thresholds de Stock
Configurables en `src/shared/constants.ts`:
- `GOOD`: >= 10 unidades
- `LOW`: 1-9 unidades
- `OUT`: 0 unidades

### Funciones Reutilizables
Todas documentadas con JSDoc en `src/shared/functions.tsx`:
- `formatCurrency`, `formatDate`
- `computeStockStatus`, `computeStockSummary`
- `paginate`, `debounce`, `clamp`
- etc.

### Commits Sugeridos

```bash
git add .
git commit -m "feat: initial project setup with Vite + TypeScript + Tailwind"

git commit -m "feat: auth system with secure token storage"

git commit -m "feat: dashboard with widgets and charts"

git commit -m "feat: products page with filters and CRUD"

git commit -m "feat: sales page with date filters"

git commit -m "feat: add mocks and mock server utilities"

git commit -m "ci: add GitHub Actions workflow"

git commit -m "feat: add Dockerfile and docker-compose"
```

## 🐛 Troubleshooting

### Problemas de CORS
Si el backend rechaza requests:
- Verificar que backend acepte origen del frontend
- Verificar configuración de cookies (SameSite, Secure)

### Tokens no se refrescan
- Verificar que backend emita refresh token en cookie HttpOnly
- Verificar que interceptor en `httpPrivate.ts` esté activo
- Verificar logs del navegador

### Mocks no funcionan
- Verificar `VITE_USE_MOCKS=true` en `.env`
- Verificar que servicios importen `shouldUseMocks` correctamente

## 📚 Tecnologías

- **Vite** - Build tool
- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Charts
- **Headless UI** - Accessible components

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'feat: agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Sorbo Sabores.

---

Desarrollado con ❤️ para Sorbo Sabores

