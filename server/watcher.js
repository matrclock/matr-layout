import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEBOUNCE_MS = 100;

/**
 * Watches directories for file changes and invokes a callback (debounced).
 * @param {string[]} dirs - absolute paths to watch
 * @param {() => void} onChange
 * @returns {{ close: () => void }}
 */
export function watchDirs(dirs, onChange) {
  let debounceTimer = null;

  const watchers = dirs.map((dir) =>
    fs.watch(dir, { recursive: true }, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(onChange, DEBOUNCE_MS);
    }),
  );

  return {
    close() {
      clearTimeout(debounceTimer);
      watchers.forEach((w) => w.close());
    },
  };
}

/**
 * Returns the project root (two levels up from this file).
 */
export function projectRoot() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(__dirname, '..');
}
