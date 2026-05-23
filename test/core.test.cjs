const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

require('ts-node/register');

const { appendToEnvFile, compareEnvFiles, parseEnvFile } = require('../src/core.ts');

function withTempDir(callback) {
    const previousCwd = process.cwd();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-doctor-'));

    try {
        process.chdir(tempDir);
        callback(tempDir);
    } finally {
        process.chdir(previousCwd);
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

test('compareEnvFiles reports missing and empty expected keys', () => {
    const diff = compareEnvFiles(
        { API_KEY: '', DATABASE_URL: '', OPTIONAL_FLAG: '' },
        { API_KEY: 'secret', DATABASE_URL: '' }
    );

    assert.deepEqual(diff, {
        missingKeys: ['OPTIONAL_FLAG'],
        emptyValues: ['DATABASE_URL'],
    });
});

test('appendToEnvFile appends missing keys without rewriting existing values', () => {
    withTempDir(() => {
        fs.writeFileSync('.env', 'EXISTING=kept\n');

        appendToEnvFile('.env', {
            API_KEY: 'secret',
        });

        assert.equal(fs.readFileSync('.env', 'utf-8'), 'EXISTING=kept\nAPI_KEY=secret\n');
    });
});

test('appendToEnvFile replaces empty assignment forms parsed by dotenv', () => {
    withTempDir(() => {
        fs.writeFileSync('.env', [
            '# local env',
            'export API_KEY=',
            'DATABASE_URL =',
            'EXISTING=kept',
            '',
        ].join('\n'));

        appendToEnvFile('.env', {
            API_KEY: 'abc123',
            DATABASE_URL: 'postgres://localhost/app',
        });

        const content = fs.readFileSync('.env', 'utf-8');

        assert.equal(content, [
            '# local env',
            'EXISTING=kept',
            'API_KEY=abc123',
            'DATABASE_URL=postgres://localhost/app',
            '',
        ].join('\n'));
        assert.deepEqual(parseEnvFile('.env'), {
            EXISTING: 'kept',
            API_KEY: 'abc123',
            DATABASE_URL: 'postgres://localhost/app',
        });
    });
});

test('appendToEnvFile quotes values that dotenv would otherwise truncate or trim', () => {
    withTempDir(() => {
        appendToEnvFile('.env', {
            HASH_SECRET: 'abc#def',
            PADDED_SECRET: '  keep spaces  ',
            MULTILINE_SECRET: 'line1\nline2',
            DOUBLE_QUOTE_SECRET: 'abc"def#ghi',
        });

        const content = fs.readFileSync('.env', 'utf-8');

        assert.match(content, /^HASH_SECRET="abc#def"$/m);
        assert.match(content, /^PADDED_SECRET="  keep spaces  "$/m);
        assert.match(content, /^MULTILINE_SECRET="line1\\nline2"$/m);
        assert.match(content, /^DOUBLE_QUOTE_SECRET='abc"def#ghi'$/m);
        assert.deepEqual(parseEnvFile('.env'), {
            HASH_SECRET: 'abc#def',
            PADDED_SECRET: '  keep spaces  ',
            MULTILINE_SECRET: 'line1\nline2',
            DOUBLE_QUOTE_SECRET: 'abc"def#ghi',
        });
    });
});
