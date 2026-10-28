import { copyFileSync, existsSync, symlinkSync } from 'node:fs';

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  console.log('Created .env from .env.example');
}

const dbEnv = 'packages/db/.env';
if (!existsSync(dbEnv)) {
  symlinkSync('../../.env', dbEnv);
  console.log('Linked packages/db/.env -> ../../.env');
}

console.log('Setup complete.');
