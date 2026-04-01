import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = path.resolve('.');

function runOrFail(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function assertDirectoryExists(sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    process.stderr.write(`Source directory does not exist: ${sourceDir}\n`);
    process.exit(1);
  }
}

function collectFilePaths(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name.startsWith('.')) {
      return [];
    }

    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectFilePaths(absolutePath);
    }
    return [absolutePath];
  });
}

export function pushToLocalR2Bucket({ bucket, sourceDir }) {
  assertDirectoryExists(sourceDir);
  const files = collectFilePaths(sourceDir);
  process.stdout.write(`Pushing ${files.length} files to local bucket ${bucket}\n`);

  for (const file of files) {
    const key = path.relative(sourceDir, file).replaceAll(path.sep, '/');
    runOrFail('pnpm', [
      'exec',
      'wrangler',
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${file}`,
      '--local',
    ]);
  }
}

export function syncLocalDirToProdBucket({ sourceDir, bucket }) {
  assertDirectoryExists(sourceDir);
  runOrFail('rclone', ['sync', `${sourceDir}/`, `r2:${bucket}/`]);
}

export function syncProdBucketToLocalDir({ bucket, targetDir }) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  runOrFail('rclone', ['sync', `r2:${bucket}/`, `${targetDir}/`]);
}

export const CONTENT_TARGETS = {
  blogs: {
    bucket: 'portfolio-bucket',
    sourceDir: path.join(REPO_ROOT, 'seeds', 'blogs'),
  },
  resumeAssets: {
    bucket: 'portfolio-resume-assets',
    sourceDir: path.join(REPO_ROOT, 'seeds', 'resume-assets'),
  },
};

const TARGET_ORDER = ['blogs', 'resumeAssets'];

const SCOPE_TO_KEY = {
  blogs: 'blogs',
  resume: 'resumeAssets',
  'resume-assets': 'resumeAssets',
};

function printUsage() {
  process.stderr.write(`Usage: pnpm run content -- <command> [args]

Commands:
  push <local|prod> [blogs|resume|resume-assets]
  fetch [blogs|resume|resume-assets]
  reset-local
  help
`);
}

function resolveTargetKeys(scopeArg) {
  if (scopeArg === undefined) {
    return TARGET_ORDER;
  }

  const key = SCOPE_TO_KEY[scopeArg];
  if (!key) {
    process.stderr.write(`Unknown scope: ${scopeArg}\n`);
    printUsage();
    process.exit(1);
  }

  return [key];
}

function pushTarget(mode, key) {
  const target = CONTENT_TARGETS[key];
  if (mode === 'prod') {
    syncLocalDirToProdBucket({ sourceDir: target.sourceDir, bucket: target.bucket });
  } else {
    pushToLocalR2Bucket({ bucket: target.bucket, sourceDir: target.sourceDir });
  }
}

function fetchTarget(key) {
  const target = CONTENT_TARGETS[key];
  syncProdBucketToLocalDir({ bucket: target.bucket, targetDir: target.sourceDir });
}

function resetLocalState() {
  const stateDir = path.join(REPO_ROOT, '.wrangler', 'state');
  if (fs.existsSync(stateDir)) {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
  process.stdout.write('Removed .wrangler/state\n');
  for (const key of TARGET_ORDER) {
    pushTarget('local', key);
  }
}

function isExecutedDirectly() {
  const invoked = process.argv[1];
  if (!invoked) {
    return false;
  }

  const scriptPath = fileURLToPath(import.meta.url);
  return path.resolve(invoked) === path.resolve(scriptPath);
}

function normalizeCliArgs(argvSlice) {
  if (argvSlice[0] === '--') {
    return argvSlice.slice(1);
  }

  return argvSlice;
}

function main() {
  const args = normalizeCliArgs(process.argv.slice(2));
  const command = args[0];

  if (command === undefined || command === 'help') {
    printUsage();
    process.exit(command === undefined ? 1 : 0);
  }

  if (command === 'push') {
    const mode = args[1];
    if (mode !== 'local' && mode !== 'prod') {
      process.stderr.write('push requires second argument: local or prod\n');
      printUsage();
      process.exit(1);
    }

    const keys = resolveTargetKeys(args[2]);
    for (const key of keys) {
      pushTarget(mode, key);
    }
    return;
  }

  if (command === 'fetch') {
    const keys = resolveTargetKeys(args[1]);
    for (const key of keys) {
      fetchTarget(key);
    }
    return;
  }

  if (command === 'reset-local') {
    resetLocalState();
    return;
  }

  process.stderr.write(`Unknown command: ${command}\n`);
  printUsage();
  process.exit(1);
}

if (isExecutedDirectly()) {
  main();
}
