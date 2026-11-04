import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('CivilProject includes optional status property with ProjectPublishStatus type', () => {
  const types = fs.readFileSync(path.resolve('src/types/portfolio.ts'), 'utf8');
  assert.match(types, /export type ProjectPublishStatus\s*=\s*'published'\s*\|\s*'draft'/i);
  assert.match(types, /status\?:\s*ProjectPublishStatus/i);
});

test('ProjectsSection filters out drafts on public portfolio view', () => {
  const section = fs.readFileSync(path.resolve('src/components/ProjectsSection.tsx'), 'utf8');
  assert.match(section, /status\s*!==\s*'draft'/i);
});

test('ProjectsEditor provides draft toggle and defaults new projects to draft', () => {
  const editor = fs.readFileSync(path.resolve('src/components/admin/ProjectsEditor.tsx'), 'utf8');
  assert.match(editor, /status:\s*'draft'/i);
  assert.match(editor, /updateProject\(\s*{\s*status:/i);
});
