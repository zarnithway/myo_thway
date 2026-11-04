export async function hashAdminSlug(slug: string): Promise<string> {
  const clean = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!clean || clean.toLowerCase() === 'admin') {
    return '';
  }

  const message = `umt-route-v1:${clean}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(message);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  return '';
}
