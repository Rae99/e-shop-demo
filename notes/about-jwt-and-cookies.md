# JWT + Cookie Auth Flow

## The Big Picture

JWT is the **format** of the token. Cookie is **where it lives**.
This project puts the JWT inside an httpOnly cookie — safer than localStorage.

---

## Step 1 — Login: generating and storing the token

`POST /api/users/login` → `authUser` in `userController.js`

```js
// userController.js
if (user && (await user.matchPassword(password))) {
  generateToken(res, user._id);   // ← creates JWT, sets cookie on response
  res.status(200).json({ _id, name, email, isAdmin });
}
```

`generateToken.js` does two things:

```js
// 1. Create the JWT — sign userId into it, expires in 30 days
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// 2. Attach it to the response as a cookie
res.cookie('jwt', token, {
  httpOnly: true,   // JS in the browser CANNOT read this cookie (XSS protection)
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'strict',  // only sent to same origin (CSRF protection)
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days in milliseconds
});
```

The browser receives the `Set-Cookie` header and stores the cookie automatically.
No frontend code needed — the browser handles it.

---

## Step 2 — Subsequent requests: reading the token

Browser automatically attaches the cookie to every request to the same origin.

`protect` middleware in `authMiddleware.js` intercepts protected routes:

```js
// Read cookie
token = req.cookies.jwt;

// Verify and decode it
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { userId: '64a3f...', iat: ..., exp: ... }

// Fetch the actual user from DB (minus password)
req.user = await User.findById(decoded.userId).select('-password');

next(); // pass control to the actual route handler
```

After `protect` runs, any route handler can access `req.user` directly.

---

## Step 3 — Admin check

`admin` middleware runs **after** `protect` (so `req.user` already exists):

```js
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};
```

Used in routes like: `router.get('/', protect, admin, getUsers)`
Both middlewares must pass before the handler runs.

---

## Step 4 — Logout: clearing the cookie

```js
res.cookie('jwt', '', {
  httpOnly: true,
  expires: new Date(0),  // set expiry to epoch = immediately expired
});
```

Overwrites the cookie with an empty value that expires instantly.
Browser discards it — token is gone.

---

## Why not localStorage?

| | httpOnly Cookie | localStorage |
|---|---|---|
| JS can read it | No | Yes |
| XSS attack can steal it | No | Yes |
| Sent automatically | Yes | No (manual) |
| CSRF risk | Yes (mitigated by sameSite) | No |

httpOnly cookie = JS blind to it → even if attacker injects JS, can't steal the token.

---

## Data flow summary

```
Login
  → backend signs JWT with JWT_SECRET
  → stores in httpOnly cookie on response
  → browser saves cookie automatically

Protected request
  → browser sends cookie automatically
  → protect middleware reads req.cookies.jwt
  → verifies JWT with JWT_SECRET
  → attaches user to req.user
  → route handler runs

Logout
  → backend overwrites cookie with expired empty value
  → browser discards it
```
