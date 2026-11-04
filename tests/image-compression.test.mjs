import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('cmsService exports compressImageToWebpFile and connects it to uploadMediaFile', () => {
  const code = fs.readFileSync(path.resolve('src/lib/cmsService.ts'), 'utf8');
  assert.match(code, /export async function compressImageToWebpFile/i);
  assert.match(code, /image\/webp/i);
  assert.match(code, /maxDimension\s*=\s*1920/i);
  assert.match(code, /compressImageToWebpFile\(file\)/i);
});
