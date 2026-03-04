import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export interface EnvVariables {
    [key: string]: string;
}

export interface EnvDiff {
    missingKeys: string[];
    emptyValues: string[];
}

/**
 * Reads and parses a .env or .env.example file.
 * Returns an object with key-value pairs.
 */
export function parseEnvFile(filePath: string): EnvVariables | null {
    const fullPath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    return dotenv.parse(fileContent);
}

/**
 * Compares an expected set of variables against an actual set.
 * Returns missing keys and keys that exist but have empty values.
 */
export function compareEnvFiles(expected: EnvVariables, actual: EnvVariables): EnvDiff {
    const missingKeys: string[] = [];
    const emptyValues: string[] = [];

    for (const key of Object.keys(expected)) {
        if (!(key in actual)) {
            missingKeys.push(key);
        } else if (actual[key].trim() === '') {
            emptyValues.push(key);
        }
    }

    return { missingKeys, emptyValues };
}

/**
 * Appends new variables to the actual env file.
 */
export function appendToEnvFile(filePath: string, newVars: EnvVariables): void {
    const fullPath = path.resolve(process.cwd(), filePath);

    let content = '';
    if (fs.existsSync(fullPath)) {
        content = fs.readFileSync(fullPath, 'utf-8');

        // Remove existing empty definitions for the keys we are about to update
        const lines = content.split('\n');
        const updatedLines = lines.filter(line => {
            for (const key of Object.keys(newVars)) {
                // If the line is an exact match for the key we are replacing (usually empty), filter it out
                if (line.trim().startsWith(`${key}=`)) {
                    return false;
                }
            }
            return true;
        });

        content = updatedLines.join('\n');

        // Ensure file ends with a newline before appending
        if (content.length > 0 && !content.endsWith('\n')) {
            content += '\n';
        }
    }

    for (const [key, value] of Object.entries(newVars)) {
        content += `${key}=${value}\n`;
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
}
