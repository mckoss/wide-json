import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';

import { readdir, readFile } from 'fs/promises';

import { stringify } from '../index.js';

suite('wide-json', () => {
  test('primitives', () => {
    const cases = [
      [1, '1'],
      [1.1, '1.1'],
      [true, 'true'],
      ["foo", '"foo"'],
      [{}, '{}'],
      [[], '[]'],
    ];

    for (const c of cases) {
      assert.equal(stringify(c[0]), c[1], "stringify(" + c[0] + ")");
    }
  });
});

async function sampleFiles() {

  const files = await readdir("samples");

  suite("Sample files", () => {
    for (const fileName of files) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      test(fileName, async () => {
        const groups = fileName.match(/^(.*)-w(\d+)\.json$/);
        let width = 80;
        if (groups !== null) {
          width = parseInt(groups[2]);
        }
        const json = await readFile("samples/" + fileName, "utf8");
        const parsed = JSON.parse(json);
        const s = stringify(parsed, width) + "\n";
        const maxLine = maxLineLength(s);
        // assert.isTrue(maxLine <= width, `maxLineLength(${fileName}) == ${maxLine} <= ${width}`);
        assert.equal(s, json, "stringify(" + fileName + ")");
      });
    }
  });
}

sampleFiles();

function maxLineLength(s: string): number {
  const lines = s.split('\n');
  return lines.reduce((max, line) => Math.max(max, line.length), 0);
}
