import { assert } from 'chai';
import { suite, suiteSetup, setup, test } from 'mocha';

import { nodeName, generateJSONLevel } from './json-generator.js';
import { JSONMap } from '../index.js';

suite("json-generator", () => {
  suite("nodeName", () => {
    type Params = [number, number[]];
    const testCases: [Params, string][] = [
      [ [0, [1]], "__" ],
      [ [1, [0]], "a_" ],
      [ [0, [0, 0]], "___" ],
      [ [1, [0, 0]], "a__" ],
      [ [2, [0, 0,]], "aa_" ],
      [ [3, [0, 0,]], "aaa" ],
      [ [2, [1, 2]], "bc_" ],
    ];

    for (const [params, expected] of testCases) {
      test(`${JSON.stringify(params)} => ${expected}`, () => {
        assert.equal(nodeName(...params), expected);
      });
    }
  });

  suite("map generator", () => {
    const testCases: [number[], JSONMap][] = [
      [ [1], { a_: "aa" }],
      [ [2, 1], { "a__": { "aa_": "aaa" },
                  "b__": { "ba_": "baa" } } ],
    ];

    for (const [scheme, expected] of testCases) {
      test(`${JSON.stringify(scheme)} => ${JSON.stringify(expected)}`, () => {
        const pos = Array.from({length: scheme.length}).fill(0) as number[];
        assert.deepEqual(generateJSONLevel(0, pos, scheme), expected);
      });
    }
  });
});
