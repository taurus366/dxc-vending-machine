# Vending Machine

A web-based vending machine simulation.

- **Backend** (`backend/`) - Spring Boot + H2 in-memory database. Exposes a single **read-only** mocked API (`GET /api/products`) that returns the machine's initial product catalog.
- **Frontend** (`frontend/`) - Angular 22 (standalone components, signals). Loads the initial products once from the backend and then owns everything else - product CRUD and the vending flow (insert coins / buy / reset) - purely in its own application state. Nothing is written back to the backend.

## Accepted coin denominations

The machine is EUR-based and accepts **only** these 5 coins:

| Coin | Value  |
|------|--------|
| 10c  | €0.10  |
| 20c  | €0.20  |
| 50c  | €0.50  |
| €1   | €1.00  |
| €2   | €2.00  |

The UI only exposes buttons for these five denominations, so no other value can ever be inserted. `VendingService.insertCoin()` also validates the value against the accepted list as a second line of defense.

Change is calculated with a greedy algorithm over this same coin set (largest denomination first). This EUR subset is a canonical coin system, so the greedy approach always produces an optimal (minimum-coin) result - no separate physical change-coin inventory is modeled.

## Requirements coverage

- **Inventory** - each product slot holds at most 15 units (enforced both when creating and editing a product).
- **Pricing** - each product type has its own price, stored in cents to avoid floating-point rounding issues.
- **Coins & change** - only the 5 denominations above are accepted; change is always returned automatically after a purchase.
- **Products - initial load** - `GET /api/products` (mocked API, backed by an H2 in-memory DB seeded from `backend/src/main/resources/data.sql`).
- **Product CRUD** - Create / Read / Update / Delete happen only in the Angular app state (see the "Manage Products" tab). The backend is never called again after the initial load.
- **Vending operations** - insert coin, buy product (validates stock and balance, decrements stock, returns change), reset (returns any inserted coins without a purchase).
- **Responsive design** - CSS Grid/Flexbox with breakpoints; verified at both desktop (1200px) and mobile (375px) widths.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+ and npm

## Running the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. Verify it with:

```bash
curl http://localhost:8080/api/products
```

An H2 web console is available at `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:vendingdb`, user `sa`, empty password) if you want to inspect the seed data.

## Running the frontend

```bash
cd frontend
npm install
npm start
```

The app starts on **http://localhost:4200** and expects the backend to be running on `http://localhost:8080` (CORS is already configured for `http://localhost:4200` in `backend/.../config/CorsConfig.java`; the API base URL is set in `frontend/src/app/core/api.config.ts`).

> **Note:** in this environment `npm install` alone can fail with an npm/Arborist bug (`Cannot read properties of null (reading 'edgesOut')`) triggered by the peer-dependency graph of the generated dev-tooling (`vitest`/`msw`). If you hit that, run `npm install --legacy-peer-deps` instead - it installs cleanly and does not affect the app's runtime dependencies (only dev/test tooling is affected).

## Building for production

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist/frontend`.

## Project structure

```
backend/
  src/main/java/com/dxc/vending/
    model/Product.java            JPA entity for the seed catalog
    repository/ProductRepository.java
    controller/ProductController.java   GET /api/products (read-only)
    config/CorsConfig.java
  src/main/resources/
    application.properties        H2 datasource config
    data.sql                      Seed products (prices differ, qty <= 15)

frontend/
  src/app/
    models/                       Product & Coin types
    services/
      product.service.ts          Loads initial products; owns product CRUD in state
      vending.service.ts          Coin insertion, buy, reset, change calculation
    components/
      vending-machine/            Customer-facing buying flow
      product-admin/               Product CRUD screen
    app.ts / app.html             Tab shell (Vending Machine / Manage Products)
```

## How it was verified

- `mvn -DskipTests package` - backend compiles and the packaged jar starts and serves `/api/products`.
- `npm run build` - production Angular build succeeds.
- `npx ng test` - unit tests pass.
- Manual + scripted (Playwright) browser testing against the running app: inserting coins and buying returns correct change (e.g. inserting €2.20 for a €1.50 item returns 50c + 20c), buying with insufficient funds shows the exact amount still owed, an out-of-stock product's Buy button is disabled, "Return coins" refunds the full inserted balance, and the "Manage Products" tab correctly adds/edits/deletes products while rejecting a quantity above 15. Both the 1200px desktop layout and a 375px mobile layout were checked visually.

## Design notes / assumptions

- Money is represented in integer cents throughout (both backend and frontend) to avoid floating-point rounding bugs.
- The backend is intentionally read-only (`GET` only) - the task only requires product CRUD in the frontend's application state, so no write endpoints were added.
- New products created in the admin UI get negative local IDs to avoid colliding with IDs coming from the backend.
- Product types are one of `DRINK`, `SNACK`, `OTHER`; type is a free choice per product and prices are independent per product (never shared between types).
