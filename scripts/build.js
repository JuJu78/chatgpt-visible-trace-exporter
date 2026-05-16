import { readFile, writeFile } from 'node:fs/promises';
import { minify } from 'terser';

const sourcePath = new URL('../src/bookmarklet.js', import.meta.url);
const distPath = new URL('../dist/bookmarklet.min.js', import.meta.url);

const source = await readFile(sourcePath, 'utf8');

const result = await minify(source, {
  compress: true,
  mangle: true,
  format: {
    comments: false,
  },
});

if (!result.code) {
  throw new Error('Terser did not return minified code.');
}

await writeFile(distPath, `javascript:${result.code}\n`, 'utf8');

console.log('Generated dist/bookmarklet.min.js');
