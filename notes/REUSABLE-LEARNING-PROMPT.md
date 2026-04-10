# Reusable Codebase Learning Prompt

Copy-paste this at the start of any new session with a new codebase.

---

## The Prompt

> I am a second-year CS student with basic full-stack experience (React, Node.js).
> I want to fully understand this codebase — architecture first, then code details.
> No rush. Tailor all explanations to my level, using analogies from web dev where possible.
>
> Please set up the following learning system before we start:
>
> **1. A `learning/` directory at the project root containing:**
> - `README.md` — master index with a layered roadmap (most familiar → most novel),
>   a progress tracker, and a vocabulary glossary of key terms
> - One `XX-topic.md` file per layer (e.g. `01-entry-point.md`, `02-routing.md`)
> - A `concepts/` subdirectory for deep-dive pattern explanations
>
> **2. Inline `[LEARN]` comments in source files as we walk through them.**
> - Keep them short: explain the *why*, not just the *what*
> - When we go deep on a concept, add a pointer at the end of the comment block:
>   `// → learning/concepts/concept-name.md`
>
> **3. A `learning/concepts/` file for every concept we dig into.**
> Each file should include:
> - Plain-English explanation (no jargon)
> - A concrete analogy or real-world example
> - A code before/after showing the difference
> - A "Where it shows up again" table for that codebase
>
> **4. Update `learning/README.md`** after each layer is complete:
> - Mark it ✅ in the roadmap table
> - Add new concepts to the concepts index
>
> **Learning flow per session:**
> - Walk me through one layer at a time
> - When I select or ask about something, explain it in plain English first,
>   then update the comment and/or create a concept file
> - If something can be resumed later, the notes are the continuity — not the chat history
>
> Start by exploring the codebase, then propose a layered roadmap before writing any files.

---

## Why This Works

| Problem | Solution |
|---------|----------|
| Hard to remember what you learned | Notes live in the repo, not in chat history |
| Comments are too terse | `[LEARN]` tags explain the *why* in plain English |
| Concepts get repeated across files | One `concepts/` file, referenced everywhere via pointer |
| Sessions end and context is lost | `--resume` or start fresh — notes catch you up |
| Deep dives clutter source files | Short comment in source + full explanation in `concepts/` |
