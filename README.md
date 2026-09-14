# Threadly Market

A full-stack clothing e-commerce marketplace with real customer, seller, and admin roles, built on React, TypeScript, and Supabase (PostgreSQL). Threadly Market supports the complete lifecycle of a multi-vendor storefront: browsing and purchasing, seller onboarding and product moderation, size-specific inventory tracking, and verified customer reviews.

> This is a demo/student marketplace project. Payments are simulated — no real transactions occur.

## Features

### Customer
- Account creation and login (email/password, via Supabase Auth)
- Product browsing with category, gender, brand, price, size, and color filters, plus search
- Product detail pages with size selection and live, size-specific stock visibility
- Cart and wishlist that persist across sessions and devices once logged in (guests can still use both locally before signing in)
- "Add to Cart" and "Buy Now" checkout paths
- Checkout with address entry and a choice of simulated payment methods (card, UPI, or cash on delivery)
- Order history showing every past order, most recent first
- Ratings and written reviews on products the customer has actually purchased

### Seller
- Seller application form (business details submitted for admin review)
- Seller dashboard (once approved): overview, sales and earnings, customers, and store profile
- Add and edit product listings, including per-size stock levels
- New listings enter a pending state until approved by an admin
- Order view scoped to orders containing that seller's own products only
- Store can be suspended or reactivated by an admin

### Admin
- Review and approve/reject seller applications
- Review and approve/reject newly submitted products before they go live
- Suspend or reactivate seller accounts
- Platform-wide view of all orders, sellers, and customers

## Roles

Every account has exactly one role at a time — `customer`, `seller`, or `admin` — stored in the database and enforced by database-level security rules (not just the app's UI). A customer's role is promoted to `seller` automatically when an admin approves their seller application.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Hand-written CSS (no UI framework)
- **Backend:** Supabase (PostgreSQL, Auth, Row-Level Security, database functions/triggers)
- **Icons:** lucide-react

## Authentication

Handled by Supabase Auth (email/password). On sign-up, a matching profile and a default `customer` role are created. Sessions persist across page reloads and are used throughout the app to gate access to cart/wishlist persistence, checkout, and role-specific dashboards.

## Database & Security (Supabase / PostgreSQL / RLS)

All data — products, orders, cart and wishlist items, reviews, seller applications, and inventory — lives in PostgreSQL and is protected by Row-Level Security policies, so access control is enforced at the database layer, not just in the frontend. Key design points:

- Customers can only ever see and modify their own cart, wishlist, and orders.
- Sellers can only manage their own products and only see orders that contain their own items.
- Admin-only actions (approving sellers/products, suspending stores) are enforced by database policies, independent of any client-side role flag.
- Checkout is atomic: placing an order, decrementing size-specific stock, and recording order line items all happen inside a single database transaction. If stock is insufficient for any item, the entire order is rolled back — no partial orders, no overselling.

Database migrations live in `supabase/migrations/`.

## Cart & Wishlist

Both work immediately for guests (stored in browser memory) and automatically sync to the database once a customer logs in, restoring across devices and sessions.

## Checkout

A three-step flow (address, delivery, payment) supporting simulated card, UPI, and cash-on-delivery payment methods. Quantity selection respects the actual stock available for the selected size.

## Size-Specific Inventory

Stock is tracked per product *and* per size (not just one total number per product), so a product can be sold out in one size while still available in others. Checkout enforces this in real time and prevents stock from ever going negative.

## Orders

Customers see their own full order history. Sellers see only the orders (and only the line items) containing their own products. Admins see every order on the platform. Order status, payment method, and delivery address are recorded per order.

## Reviews

Customers can rate and review a product only after actually purchasing it, and only once per purchase. Product ratings shown across the site are calculated from real submitted reviews.

## Local Development

```bash
npm install
npm run dev
```

You'll need a Supabase project with the migrations in `supabase/migrations/` applied, and a `.env` file with your project credentials:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Other scripts

```bash
npm run build       # production build
npm run typecheck   # TypeScript type checking
npm run lint         # ESLint
```
