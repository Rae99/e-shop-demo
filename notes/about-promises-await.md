# Promises & Await

## 原版对话

**Q: 这时候 storage 早就存在了，upload 也早就创建好了。可是 storage 要能存在，得是 synchronous 的对吗？我们这个例子直接路径写死不需要 call db。**

对，你的直觉是对的。因为 `storage` 在模块加载时同步创建完毕，所以后来的请求可以直接用它。

如果 `storage` 的创建需要异步（比如要先查数据库才能初始化），那就麻烦了：

```js
// 假设这是异步的（实际不是）
const storage = await db.getStorageConfig(); // 模块顶层不能用 await
```

模块顶层不支持 `await`，所以如果初始化是异步的，你得用其他方式处理。

Multer 的 `diskStorage` 是纯粹的同步操作 — 只是在内存里创建一个配置对象，没有任何 I/O，所以直接 `const storage = ...` 没有任何问题。

---

**Q: 我的问题是，如果真的每个用户存在不同的文件夹，你又说顶层不支持 await，怎么办？**

这就是为什么 `destination` 设计成接受 `cb` 的原因。异步的部分不在顶层，在 `destination` 函数里：

```js
// 顶层 — 同步，只是创建配置对象
const storage = multer.diskStorage({

    // 这个函数在请求时才执行，所以可以异步
    destination(req, file, cb) {
        User.findById(req.user._id, (err, user) => {
            cb(null, `uploads/${user.username}/`);
        });
    },
});
```

`const storage = multer.diskStorage({...})` 顶层是同步的 — 它只是把 `destination` 这个函数存起来，并不执行它。真正执行 `destination` 是在请求来的时候。

```
顶层：存函数的引用   ← 同步，没问题
请求时：执行函数     ← 异步，随便用 cb 或 await
```

---

**Q: 可是你这么写，看不出来 destination 是异步。**

对，看不出来。因为 `destination` 本身的定义是同步的 — 它只是一个普通函数。异步发生在函数体里面：

```js
destination(req, file, cb) {
    User.findById(...)  // ← 这行是异步的
}
```

`destination` 不需要标 `async`，因为它不 `return` 任何东西，也不需要 `await`。它只是发出一个异步操作，然后在 callback 里调 `cb`。

对比一下：

```js
// 需要 async — 因为要 await 返回值
async function getUser() {
    const user = await User.findById(id);
    return user;
}

// 不需要 async — 不 return，结果通过 cb 传出去
destination(req, file, cb) {
    User.findById(id, (err, user) => {
        cb(null, `uploads/${user.username}/`);
    });
}
```

`cb` 的存在就是为了替代 `return` — 你不用 return，所以不需要 `async`。

---

**Q: `findById(id)` 和 `findById(id, (err, user) => {` — findById 参数到底是什么？**

`findById` 是 Mongoose 的方法，它支持两种调用方式：

```js
// 方式一：只传 id — 返回 Promise，配合 await 用
const user = await User.findById(id);

// 方式二：传 id + callback — 不返回 Promise，结果通过 callback 给你
User.findById(id, (err, user) => {
    // user 在这里
});
```

参数定义大概是：
```js
findById(id, callback?)  // callback 是可选的
```

- 传了 callback → 用 callback 风格
- 没传 callback → 返回 Promise，用 await

同一个函数，两种用法。现在一般都用 `await`，callback 风格是老写法。

---

**Q: 返回 Promise，我们可以接住吗？显性地给我看看这个 Promise？**

```js
// await 帮你"拆开" Promise，你看不到 Promise 本身
const user = await User.findById(id);

// 不用 await，你就能看到 Promise
const promise = User.findById(id);
console.log(promise); // Promise { <pending> }

// 手动处理
User.findById(id)
    .then((user) => {
        console.log(user); // 成功
    })
    .catch((err) => {
        console.log(err);  // 失败
    });
```

Promise 有三个状态：
```
pending   → 还在等（DB 还没回来）
fulfilled → 成功了，有值
rejected  → 失败了，有错误
```

`await` 其实就是 `.then()` 的语法糖：等 Promise 从 `pending` 变成 `fulfilled`，然后把值取出来给你。

---

**Q: 所以 Promise 是同步立马就返回的？但是值一直在更新？以什么频率在更新？**

Promise 不是"值在更新"，更准确的说法是：**Promise 是一个容器，状态只变一次，不会反复更新。**

```
pending → fulfilled  （成功，永远停在这）
pending → rejected   （失败，永远停在这）
```

执行顺序：

```js
const promise = User.findById(id); // 1. 立刻返回一个 pending 的 Promise
                                   // 2. 同时，DB 查询在后台开始了
// ... 其他代码继续跑 ...
// ... DB 响应了 ...
// 3. Promise 状态变成 fulfilled，值被放进去
// 4. .then() 或 await 拿到值
```

不是"以某个频率更新"，而是：DB 好了就变，只变这一次。等待期间不轮询 — JS 的事件循环在 DB 响应时收到通知，然后触发继续执行。完全是事件驱动，不是轮询。

---

**Q: 就是告诉 JS："等这个 Promise 从 pending 变成 fulfilled，把值给我，然后继续往下跑。" 啊 — 不是说等待的同时下面已经开始跑了吗？**

要区分两种"下面"。

`await` 会暂停**当前这个 async 函数**，但不阻塞**整个程序**。

```js
async function handleRequest(req, res) {
    const user = await User.findById(id); // 这个函数在这里暂停
    console.log(user);                    // 等 user 回来才跑
}

// 与此同时，其他请求进来了
// Express 可以去处理别的请求，不受影响
```

具体来说：

```
请求 A 进来 → handleRequest 开始
  → await User.findById()  ← 函数 A 暂停在这

请求 B 进来 → handleRequest 开始（A 还在等）
  → 请求 B 正常处理

DB 返回了 → 函数 A 从暂停处继续
  → console.log(user)
```

- **函数内部** — `await` 下面的代码等 Promise 完成才跑，是顺序的
- **函数外部** — 其他代码、其他请求不受影响，继续跑

`await` 暂停的是这个函数的执行，不是整个 JS 进程。

---

=====

# Promises & Await

## English Translation

**Q: At this point, `storage` and `upload` are already created. But for `storage` to exist, it needs to be created synchronously, right? In our example the path is hardcoded so there's no DB call.**

Correct. Because `storage` is created synchronously when the module loads, any incoming request can use it directly.

If creating `storage` required async work (e.g. querying a DB to get config), it would be a problem:

```js
// hypothetical — this doesn't actually work
const storage = await db.getStorageConfig(); // can't use await at the module top level
```

Top-level `await` isn't supported in this context, so if initialization were async, you'd need a different approach.

Multer's `diskStorage` is purely synchronous — it just creates a config object in memory with no I/O — so `const storage = ...` at the top level is perfectly fine.

---

**Q: But what if users really do need separate folders? You said top-level await isn't supported — so what do you do?**

This is exactly why `destination` is designed to accept `cb`. The async work doesn't happen at the top level — it happens inside `destination`, which runs per-request:

```js
// top level — synchronous, just creates the config object
const storage = multer.diskStorage({

    // this function runs at request time, so async is fine here
    destination(req, file, cb) {
        User.findById(req.user._id, (err, user) => {
            cb(null, `uploads/${user.username}/`);
        });
    },
});
```

`multer.diskStorage({...})` at the top level is synchronous — it just stores a reference to the `destination` function without executing it. The function only runs when a request comes in.

```
Top level: store the function reference   ← synchronous, no problem
Request time: execute the function        ← async is fine here
```

---

**Q: But the way it's written, you can't tell that `destination` is async.**

Correct — you can't. Because `destination` itself is defined synchronously, it's just a plain function. The async part is inside the function body:

```js
destination(req, file, cb) {
    User.findById(...)  // ← this line is async
}
```

`destination` doesn't need to be marked `async` because it doesn't `return` anything and doesn't need `await`. It fires an async operation and calls `cb` inside the callback.

Comparison:

```js
// needs async — because it awaits a return value
async function getUser() {
    const user = await User.findById(id);
    return user;
}

// doesn't need async — result is passed out via cb, not return
destination(req, file, cb) {
    User.findById(id, (err, user) => {
        cb(null, `uploads/${user.username}/`);
    });
}
```

`cb` exists as a replacement for `return` — since you're not returning anything, you don't need `async`.

---

**Q: `findById(id)` vs `findById(id, (err, user) => {` — what are the actual parameters?**

`findById` is a Mongoose method that supports two calling styles:

```js
// Style 1: pass only id — returns a Promise, use with await
const user = await User.findById(id);

// Style 2: pass id + callback — no Promise returned, result comes via callback
User.findById(id, (err, user) => {
    // user is here
});
```

The signature is roughly:
```js
findById(id, callback?)  // callback is optional
```

- With callback → callback style
- Without callback → returns a Promise, use await

Same function, two ways to use it. `await` is the modern approach; callback style is the older pattern.

---

**Q: It returns a Promise — can we catch it explicitly? Show me the Promise directly.**

```js
// await unwraps the Promise for you — you never see it
const user = await User.findById(id);

// without await, you can see the Promise itself
const promise = User.findById(id);
console.log(promise); // Promise { <pending> }

// handle it manually
User.findById(id)
    .then((user) => {
        console.log(user); // success
    })
    .catch((err) => {
        console.log(err);  // failure
    });
```

A Promise has three states:
```
pending   → still waiting (DB hasn't responded)
fulfilled → succeeded, has a value
rejected  → failed, has an error
```

`await` is syntactic sugar for `.then()` — it waits for the Promise to go from `pending` to `fulfilled`, then unwraps the value.

---

**Q: So a Promise is returned synchronously right away? But the value keeps updating? At what frequency?**

A Promise doesn't "keep updating." More precisely: **a Promise is a container whose state changes exactly once.**

```
pending → fulfilled  (success — stays here forever)
pending → rejected   (failure — stays here forever)
```

Execution order:

```js
const promise = User.findById(id); // 1. returns a pending Promise immediately
                                   // 2. DB query starts in the background
// ... other code keeps running ...
// ... DB responds ...
// 3. Promise state changes to fulfilled, value is placed inside
// 4. .then() or await picks up the value
```

It's not updating at some frequency — it changes once when the DB responds, and never again. There's no polling — JS's event loop gets notified when the DB responds, then triggers the continuation. Entirely event-driven.

---

**Q: You said "wait for the Promise to go from pending to fulfilled, then give me the value and continue running." But didn't you say code below keeps running while waiting?**

The key is to distinguish between two kinds of "below."

`await` pauses **the current async function**, but does not block **the entire program**.

```js
async function handleRequest(req, res) {
    const user = await User.findById(id); // this function pauses here
    console.log(user);                    // only runs after user is back
}

// meanwhile, other requests can come in
// Express handles them normally — unaffected
```

In practice:

```
Request A comes in → handleRequest starts
  → await User.findById()  ← function A pauses here

Request B comes in → handleRequest starts (A is still waiting)
  → request B is handled normally

DB responds → function A resumes from where it paused
  → console.log(user)
```

- **Inside the function** — code after `await` runs in order, after the Promise resolves
- **Outside the function** — other code and other requests keep running, unaffected

`await` pauses this function's execution — not the entire JS process.
