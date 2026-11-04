import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('App.tsx parses ?project query parameter and syncs modal state with browser URL', () => {
  const app = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  assert.match(app, /URLSearchParams/i);
  assert.match(app, /history\.replaceState/i);
  assert.match(app, /project/i);
});

test('ProjectModal includes Share Link button with clipboard copy', () => {
  const modal = fs.readFileSync(path.resolve('src/components/ProjectModal.tsx'), 'utf8');
  assert.match(modal, /navigator\.clipboard\.writeText/i);
  assert.match(modal, /Share/i);
  assert.match(modal, /copied/i);
});
