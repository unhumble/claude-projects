# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main content window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, straightforward fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to tasks/todo.md with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to tasks/todo.md
6. **Capture Lessons**: Update tasks/lessons.md after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

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
