# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git workflow

Commit and push to GitHub regularly as work progresses — after each meaningful change, not just at the end. Use clean, descriptive commit messages that reflect what changed and why.

## Troubleshooting: Node.js on Windows (Git Bash)

### Node/npm not in PATH
The default Git Bash shell doesn't include Node.js. Always prepend:
```bash
export PATH="/c/Program Files/nodejs:$PATH"
```

### Stale node processes on Windows
When a `node` server returns unexpected results (e.g., 404 on a route you just added), the most likely cause is a **stale node process** still bound to the port from a previous run. `pkill -f "node index"` may not kill all of them.

**Fix:** Use `taskkill //F //IM node.exe` to force-kill all node processes, then restart. Always do this before debugging route registration issues.

### Express 5 quirks
- **Dots in route paths:** Express 5 treats dots in route patterns (e.g., `/demo.html`) as special regex characters. Use routes without file extensions (e.g., `/demo`) and serve files via `res.sendFile()`.
- **Direct-run detection:** The common pattern `import.meta.url === \`file:///\${process.argv[1]}\`` is fragile on Windows due to path separator mismatches. Prefer `process.env.VITEST` or similar env-var guards to prevent server auto-start during tests.
