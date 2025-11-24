# 📊 Cálculo de Métricas — Sorbo Sabores

Este documento describe cómo se generan las métricas principales del dashboard y cómo se calculan los precios de venta a partir de los costos operativos.

## 1. Productos más y menos vendidos

- **Fuente de datos:** `MOCK_PRODUCTS` (`src/mocks/products.ts`) y `soldCount` actualizado en tiempo real por `updateProductStock` (`src/mocks/mockStore.ts`).
- Se ordenan los productos por `soldCount`:
  - **Top Selling:** orden descendente, se listan los 5 primeros (`TopSellingList`).
  - **Least Selling:** orden ascendente, se listan los 5 primeros (`LeastSellingList`).
- Las listas muestran nombre, tipo (`blend`, `caja`, `gin`) y unidades vendidas.

## 2. Resumen de stock

- **Fuente:** listado completo de productos.
- Función `computeStockSummary` (`src/shared/functions.tsx`) clasifica cada producto con `computeStockStatus` usando `STOCK_THRESHOLDS`.
- Devuelve totales y porcentajes para los estados **Bien**, **Quedan pocos**, **Sin stock**, que se renderizan en `StockSummaryCard`.

## 3. Ganancias vs Gastos (Pie chart)

- **Ganancias:** suma de `sale.total` (venta ya calculada con precios dinámicos).
- **Gastos:** suma de `expense.amount` (`MOCK_EXPENSES`).
- **Ganancia neta:** `ganancias - gastos`.
- Implementación en `PieChartGainsExpenses`, utilizando Recharts para renderizar el gráfico.

## 4. Fórmula de precio de venta de productos

Los productos no almacenan un precio manual; se calcula cada vez que cambian los costos o el margen.

```ts
const base = precioCosto + costos
const precioVenta = base + base * (porcentajeGanancia / 100)
```

- `costos`: suma de `CostItem.valor` para los costos cuyo `tipo` sea `general`, coincida con el tipo del producto (`blend`, `caja`, `gin`) o sea `amortizable`.
- Funciones clave:
  - `calculateApplicableCosts(costs, tipoProducto)` → suma los costos aplicables.
  - `calculateProductSalePrice(precioCosto, costos, porcentajeGanancia)` → devuelve el precio final redondeado a dos decimales.
  - `recalculateProductFinancials(producto, costosDisponibles)` → recalcula `costos` y `precioVenta` de un producto.
- Al crear/editar productos o costos, `mockStore` invoca `recalculateProductFinancials` para mantener los valores en sincronía.

## 5. Gestión de costos operativos

- Entidad `CostItem` (`src/shared/types.ts`):
  ```ts
  interface CostItem {
    id: string
    nombre: string
    tipo: 'general' | 'blend' | 'caja' | 'gin' | 'amortizable'
    valor: number
    descripcion?: string
  }
  ```
- CRUD mockeado en `src/services/costs.service.ts` consumiendo helpers de `mockStore`.
- Página `CostsPage` permite filtrar por tipo, buscar por nombre y ver el impacto acumulado.

## 6. Ventas y snapshot de costos

- `CreateSaleModal` recalcula el precio unitario de cada producto usando la misma fórmula antes de confirmar la venta.
- Se valida que la suma de cantidades por producto no exceda el stock disponible.
- Cada `SaleItem` guarda un `snapshot` con:
  - `precioCosto`
  - `costos`
  - `porcentajeGanancia`
  - `precioVenta`
- Esto permite auditar ventas históricas incluso si los costos cambian a futuro.

## 7. Actualización en tiempo real con mocks

- Al registrar una venta (`salesService.create`):
  1. Se añade la venta a `MOCK_SALES`.
  2. Se actualiza el stock (`updateProductStock`) y `soldCount`.
  3. El dashboard refresca métricas al recargar los datos (`loadData`).
- Al modificar costos (`addMockCost`, `updateMockCost`, `deleteMockCost`):
  - Se ejecuta `recalculateAllProducts` que vuelve a calcular `costos` y `precioVenta` para todos los productos antes de servirlos otra vez.

---

**Última actualización:** 11 de noviembre de 2025.


