# Type-safe AVL trees in TypeScript

Original code: 
https://gist.github.com/matthieubulte/e58dc1a6add5e114de0328f57dd3f460

# Motivation

I was curious if TypeScript's type system is expressive enough to support this 
usage. Also I knew that I will have bugs while translating the code, and wanted
to see if they will be caught by the type checker.

# Observations

- some places needed explcit Same<N>, pointing towards type inference failure.
- without `match` syntax code is more akward. Typing out types and constructors
  separately is a hassle.
- union types in TS can express intermediate unions like NonLeaf<N>,
  which can express t.left without descructuring.
- a bug snuck in. It doesn't have to do with the balancing.
- hard to write randomTree function without dependent types.

# Build & Test
- build - `npm i && tsc -w`
- test - `node_modules/mocha/bin/mocha build/test.js`
