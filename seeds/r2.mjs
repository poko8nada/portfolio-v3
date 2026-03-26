import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const bucket = 'portfolio-bucket';
const sourceDir = path.resolve('./seeds/r2');

const modeArg = process.argv[2] ?? '--local';
const isProd = modeArg === '--prod';

if (!['--local', '--prod', '--help'].includes(modeArg)) {
  process.stderr.write('Invalid mode. Use --local or --prod.\n');
  process.exit(1);
}

if (modeArg === '--help') {
  process.stdout.write('Usage: node seeds/r2.mjs [--local|--prod]\n');
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
      process.stdout.write(`Uploading: ${key}\n`);
      execSync(cmd, { stdio: 'inherit' });
    }
  }
}

process.stdout.write(`Seeding target: ${isProd ? 'production' : 'local'}\n`);
uploadDir(sourceDir);
process.stdout.write('Seeding done!\n');
