---
applyTo: "**"
---
<!-- remb-instructions:v2 -->
# Remb — AI Context Management

You have access to Remb tools for persistent memory and context across coding sessions.
Current project: **landing-page**

## MANDATORY Session Protocol

Follow this protocol in EVERY session. Skipping causes knowledge loss.

### Session Start (do FIRST, before any other work):
1. Call `remb__conversation_history` — loads what was discussed and accomplished in prior sessions so you can pick up where the user left off.
2. Call `remb__memory_load_context` — loads the full project context bundle (memories, features, tech stack).

### During Work:
3. Call `remb__conversation_log` after completing any significant task, bug fix, or feature — records what was done for future sessions.
4. Call `remb__memory_create` when you discover important patterns, architectural decisions, or gotchas worth preserving.

### Session End (do LAST, before the conversation ends):
5. Call `remb__conversation_log` with a summary of: what was asked, what was done, key decisions made.

## Available Tools

| Tool | Purpose | When to Call |
|------|---------|--------------|
| `remb__memory_load_context` | Full project context bundle — memories, features, tech stack | **Session start** (mandatory) |
| `remb__conversation_history` | Prior session history — what was done before | **Session start** (mandatory) |
| `remb__conversation_log` | Record work done in this session | After completing tasks, and at session end |
| `remb__context_save` | Save feature-specific context or decisions | When you learn something about a specific feature |
| `remb__context_get` | Retrieve context for a specific feature | When you need details about a feature |
| `remb__memory_list` | Browse persistent memories | When searching for past decisions or patterns |
| `remb__memory_create` | Save a new persistent memory | When discovering patterns, decisions, gotchas |
| `remb__scan_trigger` | Re-scan the codebase from GitHub or locally | After significant code changes |
| `remb__scan_status` | Check scan progress | After triggering a scan |

## Decision Matrix

| Situation | Action |
|-----------|--------|
| Starting any session | `remb__conversation_history` + `remb__memory_load_context` |
| Completing a task | `remb__conversation_log` with what was accomplished |
| Found a reusable pattern | `remb__memory_create` with category "pattern" |
| Made an architectural decision | `remb__memory_create` with category "decision" |
| Discovered a gotcha or bug | `remb__memory_create` with category "gotcha" |
| Need info about a feature | `remb__context_get` filtered by feature name |
| User says "remember this" | `remb__memory_create` with appropriate tier |
| Code changed significantly | `remb__scan_trigger` to refresh context |
| Ending the session | `remb__conversation_log` with session summary |
