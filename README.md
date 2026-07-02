# promptargs 🎲

**Mad Libs for AI prompts.**

You know Mad Libs? The game where you fill in blanks to make silly stories?

**promptargs** does the same thing, but for AI prompts. You write a template with blanks (`{{like_this}}`), and promptargs fills them in.

```
Review {{file}} for {{focus}} issues.
```

becomes...

```
Review src/app.ts for security issues.
```

That's it. That's the whole idea.

---

## Install

```bash
npm install -g promptargs
```

Or just run it without installing:

```bash
npx promptargs help
```

---

## Quick Start (3 steps)

### Step 1: Make some templates

```bash
promptargs init
```

This creates a `.prompts/` folder with 3 starter templates. Done!

### Step 2: See what you have

```bash
promptargs list
```

```
Available templates:

  review
    vars: {{file}}  {{focus=correctness}}  {{tone=concise}}

  explain
    vars: {{file}}  {{style=simple}}  {{audience=junior developer}}

  fix
    vars: {{issue}}  {{file}}  {{expected}}  {{actual}}
```

### Step 3: Use a template

```bash
promptargs review --file=src/app.ts
```

```
Review src/app.ts for correctness issues.
Be concise in your feedback.
Focus on real bugs, not style nitpicks.
```

Variables with `=something` already have a default. Variables without one will ask you to fill them in.

---

## How Blanks Work

A blank looks like this: `{{name}}`

A blank with a default looks like this: `{{name=hello}}`

That's all the syntax there is. Two curly braces, a name, optionally an equals sign and a default.

### Red means "you need to fill this in"

```bash
promptargs show review
```

Shows the template with **red** blanks (required) and **yellow** blanks (has a default).

---

## Fill Blanks Your Way

### From the command line

```bash
promptargs review --file=main.go --focus=security --tone=detailed
```

### Interactively (just run it, it asks you)

```bash
promptargs review
  file: main.go
  focus: (correctness)     ← press Enter to keep default
  tone: detailed
```

### Inline (no template file needed)

```bash
promptargs "Explain {{thing}} to a {{audience=5-year-old}}" --thing=recursion
```

```
Explain recursion to a 5-year-old
```

---

## The Fun Part: Arrays! 🎰

Want to review 5 files? Don't run the command 5 times. Use a comma:

```bash
promptargs review --file=api.go,auth.go,db.go,cache.go,main.go
```

promptargs runs the template **once for each value**:

```
✅ review [1/5]: file=api.go    focus=correctness  tone=concise
✅ review [2/5]: file=auth.go   focus=correctness  tone=concise
✅ review [3/5]: file=db.go     focus=correctness  tone=concise
✅ review [4/5]: file=cache.go  focus=correctness  tone=concise
✅ review [5/5]: file=main.go   focus=correctness  tone=concise
```

Each one gets its own expanded prompt, separated by `---`.

### Three ways to pass arrays

| Syntax | What it does |
|--------|-------------|
| `--file=a.go,b.go,c.go` | Comma-separated list |
| `--file="src/*.go"` | Glob pattern (expands to matching files) |
| `--file=@list.txt` | Reads one value per line from a file |

### Multiple arrays = zip

If you pass two arrays, they zip together:

```bash
promptargs "Review {{file}} for {{focus}}" \
  --file=api.go,auth.go,db.go \
  --focus=security,perf,correctness
```

```
✅ [1/3]: file=api.go   focus=security
✅ [2/3]: file=auth.go  focus=perf
✅ [3/3]: file=db.go    focus=correctness
```

---

## Where Templates Live

| Location | What it's for |
|----------|--------------|
| `.prompts/` | Your project's templates (commit these!) |
| `~/.prompts/` | Your personal templates (available everywhere) |

Project templates override personal ones with the same name.

---

## Auto-Magic Variables ✨

Some variable names fill themselves automatically from your git context:

| Variable | Auto-fills with |
|----------|----------------|
| `{{branch}}` | Current git branch |
| `{{repo}}` | Repository name |
| `{{org}}` | GitHub org/user |
| `{{user}}` | Git config user name |
| `{{date}}` | Today's date |
| `{{diff}}` | Staged or unstaged diff |
| `{{pr}}` | Current PR number |

You can always override them with flags. Auto-detect is just the fallback.

---

## Output Formats

### Plain text (default)

```bash
promptargs review --file=main.go
```

### JSON

```bash
promptargs review --file=main.go --json
```

### Status line (for IDE integration)

```bash
promptargs review --file=main.go --status
```

```
✅ review: file=main.go  focus=correctness(default)  tone=concise(default)
```

---

## Write Your Own Template

Create a file in `.prompts/` with any name ending in `.md`:

**.prompts/buddy.md**
```
Hey {{name=buddy}}! Can you help me understand {{topic}}?
I learn best with {{style=examples and analogies}}.
```

Now use it:

```bash
promptargs buddy --topic="async/await"
```

```
Hey buddy! Can you help me understand async/await?
I learn best with examples and analogies.
```

---

## Cheat Sheet

| Command | What it does |
|---------|-------------|
| `promptargs init` | Create `.prompts/` with examples |
| `promptargs list` | Show all available templates |
| `promptargs show review` | Preview template with highlighted blanks |
| `promptargs review --file=x` | Run template with flags |
| `promptargs review` | Run template interactively |
| `promptargs "inline {{var}}"` | Use inline template |
| `--no-interactive` | Skip questions, use defaults only |
| `--json` | Output as JSON |
| `--status` | Output status line only |

---

## License

Apache-2.0
