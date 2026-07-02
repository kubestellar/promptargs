---
name: promptargs
description: Run prompt templates with variable substitution — fill blanks, iterate arrays
---

# promptargs — Template arguments for AI prompts

Use this skill when the user wants to:
- Run a prompt template with variable substitution
- List or preview available templates
- Create new templates
- Iterate a prompt over multiple files or values

## How to use

### Run a template

```bash
promptargs <template> --var=value --no-interactive
```

Example:
```bash
promptargs review --file=src/main.ts --focus=security --no-interactive
```

### Run with array iteration

Comma-separated values run the template once per value:
```bash
promptargs review --file=api.go,auth.go,db.go --no-interactive
```

Cross-product mode (all combinations):
```bash
promptargs review --file=api.go,auth.go,db.go --focus=security,perf --cross --no-interactive
```

Other array formats:
- `--file=@list.txt` — one value per line from a file
- `--file="src/*.go"` — glob expansion

### Inline template (no file needed)

```bash
promptargs "Explain {{concept}} to a {{audience=beginner}}" --concept=recursion --no-interactive
```

### List templates

```bash
promptargs list
```

### Preview a template

```bash
promptargs show review
```

### Create starter templates

```bash
promptargs init
```

Creates `.prompts/` with review, explain, and fix templates.

## Template syntax

- `{{variable}}` — required blank, must be filled
- `{{variable=default}}` — blank with a default value

Templates are `.md` files in `.prompts/` (project) or `~/.prompts/` (user).

## Auto-detected variables

These fill automatically from git context if not provided:
- `{{branch}}` — current git branch
- `{{repo}}` — repository name
- `{{org}}` — GitHub org/user
- `{{user}}` — git config user name
- `{{date}}` — today's date
- `{{diff}}` — staged or unstaged diff
- `{{pr}}` — current PR number

## Integration with Claude

Pipe output directly to Claude:
```bash
promptargs review --file=src/main.ts --no-interactive | claude -p "do this"
```

Or use the expanded prompt as context for the current conversation — read the output and act on it directly.

## Status line

Run `promptargs env` first to show auto-detected variable values.

After running a template with `--status`, show the fill state:
```bash
promptargs review --file=main.go --status
```

Output: `✅ review: file=main.go  focus=correctness(default)  tone=concise(default)`

## When invoked as /promptargs

When the user types `/promptargs` with arguments, run the promptargs CLI with those arguments and present the expanded prompt output. If no arguments are given, run `promptargs env` to show the current environment, then `promptargs list` to show available templates.

- `/promptargs` — show env + list available templates
- `/promptargs review --file=src/api.ts` — show status, run the review template, perform the review
- `/promptargs list` — show available templates
- `/promptargs init` — create starter templates
- `/promptargs env` — show auto-detected variable values
