# Contexto Integral de Sorbo Sabores (SPA)

Documento de referencia para comprender el stack tecnológico, arquitectura, dominios y flujos actuales de la aplicación.

## Resumen General

- **Tipo de app:** SPA responsive construida con Vite + React 18 + TypeScript.
- **Objetivo:** Gestionar productos, costos, ventas y (próximamente) gastos para Sorbo Sabores.
- **Estado:** Funciona completamente con mocks, preparada para integrar backend real vía `VITE_USE_MOCKS=false`.

## Stack y Herramientas

- **Build:** Vite 5 con `@vitejs/plugin-react`.
- **Lenguaje:** TypeScript estricto (`tsconfig.json`).
- **UI:** React 18 + Tailwind CSS + Headless UI (modales accesibles).
- **Routing:** React Router DOM 6 (rutas públicas y protegidas).
- **HTTP:** Axios encapsulado (`src/shared/httpPrivate.ts`) con interceptores preparados para refresh token.
- **Charts:** Recharts (gráficos responsivos).
- **Tooling adicional:** PostCSS, Autoprefixer, Dockerfile multi-stage, workflow CI en `.github/workflows/ci-build.yml`.

## Arquitectura de Carpetas

- `src/components/`
  - `dashboard/`: tarjetas, listas y acciones del panel principal.
  - `products/`: filtros, filas, formularios.
  - `sales/`: modal de ventas, tabla responsive.
  - `costs/`: CRUD completo de costos (`CostFormModal`, `CostTableRow`).
  - `ui/`: componentes reutilizables (Button, Modal, Table, Badge, etc.).
- `src/pages/`: vistas (Dashboard, Products, Sales, Costs, Expenses, Auth).
- `src/services/`: capa de datos (`authService`, `productsService`, `salesService`, `costsService`) con fallback a mocks.
- `src/mocks/`: datos, stores mutables y utilidades (`mockStore`, `serverMock`).
- `src/shared/`: tipos, constantes y funciones puras (`calculateProductSalePrice`, `calculateApplicableCosts`, helpers de formato).
- `src/hooks/`: `useAuth`, `useTheme`, `usePagination`.
- `layouts/`: `AuthLayout` y `MainLayout` (navbar + side actions).

## Modelos Principales

```ts
export type ProductType = 'blend' | 'caja' | 'gin'
export const PRODUCT_TYPES: ProductType[] = ['blend', 'caja', 'gin']

export interface CostItem {
  id: string
  nombre: string
  tipo: 'general' | ProductType | 'amortizable'
  valor: number
  descripcion?: string
}

export interface Product {
  id: string
  nombre: string
  tipo: ProductType
  precioCosto: number
  porcentajeGanancia: number
  costos: number
  precioVenta: number
  stock: number
  soldCount: number
}

export interface SaleItem {
  productId: string
  productNombre: string
  cantidad: number
  precioUnitario: number
  snapshot: {
    precioCosto: number
    costos: number
    porcentajeGanancia: number
    precioVenta: number
  }
}

export interface Sale {
  id: string
  fecha: string
  items: SaleItem[]
  total: number
}
```

## Mocks y Almacenamiento Temporal

- `MOCK_PRODUCTS`, `MOCK_SALES`, `MOCK_COSTS`, `MOCK_EXPENSES`.
- `mockStore.ts` provee funciones mutables:
  - `addMockProduct`, `updateMockProduct`, `deleteMockProduct`.
  - `addMockCost`, `updateMockCost`, `deleteMockCost` (recalcula automáticamente `costos` y `precioVenta` de todos los productos).
  - `addMockSale` + `updateProductStock` (descuenta stock y aumenta `soldCount`).
  - `recalculateProductFinancials` centraliza la fórmula de precios con `calculateProductSalePrice`.
- `serverMock.ts` envuelve respuestas con latencia (`mockResponse`) y respeta `import.meta.env.VITE_USE_MOCKS`.

## Cálculo de Precios

1. Se suman todos los costos aplicables (`general`, tipo específico, `amortizable`) mediante `calculateApplicableCosts`.
2. Se calcula el precio final:  
   `precioVenta = (precioCosto + costos) * (1 + porcentajeGanancia / 100)`  
   (se redondea a dos decimales).
3. Cada modificación de costos o porcentajes dispara `recalculateAllProducts` en el mock store.
4. Las ventas guardan un snapshot para auditoría futura.

## Flujos Clave

- **Autenticación:** `useAuth` mantiene `user` y `accessToken` en memoria; interceptores de Axios listos para refresh.
- **Productos:**
  - Tabla responsiva (web) + cards (mobile).
  - Filtros por nombre/tipo, ordenamiento por stock, paginación automática.
  - Modal `ProductFormModal` recalcula el precio en vivo mostrando costos aplicados y precio sugerido.
- **Ventas:**
  - `CreateSaleModal` permite múltiples productos, valida stock sumando todas las líneas.
  - Recalcula precio unitario a partir de los costos vigentes y margen.
  - `SalesTable` muestra detalle con snapshots de costos/margen.
- **Costos:**
  - Página `CostsPage` con tabla, cards mobile, filtrado por tipo y búsqueda.
  - CRUD completo utilizando `costsService`.
  - Métrica de total acumulado visible en tarjetas superiores.
- **Dashboard:**
  - Resumen de stock (`StockSummaryCard`).
  - Top/Least selling con `soldCount`.
  - `PieChartGainsExpenses` contrasta ventas vs gastos mock.
  - `QuickActions` abre modales para nueva venta y alta de producto.

## Responsividad (360px+)

- Vistas y tablas ofrecen versión card en mobile (`md:hidden`) con información clave.
- Modales ocupan `w-full` en pantallas pequeñas y utilizan `max-w` escalables.
- Formularios (Login, Products, Sales, Costs) usan `flex` y `grid` con columnas únicas en móviles.
- Navbar colapsa a menú hamburguesa (`MainLayout`).

## Integración con Backend Real

1. Configurar `.env` con `VITE_USE_MOCKS=false` y `VITE_API_BASE_URL`.
2. Descomentar llamadas Axios en cada servicio (`auth`, `products`, `sales`, `costs`).
3. Revisar `httpPrivate.ts` e inyectar `accessToken` desde `useAuth`.
4. Implementar endpoints documentados en el README (incluyendo `/costs`).

## Próximos Pasos Sugeridos

- Completar módulo de gastos (actualmente placeholder).
- Añadir notificaciones/toasts para feedback de formularios.
- Migrar cálculos de métricas al backend una vez disponible.
- Agregar pruebas unitarias e2e cuando la API esté estable.

---

**Última actualización:** 11 de noviembre de 2025.


