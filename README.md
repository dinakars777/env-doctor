# env-doctor 🩺

> A beautiful, interactive CLI to diagnose and fix missing local environment variables.

![env-doctor screenshot](./screenshot.png) *(Imagine a beautiful clack-based terminal here)*

## The Problem
Every developer has pulled down a project, run `npm run dev`, and watched it crash because they are missing a variable in their `.env` file that another developer added, but forgot to tell them about. 

**env-doctor** prevents "it works on my machine" syndrome by validating your local `.env` file against your team's `.env.example` template and interactively prompting you to fill in missing values.

## Features
- ✨ **Zero configuration required.** Just run the command in your project root.
- 🎨 **Beautiful UI.** Powered by `@clack/prompts` and `picocolors`.
- ⚡ **Extremely fast.** Minimal dependencies.
- 🛡️ **Non-destructive.** Appends new keys without touching your existing ones.

## Usage

Simply run this command in the root of your project:

```bash
npx @dinakars777/env-doctor
```

Or install it globally:
```bash
npm install -g @dinakars777/env-doctor
env-doctor
```

## How It Works

1. It searches for `.env` and `.env.example` in your current directory.
2. It lists any keys present in `.env.example` that are missing or empty in your `.env`.
3. It launches an interactive prompt asking you for the missing values.
4. It safely appends them to your local `.env` and you're ready to code!

## Customization

You can specify custom paths for your environment files:
```bash
npx @dinakars777/env-doctor --example .env.template --env .env.local
```

## Contributing

Pull requests are welcome!

```bash
git clone https://github.com/your-username/env-doctor.git
cd env-doctor
npm install
npm run dev
```

## License

MIT
