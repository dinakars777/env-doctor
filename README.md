# env-doctor 🩺

[![npm version](https://img.shields.io/npm/v/@dinakars777/env-doctor.svg?style=flat-square)](https://www.npmjs.com/package/@dinakars777/env-doctor)
[![npm downloads](https://img.shields.io/npm/dm/@dinakars777/env-doctor.svg?style=flat-square)](https://www.npmjs.com/package/@dinakars777/env-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> A beautiful, interactive CLI to diagnose and fix missing local environment variables.

You pulled down a project, ran `npm run dev`, and it crashed because someone added a new `.env` variable and forgot to tell you. **env-doctor** prevents "it works on my machine" syndrome by validating your `.env` against `.env.example` and interactively prompting you to fill in the gaps.

## Features

- ✨ Zero configuration — just run it in your project root
- 🎨 Beautiful UI powered by `@clack/prompts` and `picocolors`
- 🛡️ Non-destructive — appends new keys without touching existing ones
- ⚡ Extremely fast with minimal dependencies

## Quick Start

```bash
npx @dinakars777/env-doctor
```

Or install globally:

```bash
npm install -g @dinakars777/env-doctor
env-doctor
```

## Options

| Flag | Description | Default |
|---|---|---|
| `--example <path>` | Path to the example env file | `.env.example` |
| `--env <path>` | Path to your local env file | `.env` |

```bash
npx @dinakars777/env-doctor --example .env.template --env .env.local
```

## How It Works

1. Reads `.env.example` and your local `.env`
2. Lists any keys that are missing or empty in your `.env`
3. Launches an interactive prompt asking for the missing values
4. Safely appends them to your `.env` — you're ready to code

## Tech Stack

| Package | Purpose |
|---|---|
| `@clack/prompts` | Beautiful interactive CLI UI |
| `picocolors` | Terminal color output |
| TypeScript | Type-safe implementation |

## Contributing

```bash
git clone https://github.com/dinakars777/env-doctor.git
cd env-doctor
npm install
npm run dev
```

## License

MIT
