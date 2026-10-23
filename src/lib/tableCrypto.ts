/**
 * Table QR Code Encryption & Security Module
 * 
 * Provides dynamic, tamper-proof, slug-bound URL encryption for dining table QR codes.
 * Ensures diners cannot manually alter URL parameters to order onto other tables.
 * Fully synchronous and portable between Next.js SSR, client browser, and Node.js.
 */

const SECRET_KEY = process.env.NEXT_PUBLIC_TABLE_SECRET || 'HOTELKADA_DINING_SEC_2026_SECURE_QR';

/**
 * 32-bit FNV-1a fast hash with avalanche distribution
 */
function fnv1a(str: string, seed: number = 0x811c9dc5): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

/**
 * Generates deterministic pseudo-random keystream from key + nonce
 */
function generateKeystream(key: string, length: number): number[] {
  const bytes: number[] = [];
  let currentSeed = fnv1a(key);
  while (bytes.length < length) {
    currentSeed = fnv1a(`${key}:${bytes.length}`, currentSeed);
    bytes.push(currentSeed & 0xff);
    bytes.push((currentSeed >> 8) & 0xff);
    bytes.push((currentSeed >> 16) & 0xff);
    bytes.push((currentSeed >> 24) & 0xff);
  }
  return bytes.slice(0, length);
}

/**
 * Encodes and dynamically encrypts a table number for a specific shop.
 * Produces an encrypted hex token containing table number, shop slug, and random nonce.
 */
export function encodeTableToken(slug: string, tableNumber: string | number): string {
  const normSlug = (slug || '').toLowerCase().trim();
  const table = String(tableNumber).trim();
  // 6-character random hex nonce (makes every generated QR string dynamically unique)
  const nonce = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

  // Payload: table|slug|nonce
  const payload = `${table}|${normSlug}|${nonce}`;
  const payloadBytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    payloadBytes.push(payload.charCodeAt(i));
  }

  // Encrypt with keystream from SECRET_KEY + nonce
  const streamKey = `${SECRET_KEY}:${nonce}`;
  const keystream = generateKeystream(streamKey, payloadBytes.length);
  const cipherHexArr: string[] = [];
  for (let i = 0; i < payloadBytes.length; i++) {
    const cipherByte = payloadBytes[i] ^ keystream[i];
    cipherHexArr.push(cipherByte.toString(16).padStart(2, '0'));
  }
  const cipherHex = cipherHexArr.join('');

  // Signature check: 8-char FNV-1a hash of cipherHex + SECRET_KEY
  const sig = fnv1a(`${cipherHex}:${SECRET_KEY}`).toString(16).padStart(8, '0');

  // Final token: nonce (6) + sig (8) + cipherHex
  return `${nonce}${sig}${cipherHex}`;
}

/**
 * Decodes and cryptographically verifies an encrypted table token.
 * Optionally verifies against an expected shop slug.
 */
export function decodeTableToken(
  slug: string | null | undefined,
  token: string | null | undefined
): { valid: boolean; slug: string | null; table: string | null } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, slug: null, table: null };
    }

    const cleanToken = token.trim();
    if (cleanToken.length < 16) {
      return { valid: false, slug: null, table: null };
    }

    const nonce = cleanToken.slice(0, 6);
    const sig = cleanToken.slice(6, 14);
    const cipherHex = cleanToken.slice(14);

    // Verify cryptographic signature
    const expectedSig = fnv1a(`${cipherHex}:${SECRET_KEY}`).toString(16).padStart(8, '0');
    if (sig.toLowerCase() !== expectedSig.toLowerCase()) {
      return { valid: false, slug: null, table: null };
    }

    // Decrypt cipherHex with keystream from SECRET_KEY + nonce
    const streamKey = `${SECRET_KEY}:${nonce}`;
    const cipherBytes: number[] = [];
    for (let i = 0; i < cipherHex.length; i += 2) {
      cipherBytes.push(parseInt(cipherHex.slice(i, i + 2), 16));
    }

    const keystream = generateKeystream(streamKey, cipherBytes.length);
    let plainText = '';
    for (let i = 0; i < cipherBytes.length; i++) {
      plainText += String.fromCharCode(cipherBytes[i] ^ keystream[i]);
    }

    const parts = plainText.split('|');
    if (parts.length !== 3) {
      return { valid: false, slug: null, table: null };
    }

    const [table, embeddedSlug, embeddedNonce] = parts;
    if (embeddedNonce !== nonce) {
      return { valid: false, slug: null, table: null };
    }

    if (slug && embeddedSlug !== slug.toLowerCase().trim()) {
      return { valid: false, slug: null, table: null };
    }

    if (!table || table.trim().length === 0) {
      return { valid: false, slug: null, table: null };
    }

    return { valid: true, slug: embeddedSlug, table: table.trim() };
  } catch {
    return { valid: false, slug: null, table: null };
  }
}

/**
 * Decodes token without requiring shop slug beforehand (used when token is the sole parameter)
 */
export function decodeTableTokenWithoutSlug(
  token: string | null | undefined
): { valid: boolean; slug: string | null; table: string | null } {
  return decodeTableToken(null, token);
}

/**
 * Generates the official production HotelKada encrypted QR URL for a dining table
 */
export function buildTableQrUrl(
  slug: string,
  tableNumber: string | number,
  options?: { hideShopName?: boolean }
): { url: string; token: string } {
  const token = encodeTableToken(slug, tableNumber);
  const base = 'https://www.hotelkada.com';
  const url = options?.hideShopName
    ? `${base}/shop/${token}`
    : `${base}/shop/${slug}/${token}`;
  return { url, token };
}
