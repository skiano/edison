import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

(async function runTests() {
  let failures = 0;

  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const files = await fs.promises.readdir(dirname);

  for (let f = 0; f < files.length; f++) {
    const file = files[f];
    if (file.startsWith('_') || !file.endsWith('.js')) continue;

    const m = await import(path.resolve(dirname, file));
    if (!Array.isArray(m.default)) throw new Error(`Suite ${file} invalid`);

    console.log(`Running Suite: ${file}\n`);

    for (let t = 0; t < m.default.length; t++) {
      const test = m.default[t];
      let timer;
      try {
        timer = setTimeout(() => { throw new Error(`Test timed out: ${test.name}`); }, 100);
        await test();
        console.log(`✓ ${test.name}`);
      } catch (err) {
        failures++;
        console.log(`✗ ${test.name} failed!\n`);
        console.log('/\\'.repeat(35))
        console.log(err.stack);
        console.log('/\\'.repeat(35))
        console.log('');
      } finally {
        clearInterval(timer);
      }
    }
    console.log('');
  }

  if (failures > 0) {
    console.log('FAIL!!!');
    process.exit(1);
  } else {
    console.log('\nTests Complete!\n');
  }
})();