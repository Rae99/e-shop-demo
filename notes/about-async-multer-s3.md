# Async, Callbacks, Multer, and S3

## JavaScript is single-threaded

It can only do one thing at a time. When it hits a slow operation (disk read, network, DB query), it needs a way to handle it without freezing everything else.

---

## The problem with synchronous code

```js
const user = db.getUser(123); // blocks here for 200ms
console.log(user);
console.log('other stuff');
```

If this were synchronous, the program would be completely frozen for 200ms on line 1. With 1000 concurrent requests each waiting 200ms — the server grinds to a halt.

---

## Solution: Callbacks

```js
db.getUser(123, (err, user) => {
    // runs when DB responds
    console.log(user);
});
console.log('other stuff'); // runs immediately, doesn't wait
```

Execution order:
```
1. Tell the DB "find user 123, call this function when done"
2. Immediately run console.log('other stuff')
3. ... 200ms later ...
4. DB responds, callback fires, user is printed
```

`other stuff` prints first. The program never blocked.

---

## async/await — same thing, cleaner syntax

Callbacks get messy when nested. `async/await` is the modern way to write the same logic:

```js
const user = await db.getUser(123); // looks synchronous, but doesn't block
console.log(user);
```

`await` means: "pause this function and wait for the result, but don't block the rest of the program."

Comparison:
```js
// Callback style — result is "inside"
db.getUser(id, (err, user) => {
    // user is here
});

// async/await style — result assigned directly
const user = await db.getUser(id);
// user is here
```

Same logic, async/await is just more readable.

---

## Back to Multer — why cb?

```js
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
});
```

Multer uses `cb` because `destination` might need to be async. For example, querying the DB to decide which folder to use:

```js
// Callback style
destination(req, file, cb) {
    User.findById(req.user._id, (err, user) => {
        if (err) return cb(err);
        cb(null, `uploads/${user.username}/`);
    });
}

// async/await style
async destination(req, file, cb) {
    try {
        const user = await User.findById(req.user._id);
        cb(null, `uploads/${user.username}/`);
    } catch (err) {
        cb(err);
    }
}
```

Execution flow:
```
1. File upload comes in
2. Multer calls your destination()
3. You fire a DB request and "suspend"
4. ... waiting ...
5. DB returns user
6. You call cb(null, 'uploads/john/')
7. Multer now knows where to save the file
```

In your actual code, `destination` is synchronous — you already know the answer (`'uploads/'`) so you call `cb` immediately. But the interface uses `cb` to support both cases.

---

## cb convention

```js
cb(null, 'uploads/')   // success: null for error, then the value
cb('Images only!')     // error: just one argument, no value
```

---

## Local disk vs S3

In this project, images are saved to the **local `uploads/` folder** on the server. User data is in **MongoDB**. Completely separate.

**Problems with local disk in production:**
- Server restarts or redeploys can wipe the `uploads/` folder
- If you scale to multiple servers, each has its own `uploads/` — inconsistent
- Server disk space is limited

**Why S3 (or similar) is used in production:**
- Files live independently of the server
- Unlimited storage
- CDN support — images load faster globally

**Switching to S3 would only change the storage engine:**

```js
// Current — local disk
const storage = multer.diskStorage({ ... });

// S3
import multerS3 from 'multer-s3';
const storage = multerS3({
    s3: s3Client,
    bucket: 'your-bucket-name',
    key: (req, file, cb) => {
        cb(null, `products/${Date.now()}-${file.originalname}`);
    },
});
```

The rest of the code (the route, the frontend) stays exactly the same. The structure you learned here carries over.
