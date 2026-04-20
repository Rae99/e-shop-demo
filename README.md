# E-Shop — Full-Stack MERN E-Commerce Platform

A full-featured e-commerce application built from scratch with the MERN stack (MongoDB, Express, React, Node.js). Covers the complete shopping lifecycle: product browsing, cart management, PayPal checkout, and an admin dashboard for inventory and order management.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Redux Toolkit, RTK Query, React Router v6, React Bootstrap |
| Backend | Node.js, Express.js, Mongoose ODM |
| Database | MongoDB (Atlas or local) |
| Auth | JWT stored in HTTP-only Cookies |
| Payment | PayPal REST SDK (`@paypal/react-paypal-js`) |
| File Upload | Multer (local disk storage) |
| Dev Tooling | Concurrently, Nodemon, dotenv |

## Features

### Storefront
- Product listing with keyword search and server-side pagination
- Product detail page with image, description, and customer reviews
- Review system with duplicate-review prevention and auto-calculated average rating
- Top-rated products carousel on the homepage

### Shopping Cart
- Add / remove items, adjust quantities
- Dynamic price calculation: subtotal, shipping (free above $100), 15% tax, and total
- Cart state persisted to `localStorage` — survives page refreshes and tab closes

### Checkout (4-step flow)
1. **Shipping** — collect address details
2. **Payment Method** — select payment provider (PayPal)
3. **Place Order** — review order summary before confirming
4. **Order & Payment** — PayPal button integration; tracks paid / delivered status

### Admin Dashboard
- **Product management**: CRUD operations, Multer image upload, paginated list
- **Order management**: view all orders, mark orders as delivered
- **User management**: list users, edit roles (promote/demote admin), delete accounts

### Security
- JWT stored in `httpOnly`, `secure`, `sameSite: strict` cookies — inaccessible to JavaScript, preventing XSS token theft
- Composable `protect` + `admin` middleware guards all sensitive routes
- Passwords hashed with bcryptjs (10 salt rounds)
- File uploads restricted to JPEG/PNG by extension and MIME type

## Architecture Overview

```
e-shop/
├── backend/
│   ├── config/          # MongoDB connection (Mongoose)
│   ├── controllers/     # Business logic (users, products, orders)
│   ├── middleware/      # authMiddleware, errorMiddleware, asyncHandler
│   ├── models/          # Mongoose schemas: User, Product, Order
│   ├── routes/          # Express routers: users, products, orders, upload
│   ├── utils/           # generateToken (JWT + cookie)
│   ├── data/            # Seed data for products and users
│   └── server.js        # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI: Header, Footer, Rating, Loader, PrivateRoute, AdminRoute
│       ├── screens/     # Page components (Home, Cart, Checkout, Order, Admin pages)
│       ├── slices/      # Redux slices (auth, cart) + RTK Query API slices
│       ├── utils/       # cartUtils (price calculations)
│       └── store.js     # Redux store configuration
│
└── uploads/             # Multer-managed product images
```

### State Management Strategy

The app separates two concerns deliberately:

| State Type | Tool | Storage | Why |
|---|---|---|---|
| Server data (products, orders) | RTK Query | In-memory cache | Auto-fetch, tag-based invalidation, no boilerplate |
| Cart items | Redux slice | `localStorage` | Persists across refreshes, no backend cost |
| Auth session | Redux slice | `localStorage` | Non-sensitive (JWT lives in httpOnly cookie) |

RTK Query tags (`Product`, `User`, `Order`) trigger automatic cache invalidation after mutations, so the UI always reflects the current backend state without manual refetches.

### Data Models

**User**
```
{ name, email, password (bcrypt), isAdmin, timestamps }
```
Pre-save hook auto-hashes modified passwords. Instance method `matchPassword()` handles login validation.

**Product**
```
{ user, name, image, brand, category, description,
  reviews: [{ user, name, rating, comment }],
  rating (computed), numReviews, price, countInStock, timestamps }
```
`rating` is recalculated and saved whenever a review is added.

**Order**
```
{ user, orderItems: [{ name, qty, image, price, product }],
  shippingAddress, paymentMethod, paymentResult,
  itemsPrice, taxPrice, shippingPrice, totalPrice,
  isPaid, paidAt, isDelivered, deliveredAt, timestamps }
```

### Authentication Flow

```
Client                          Server
  |                               |
  |--- POST /api/users/login ---->|
  |                               | verify credentials
  |                               | jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
  |<-- Set-Cookie: jwt=<token> ---|  httpOnly, secure, sameSite=strict
  |                               |
  |--- GET /api/orders/mine ----->|  (cookie sent automatically)
  |                               | protect middleware: jwt.verify(cookie)
  |                               | attach req.user from DB
  |<-- 200 OK + order data -------|
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- PayPal Developer account for a sandbox Client ID

### Environment Variables

Create `/backend/.env`:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/eshop
JWT_SECRET=your_jwt_secret_here
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAGINATION_LIMIT=8
```

### Installation

```bash
# Install root dependencies (concurrently, etc.)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running the Application

```bash
# From the project root — runs both servers concurrently
npm run dev

# Backend only (port 5001)
npm run server

# Frontend only (port 3000, with proxy to 5001)
npm run client
```

### Seeding the Database

```bash
# Import sample products and users (admin: admin@email.com / 123456)
cd backend && npm run seed:import

# Clear all data
cd backend && npm run seed:destroy
```

## API Reference

### Auth & Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/users/login` | Public | Authenticate, set JWT cookie |
| POST | `/api/users/register` | Public | Create account |
| POST | `/api/users/logout` | Public | Clear JWT cookie |
| GET | `/api/users/profile` | Private | Get own profile |
| PUT | `/api/users/profile` | Private | Update own profile |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List products (`?keyword=&pageNumber=`) |
| GET | `/api/products/top` | Public | Top 3 by rating |
| GET | `/api/products/:id` | Public | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/reviews` | Private | Add review |

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Private | Create order |
| GET | `/api/orders/mine` | Private | Get my orders |
| GET | `/api/orders/:id` | Private | Get order by ID |
| PUT | `/api/orders/:id/pay` | Private | Mark as paid (store PayPal result) |
| PUT | `/api/orders/:id/deliver` | Admin | Mark as delivered |
| GET | `/api/orders` | Admin | List all orders |

### Upload

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload product image (multipart/form-data) |

## Key Implementation Details

### Composable Auth Middleware

Rather than repeating auth logic per route, two chainable middleware functions handle all cases:

```javascript
// protect: verifies JWT from cookie, attaches req.user
// admin:   checks req.user.isAdmin flag

router.get('/admin-only', protect, admin, controller);
router.get('/user-only', protect, controller);
```

### RTK Query Tag-Based Invalidation

Mutations declare which tags they invalidate; queries declare which tags they provide. RTK Query handles refetching automatically:

```javascript
// After creating a product, all product list queries refetch
createProduct: builder.mutation({
  invalidatesTags: ['Product'],
}),
getProducts: builder.query({
  providesTags: ['Product'],
}),
```

### Cart Price Calculation

All pricing logic is centralized in `cartUtils.js` and called by the cart Redux slice on every mutation:

```javascript
shippingPrice = itemsPrice > 100 ? 0 : 10   // Free shipping over $100
taxPrice      = 0.15 * itemsPrice             // 15% tax
totalPrice    = itemsPrice + shippingPrice + taxPrice
```

State is written to `localStorage` after each update, so the cart survives refresh.

### Multer File Upload

Uploaded images are stored on disk with a timestamp suffix to prevent collisions. Both file extension and MIME type are validated to reject non-image uploads:

```javascript
filename: (req, file, cb) =>
  cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
```

## License

MIT
