import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const external = [
  '@cvplus/core',
  '@cvplus/auth',
  '@anthropic-ai/sdk',
  'firebase',
  'firebase-admin',
  'firebase-functions',
  'firebase-functions/v2/https',
  'react',
  'react-dom',
  'lodash',
  'pdf-lib',
  'pdfkit',
  'canvas',
  'sharp',
  '@types/node',
  // Node.js built-ins
  'fs', 'path', 'util', 'stream', 'crypto', 'http', 'https', 'os', 'url', 'querystring'
];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    json(),
    resolve({
      preferBuiltins: true,
      exportConditions: ['node']
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false, // We already build declarations with tsc
      declarationMap: false,
      sourceMap: true
    })
  ],
  external
};