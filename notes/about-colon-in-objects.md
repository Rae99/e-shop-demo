# The Colon `:` in JavaScript Objects

The colon means different things depending on context, but the rule is always the same:
**left side = key/name, right side = value/expression.**

---

## 1. Object literal — define a property

```js
{ pages: Math.ceil(count / pageSize) }
//  ^       ^
// key     value (any expression)
```

The key is `pages`, the value is whatever the expression evaluates to.

---

## 2. Destructuring — rename while unpacking

```js
const { pages: totalPages } = res;
//      ^        ^
//   original   new local variable name
```

Read it as: "take `pages` from the object, call it `totalPages` here."
The original key name (`pages`) never becomes a variable — only `totalPages` does.

---

## 3. Shorthand — when key and value name are the same

```js
const page = 3;

// long form:
{ page: page }

// shorthand (identical result):
{ page }
```

If the key name matches the variable name exactly, you can drop `: value`.

---

## All three in one line

```js
res.json({ products, page, pages: Math.ceil(count / pageSize) });
//         ^^^^^^^   ^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         shorthand  shorthand   key:value (expression, not a variable)
```

`products` and `page` use shorthand because local variables have the same name.
`pages` can't use shorthand because the value is an expression, not a variable called `pages`.

---

## Quick cheat sheet

| Context | Syntax | Meaning |
|---|---|---|
| Object literal | `{ key: value }` | define property |
| Destructuring | `{ original: renamed }` | unpack + rename |
| Shorthand | `{ name }` | same as `{ name: name }` |