#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { parseEnvFile, compareEnvFiles, appendToEnvFile } from './core';
import { promptForMissingEnvs, displaySuccess, displayError } from './ui';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
    .name('env-doctor')
    .description('🩺 A beautiful CLI to diagnose and fix missing local environment variables.')
    .version('1.0.0')
    .option('-e, --env <path>', 'Path to the .env file', '.env')
    .option('-x, --example <path>', 'Path to the .env.example file', '.env.example');

program.parse(process.argv);
const options = program.opts();

async function main() {
    const examplePath = options.example;
    const envPath = options.env;

    const exampleContent = parseEnvFile(examplePath);

    if (!exampleContent) {
        if (fs.existsSync(path.resolve(process.cwd(), examplePath))) {
            console.log(pc.red(`✖ Failed to parse ${examplePath}.`));
        } else {
            console.log(pc.yellow(`ℹ No ${examplePath} file found in the current directory. env-doctor needs an example file to function.`));
        }
        process.exit(1);
    }

    // Create an empty .env if it doesn't exist
    if (!fs.existsSync(path.resolve(process.cwd(), envPath))) {
        console.log(pc.yellow(`ℹ ${envPath} not found. Creating a new one.`));
        fs.writeFileSync(path.resolve(process.cwd(), envPath), '', 'utf-8');
    }

    const envContent = parseEnvFile(envPath);

    if (!envContent) {
        console.error(pc.red(`✖ Failed to read ${envPath} even after attempting to create it.`));
        process.exit(1);
    }

    const { missingKeys, emptyValues } = compareEnvFiles(exampleContent, envContent);

    if (missingKeys.length === 0 && emptyValues.length === 0) {
        console.log(pc.green(`\n✨ Your ${envPath} is perfectly healthy! No missing variables found.\n`));
        process.exit(0);
    }

    // Interactive Prompt
    const newVars = await promptForMissingEnvs(missingKeys, emptyValues);

    if (newVars && Object.keys(newVars).length > 0) {
        appendToEnvFile(envPath, newVars);
        displaySuccess(`Successfully updated ${envPath} with ${Object.keys(newVars).length} variable(s). You're ready to go! 🚀`);
    } else {
        displaySuccess(`No changes made to ${envPath}.`);
    }
}

main().catch((err) => {
    console.error(pc.red('An unexpected error occurred:'), err);
    process.exit(1);
});
