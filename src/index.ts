export { stringify, JSONMap, JSONArray };

type JSONValue = JSONPrimitive | JSONArray | JSONMap;
type JSONPrimitive = boolean | number | string | null;
type JSONMap = { [key: string]: JSONValue; };
type JSONArray = JSONValue[];

type MinMax = [number, number];

function stringify(v: JSONValue, width = 80): string {
  const ctx = new JSONContext(width);
  ctx.output(v);
  return ctx.json();
}

class JSONContext {
  indent = 0;
  column = 0;
  width: number;
  chunks: string[] = [];
  indentStack: number[] = [];
  measures: Map<JSONValue, MinMax> = new Map();
  indents: number[] = [];

  constructor(width: number) {
    this.width = width;
  }

  output(v: JSONValue): void {
    if (Array.isArray(v)) {
      this.outputArray(v);
    } else if (v === null) {
      this.outputValue(null);
    } else if (typeof v === 'object') {
      this.outputMap(v);
    } else {
      this.outputValue(v);
    }
  }

  outputValue(v: JSONPrimitive): void {
    // These will be equal
    const [_, max] = this.measure(v);

    if (this.column + max > this.width) {
      this.newline();
    }

    this.emit(JSON.stringify(v));
  }

  newline(): void {
    if (this.column <= this.indent) {
      return;
    }

    const lastChunk = this.chunks[this.chunks.length - 1];
    if (lastChunk.endsWith(' ')) {
      this.chunks.pop();
      this.chunks.push(lastChunk.slice(0, -1));
    }

    this.chunks.push('\n' + ' '.repeat(this.indent));
    this.column = this.indent;
  }

  emit(s: string): void {
    this.chunks.push(s);
    this.column += s.length;
  }

  outputArray(a: JSONArray): void {
    const [min, max] = this.measure(a);

    if (a.length === 0) {
      this.emit('[]');
      return;
    }

    this.emit('[ ');
    this.indents.push(this.indent);
    this.indent = this.column;

    for (let i = 0; i < a.length; i++) {
      const [min, max] = this.measure(a[i]);
      const trailing = i === a.length - 1 ? ' ]' : ', ';
      if (this.column + max + trailing.length > this.width) {
        this.newline();
      }

      this.output(a[i]);
      this.emit(trailing);
    }

    this.indent = this.indents.pop()!;
  }

  outputMap(m: JSONMap): void {
    const entries = Object.entries(m);

    if (entries.length === 0) {
      this.emit('{}');
      return;
    }

    const [min, max] = this.measure(m);

    this.emit('{ ');
    this.indents.push(this.indent);
    this.indent = this.column;

    for (let i = 0; i < entries.length; i++) {
      const [min, max] = this.measure(entries[i][1]);
      const trailing = i === entries.length - 1 ? ' }' : ', ';
      const keyString = JSON.stringify(entries[i][0]) + ': ';

      if (this.column + keyString.length + max + trailing.length > this.width) {
        this.newline();
      }

      this.emit(keyString);
      this.output(entries[i][1]);
      this.emit(trailing);
    }

    this.indent = this.indents.pop()!;
  }

  json(): string {
    return this.chunks.join('');
  }

  measure(v: JSONValue): MinMax {
    if (this.measures.has(v)) {
      return this.measures.get(v)!;
    }

    let min = 0;
    let max = 0;

    if (Array.isArray(v)) {
      [min, max] = this.measureArray(v);
    } else if (v === null) {
      [min, max] = [4, 4];
    } else if (typeof v === 'object') {
      [min, max] = this.measureMap(v);
    } else {
      const len = JSON.stringify(v).length;
      [min, max] = [len, len];
    }

    this.measures.set(v, [min, max]);
    return [min, max];
  }

  measureArray(a: JSONArray): MinMax {
    let min = 0;
    let max = 0;

    if (a.length === 0) {
      return [2, 2];
    }

    for (let i = 0; i < a.length; i++) {
      // Space before is '[ ' or ', '
      let extra = 2;
      if(i === a.length - 1) {
        // Close array with ' ]'
        extra += 2;
      }
      const [m, x] = this.measure(a[i]);
      if (m + extra > min) {
        min = m + extra;
      }
      max += extra + x;
    }
    return [min, max];
  }

  measureMap(m: JSONMap): MinMax {
    let min = 0;
    let max = 0;
    const entries = Object.entries(m);

    if (entries.length === 0) {
      return [2, 2];
    }

    for (let i = 0; i < entries.length; i++) {
      let extra = 2;
      if(i === entries.length - 1) {
        // Close object with ' }'
        extra += 2;
      }
      // Property string followed by ': '
      extra += JSON.stringify(entries[i][0]).length + 2;
      const [m, x] = this.measure(entries[i][1]);
      if (m + extra > min) {
        min = m + extra;
      }
      max += extra + x;
    }
    return [min, max];
  }
}
