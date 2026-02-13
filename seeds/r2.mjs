import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const bucket = 'portfolio-bucket';
const sourceDir = path.resolve('./seeds/r2');

const modeArg = process.argv[2] ?? '--local';
const isProd = modeArg === '--prod';

if (!['--local', '--prod', '--help'].includes(modeArg)) {
  console.error('Invalid mode. Use --local or --prod.');
  process.exit(1);
}

if (modeArg === '--help') {
  console.log('Usage: node seeds/r2.mjs [--local|--prod]');
  process.exit(0);
}

const targetFlag = isProd ? '--remote' : '--local';

function uploadDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.name.startsWith('.')) continue;
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      uploadDir(fullPath);
    } else {
      const key = path.relative(sourceDir, fullPath);
      const cmd = `pnpm exec wrangler r2 object put "${bucket}/${key}" --file="${fullPath}" ${targetFlag}`;
      console.log(`Uploading: ${key}`);
      execSync(cmd, { stdio: 'inherit' });
    }
  }
}

console.log(`Seeding target: ${isProd ? 'production' : 'local'}`);
uploadDir(sourceDir);
console.log('Seeding done!');
