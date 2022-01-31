# Wide-JSON - An alternative JSON formatter.

Wide-JSON is a JSON formatter that prefers to format JSON
objects more compactly by using as much available line width
as possible.

It defaults to a width of 80 columns but can be customized to any
desired target width.

## Example Formatting.

These examples compare JSON.stringify with 2-space indentation, to the
format produced by Wide-JSON.

JSON.stringify:

```json
{
  "a__": {
    "aa_": "aaa",
    "ab_": "aba",
    "ac_": "aca"
  },
  "b__": {
    "ba_": "baa",
    "bb_": "bba",
    "bc_": "bca"
  }
}
```

Wide-JSON:

```json
{ "a__": { "aa_": "aaa", "ab_": "aba", "ac_": "aca" },
  "b__": { "ba_": "baa", "bb_": "bba", "bc_": "bca" } }
```

JSON.stringify:

```json
{
  "a__": [
    "aaa",
    "aba",
    "aca",
    "ada",
    "aea",
    "afa",
    "aga",
    "aha",
    "aia",
    "aja",
    "aka"
  ],
  "b__": [
    "baa",
    "bba",
    "bca",
    "bda",
    "bea",
    "bfa",
    "bga",
    "bha",
    "bia",
    "bja",
    "bka"
  ]
}
```

Wide-JSON:

```json
{ "a__": [ "aaa", "aba", "aca", "ada", "aea", "afa", "aga", "aha", "aia",
           "aja", "aka" ],
  "b__": [ "baa", "bba", "bca", "bda", "bea", "bfa", "bga", "bha", "bia",
           "bja", "bka" ] }
```

## Rules for Compact Layout

Wide-JSON will use the following rules in layout out JSON:

- Maps (Objects) will always include the first property on the
  same line as the opening '{'.
- Subsequent properties will be included on the same line if they
  will fit within the available width.
- If a property will not fit in the available width, it will be
  indented on a new line at the same indentation level as it's sibling
  properties.

- Arrays will always include the first value on the same line as the
  opening '['.
- Subsequent values will the included on the same line if they will fit
  in the available width.
- Additions array values will be "word-wrapped" to subsequent lines with
  the same indentation as the first value of the array.

## Note about maximum line length

*Output files are not guaranteed to fit in the available width.*

- JSON files may have strings longer than the width - they cannot be wrapped.
- The depth of indenting may not allow constraining to a width.
- Wide-JSON attempts to keep maps and arrays constrained to the width,
  but does not currently account for additional characters used to close
  arrays and maps when nested.
