import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('cmsService allows raw photo pre-compression size up to 25MB and checks post-compression limit', () => {
  const code = fs.readFileSync(path.resolve('src/lib/cmsService.ts'), 'utf8');
  assert.match(code, /25\s*\*\s*1024\s*\*\s*1024/i, 'Must allow up to 25MB raw file before compression');
  assert.match(code, /fileToUpload\.size\s*>\s*10\s*\*\s*1024\s*\*\s*1024/i, 'Must enforce 10MB limit on compressed file');
});

test('compressImageToWebpFile wraps image decoding and canvas processing in try/catch', () => {
  const code = fs.readFileSync(path.resolve('src/lib/cmsService.ts'), 'utf8');
  const match = code.match(/img\.onload\s*=\s*\(\)\s*=>\s*\{([\s\S]*?)\n\s*img\.onerror/);
  assert.ok(match, 'img.onload must be defined');
  assert.match(match[1], /try\s*\{/, 'img.onload must contain try/catch block');
});

test('App.tsx updates currently open project with fresh Supabase portfolio data on load', () => {
  const code = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  assert.match(
    code,
    /loadPortfolioData\(\)[\s\S]*?setSelectedProject\(\(current\)\s*=>[\s\S]*?data\.projects\.find/i,
    'App.tsx must refresh current project when fresh portfolio data loads'
  );
});
