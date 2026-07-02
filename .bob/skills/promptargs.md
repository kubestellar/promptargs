---
name: promptargs
description: Run prompt templates with variable substitution — fill blanks, iterate arrays
---

# promptargs — Template arguments for AI prompts 🏴‍☠️

Use this skill when the user wants to run prompt templates with `{{variable}}` substitution.

## Usage

```bash
# Run a template
promptargs review --file=src/main.ts --no-interactive

# Array iteration
promptargs review --file=api.go,auth.go,db.go --no-interactive

# Inline template
promptargs "Explain {{concept}} to a {{audience=beginner}}" --concept=recursion --no-interactive

# List templates
promptargs list

# Create starter templates
promptargs init
```

## Install

```bash
npm install -g @kubestellar/promptargs
```

## Template syntax

- `{{variable}}` — required, must be filled
- `{{variable=default}}` — has a default value

Templates live in `.prompts/` (project) or `~/.prompts/` (user).

## Auto-detected variables

`{{branch}}`, `{{repo}}`, `{{org}}`, `{{user}}`, `{{date}}`, `{{diff}}`, `{{pr}}` — filled from git context automatically.
