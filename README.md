# promptargs 🏴‍☠️

**Template arguments for AI prompts.**

You write a prompt with blanks (`{{like_this}}`), and promptargs fills them in.

```
Review {{file}} for {{focus}} issues.
```

becomes...

```
Review src/app.ts for security issues.
```

That's it. That's the whole idea.

Works as a **CLI** and as a **skill** in Claude Code, Copilot, Goose, and Bob.

---

## Install

### CLI

```bash
npm install -g @kubestellar/promptargs
```

Or just run it without installing:

```bash
npx @kubestellar/promptargs help
```

### As a Skill

This repo ships skill files for multiple AI coding tools. Install the one(s) you use:

**Claude Code:**
```bash
mkdir -p ~/.claude/skills
curl -o ~/.claude/skills/promptargs.md \
  https://raw.githubusercontent.com/kubestellar/promptargs/main/.claude/skills/promptargs.md
```

**Goose:**
```bash
mkdir -p ~/.config/goose/skills
curl -o ~/.config/goose/skills/promptargs.md \
  https://raw.githubusercontent.com/kubestellar/promptargs/main/.goose/agents/promptargs.md
```

**Bob (IBM):**
```bash
mkdir -p ~/.bob/skills
curl -o ~/.bob/skills/promptargs.md \
  https://raw.githubusercontent.com/kubestellar/promptargs/main/.bob/skills/promptargs.md
```

**Copilot:** Automatically detected from `.github/copilot-instructions.md` when you clone this repo.

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

## Use with AI Coding Tools

### Pipe to any CLI

promptargs works with any AI tool that accepts piped input:

```bash
# Claude
promptargs review --file=src/main.ts --no-interactive | claude -p "do this review"

# Goose
promptargs review --file=src/main.ts --no-interactive | goose run

# Copilot
promptargs review --file=src/main.ts --no-interactive | gh copilot explain
```

### As a skill inside your AI tool

If you installed the skill (see [Install](#as-a-skill)), use it directly inside your session:

**Claude Code:**
```
/promptargs review --file=src/api.ts
```

**Goose / Bob:** The skill is automatically available after install — ask your agent to "use promptargs" or run a template.

**Copilot:** The instructions in `.github/copilot-instructions.md` teach Copilot about promptargs when you're in a repo that has it.

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
| `... \| claude -p "do this"` | Pipe to Claude |
| `... \| goose run` | Pipe to Goose |

---

## License

Apache-2.0
