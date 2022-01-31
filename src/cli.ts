#!/usr/bin/env node

import { exit } from "process";
import { readFile } from 'fs/promises';
import { stringify } from './index.js';

async function main(args: string[]) {
  let width = 80;
  let useStdin = true;

  for (const option of args) {
    if (option.startsWith('--')) {
      const [, name, value] = option.match(/^--([^=]+)=?(.*)$/) || [];
      if (name === 'help') {
        help();
      } else if (name === 'width') {
        width = parseInt(value, 10);
        if (isNaN(width) || width < 0) {
          help("width must be a positive number");
        }
      } else {
        help(`Unknown option: ${option}`);
      }
    } else {
      const fileName = option;
      useStdin = false;

      try {
        const json = await readFile(fileName, 'utf8');
        console.log(stringify(JSON.parse(json), width) + '\n');
      } catch (e) {
        help(`Could not read ${fileName}:\n${e}`);
      }
    }
  }

  if (!useStdin) {
    return;
  }

  const json = await readFile('/dev/stdin', 'utf8');
  console.log(stringify(JSON.parse(json), width) + '\n');
}

function help(msg?: string) {
  if (msg) {
    console.error(msg + '\n');
  }

  console.log(`
Usage:
  wide-json [options] filename.json > output.json
  wide-json [options] < input.json > output.json

Options:
  --help       Show this help message.
  --width=N    Set the target width of the output.
               (default: 80)
`);

  exit(msg === undefined ? 0 : 1);
}

if (require.main === module) {
  main(process.argv.slice(2));
}
