# Architecture

## Basics
The fundamentals for keeping the codebase understandable.

### System Architecture & Tech Stack
- **Runtime:** Node.js (LTS)
- **Language:** Vanilla JavaScript (ESM - ECMAScript Modules)
- **Dependencies:** Minimal. Prefer built-in Node.js modules (fs, path, crypto, etc.). Avoid external modules.
- **Entry Point:** `src/index.js`

### Style Guidelines
- **Modules:** Use `import/export` syntax (ESM). Ensure `"type": "module"` is in `package.json`.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- **Async:** Use `async/await` over raw Promises or callbacks.
- **Error Handling:** Use `try/catch` blocks in async functions with descriptive error messages.
- **Formatting:** Standard JS style (2 spaces).

### Commands
- **Run:** `npm run dev` starts a server and opens a browser to display the demo. The demo auto updates when files change
- **Lint:** `npm run lint` use eslint 

### Patterns & Rules
- Keep functions small and readable
- Prefer `const` > `let` > `var` (avoid `var` entirely).