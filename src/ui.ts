import { intro, outro, text, spinner, confirm, select, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import { EnvVariables, EnvDiff } from './core';

export async function promptForMissingEnvs(
    missingKeys: string[],
    emptyKeys: string[]
): Promise<EnvVariables | null> {
    const newVars: EnvVariables = {};

    const totalMissing = missingKeys.length + emptyKeys.length;

    intro(pc.bgMagenta(pc.white(' env-doctor ')));
    console.log(pc.yellow(`\n🩺 Found ${totalMissing} environment variables that need your attention.\n`));

    for (const key of missingKeys) {
        const value = await text({
            message: `You are missing ${pc.cyan(key)}. Please enter a value:`,
            placeholder: 'Value for ' + key,
            validate(value) {
                if (value.length === 0) return 'Value is required!';
            },
        });

        if (isCancel(value)) {
            outro(pc.red('✖ Operation cancelled.'));
            process.exit(1);
        }

        newVars[key] = value as string;
    }

    for (const key of emptyKeys) {
        const value = await text({
            message: `${pc.cyan(key)} exists but is empty. Please enter a value (or leave empty to skip):`,
            placeholder: 'Value for ' + key,
        });

        if (isCancel(value)) {
            outro(pc.red('✖ Operation cancelled.'));
            process.exit(1);
        }

        if (value && (value as string).trim() !== '') {
            newVars[key] = value as string;
        }
    }

    return Object.keys(newVars).length > 0 ? newVars : null;
}

export function displaySuccess(message: string) {
    outro(pc.green(`✔ ${message}`));
}

export function displayError(message: string) {
    outro(pc.red(`✖ ${message}`));
}
