# Module Loading vs Request Handling

## The two phases

### Phase 1: Server startup (runs once)

When Node.js loads a module, it runs all top-level code from top to bottom immediately.

In `uploadRoutes.js`:

```js
const storage = multer.diskStorage({ ... }); // runs immediately — storage created
const upload = multer({ storage });           // runs immediately — upload created
router.post('/', upload.single('image'), ...) // runs immediately — route registered
```

No requests have arrived yet. This is just "assembly" — everything gets built and held in memory, ready to be used.

### Phase 2: Request comes in (runs every request)

```
POST /api/upload arrives
  → Express matches /api/upload
  → enters uploadRoutes, matches router.post('/')
  → runs upload.single('image')  ← storage is already inside this
  → runs your handler, sends response
```

`storage` was created long before this. The request just *uses* what's already there.

---

## How server.js and uploadRoutes.js connect

```js
// server.js
import uploadRoutes from './routes/uploadRoutes.js'; // triggers Phase 1
app.use('/api/upload', uploadRoutes);                // mounts the router
```

When `server.js` imports `uploadRoutes`, Node loads the file and runs all its top-level code right then. By the time `app.use(...)` runs, the router is already fully built.

Full startup sequence:

```
Node loads server.js
  → hits import uploadRoutes
  → loads uploadRoutes.js top to bottom
      → const storage = ...   ✅
      → const upload = ...    ✅
      → router.post(...)      ✅
  → app.use('/api/upload', uploadRoutes) ✅
  → server starts listening
```

---

## Key idea

**Definition and execution are separate.**

`const storage = multer.diskStorage(...)` doesn't mean "run this when a file is uploaded." It means "create this object now, at startup, so it's ready when a request eventually comes in."

The route handler is the only thing that runs per-request. Everything outside it runs once.
