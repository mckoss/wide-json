export { generateJSON, generateJSONLevel, nodeName };

import { JSONMap } from '../index.js';

// Generate "random" JSON files that implement a tree of
// nodes.  The tree is len(scheme) nodes high.  The
// scheme values are positive for Map nodes and negative
// for array nodes.  The absolute value of the scheme
// value is the number of children of that node.
//
// Nodes are "named" according to the position in the
// tree.  Each child of the root node is named "a"
// through alpha[scheme[0]].
//
// The leaf nodes are strings with the node name.
//
// E.g. scheme = [2, 1] generates:
//
// { "a__": { "aa_": "aaa" },
//   "b__": { "ba_": "baa" } }

function generateJSON(scheme: number[]): string {
  const pos = Array.from({length: scheme.length}).fill(0) as number[];
  return JSON.stringify(generateJSONLevel(0, pos, scheme), null, 2);
}

function generateJSONLevel(level: number, pos: number[], scheme: number[]) : JSONMap | string {
  if(level === scheme.length) {
    return nodeName(level + 1, pos);
  }
  const result: JSONMap = {};
  const childPos = pos.slice();
  for (let i = 0; i < scheme[level]; i++) {
    childPos[level] = i;
    result[nodeName(level + 1, childPos)] = generateJSONLevel(level + 1, childPos, scheme);
  }
  return result;
}

function nodeName(level: number, pos: number[]): string {
  const chars = [];
  for (let i = 0; i < level; i++) {
    if (i >= pos.length) {
      chars.push("a");
    } else {
      chars.push(String.fromCharCode(97 + pos[i]));
    }
  }
  for (let i = level; i <= pos.length; i++) {
    chars.push('_');
  }
  return chars.join('');
}
