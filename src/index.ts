export { stringify };

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
    if (this.column === this.indent) {
      return;
    }
    this.chunks.push('\n' + ' '.repeat(this.indent));
    this.column = this.indent;
  }

  emit(s: string): void {
    this.chunks.push(s);
    this.column += s.length;
  }

  outputArray(a: JSONArray): void {
    const [min, max] = this.measureArray(a);

    this.indent += 2;

    if (this.column + min > this.width) {
      this.emit('[');
      this.newline();
    } else {
      this.emit('[ ');
    }

    for (let i = 0; i < a.length; i++) {
      const [min, max] = this.measure(a[i]);
      const trailing = i === a.length - 1 ? ' ]' : ',';
      if (this.column + min + trailing.length > this.width) {
        this.newline();
      } else if (i > 0) {
        this.emit(' ');
      }

      this.output(a[i]);
      this.emit(trailing);
    }

    this.indent -= 2;
  }

  outputMap(v: JSONMap): void {
    const [min, max] = this.measureMap(v);

    this.indent += 2;

    this.emit('{');

    if (this.column + min > this.width) {
      this.newline();
    }

    const entries = Object.entries(v);
    for (let i = 0; i < entries.length; i++) {
      const [min, max] = this.measure(entries[i][1]);
      const trailing = i === entries.length - 1 ? ' }' : ',';
      const keyString = JSON.stringify(entries[i][0]) + ': ';

      if (this.column + keyString.length + min + trailing.length > this.width) {
        this.newline();
      } else {
        this.emit(' ');
      }

      this.emit(keyString);

      // Values always start on same line as key
      const indentSave = this.indent;
      this.indent = this.column;
      this.output(entries[i][1]);
      this.indent = indentSave;

      this.emit(trailing);
    }

    this.indent -= 2;
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
    for (let i = 0; i < entries.length; i++) {
      // Space before is '{ ' or ', '
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
