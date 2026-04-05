# uploadRoutes.js — Walkthrough

## 1. `cb` — what is it?

`cb` (callback) is a function that **Multer creates and passes to you**. You don't define it — you call it to hand the result back to Multer.

```js
// Multer internally does something like:
const cb = (err, result) => {
    if (err) throw err;
    // use result (the folder path or filename)
};
destination(req, file, cb); // Multer calls your function, giving you cb
```

You call `cb(null, 'uploads/')` → telling Multer: "no error, use this folder."

**Convention:**
```js
cb(null, 'uploads/')   // success: null error, then the value
cb('Images only!')     // error: just one argument, no value needed
```

---

## 2. Is callback asynchronous?

Callback itself is not async — it's a **pattern for handling async work**.

Multer uses `cb` because `destination` might need to be truly async (e.g. querying a DB to decide which folder to use):

```js
destination(req, file, cb) {
    db.getUser(req.userId, (err, user) => {
        cb(null, `uploads/${user.name}/`); // decided after DB responds
    });
}
```

Multer says "call `cb` whenever you're ready" instead of expecting a return value. Your code is synchronous here (you know the answer immediately), but the pattern supports both.

---

## 3. `checkFileType` — not wired in

You defined it but never passed it to Multer. To actually use it:

```js
const upload = multer({ storage, fileFilter: checkFileType }); // missing fileFilter
```

Right now any file type can be uploaded.

---

## 4. `multer({ storage })` — how does Multer read the object?

By **property name, not order**. `{ storage }` is ES6 shorthand for `{ storage: storage }`.

Multer internally looks for specific known keys:

```js
function multer(options) {
    if (options.storage)    { /* use this storage engine */ }
    if (options.fileFilter) { /* use this validator */ }
    if (options.limits)     { /* apply size limits */ }
}
```

You can pass the keys in any order.

---

## 5. Inline handler vs controller — same thing

```js
// Other route files — handler imported from controller
router.post('/', protect, createProduct);

// This file — handler written inline
router.post('/', upload.single('image'), (req, res) => { res.send(...) });
```

Both are middleware functions with signature `(req, res, next)`. The inline arrow function is effectively a controller — just written directly in the route file. Since this handler is one line, there was no need to split it out.

---

## 6. Why do DB calls need `async` but this handler doesn't?

Because `req.file` is already populated by the time your handler runs.

Express runs middleware in a chain. `upload.single('image')` processes the upload completely — saves to disk, populates `req.file` — then calls `next()`. By the time your handler runs, everything is done:

```js
router.post('/', upload.single('image'), (req, res) => {
    // req.file is already here — nothing to wait for
    res.send({ file: `/${req.file.path}` });
});
```

DB calls need `async` because you're starting an operation that hasn't finished yet:

```js
const product = await Product.findById(id); // you wait HERE for the DB
```

Nothing pre-populated `product` for you — you have to go fetch it.

---

## 7. `upload.single('image')` — why does it look like that?

`upload` is an object returned by `multer({ storage })`. It has multiple methods for different upload scenarios:

```js
upload.single('image')     // one file, from field named 'image'
upload.array('images', 5)  // up to 5 files from field named 'images'
upload.fields([...])       // multiple fields with different names
```

Calling `upload.single('image')` **returns a middleware function** — that's what sits in the route chain. It's a factory pattern:

```
multer({ storage })      → returns the upload object
upload.single('image')   → returns the actual middleware function
```

No `async` needed because Multer uses streams internally (file piped to disk). It handles all async logic itself and calls `next()` when the file is fully saved.
