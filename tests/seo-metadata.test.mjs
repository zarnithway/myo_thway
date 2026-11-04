import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('index.html contains Open Graph, Twitter Cards, and Schema.org JSON-LD', () => {
  const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.match(html, /<meta property="og:title"/i);
  assert.match(html, /<meta property="og:description"/i);
  assert.match(html, /<meta property="og:image"/i);
  assert.match(html, /<meta property="og:url"/i);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /UMT Construction Group/i);
  assert.match(html, /Mandalay/i);
});

test('public/robots.txt and public/sitemap.xml exist and follow crawler rules', () => {
  const robots = fs.readFileSync(path.resolve('public/robots.txt'), 'utf8');
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Disallow:\s*\/admin/i);
  assert.match(robots, /Sitemap:\s*https:\/\/myothway\.netlify\.app\/sitemap\.xml/i);
  assert.doesNotMatch(robots, /umt-portal/i, 'Must not leak secret admin slug');

  const sitemap = fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/myothway\.netlify\.app\/<\/loc>/i);
  assert.doesNotMatch(sitemap, /admin/i);
});
