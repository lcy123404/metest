import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export function sitesOutput() {
  let root = process.cwd();

  return {
    name: 'sites-output',
    configResolved(config) {
      root = config.root;
    },
    closeBundle() {
      const serverDir = resolve(root, 'dist/server');
      const metadataDir = resolve(root, 'dist/.openai');
      mkdirSync(serverDir, { recursive: true });
      mkdirSync(metadataDir, { recursive: true });
      copyFileSync(resolve(root, 'worker/index.js'), resolve(serverDir, 'index.js'));
      copyFileSync(resolve(root, '.openai/hosting.json'), resolve(metadataDir, 'hosting.json'));
    },
  };
}
