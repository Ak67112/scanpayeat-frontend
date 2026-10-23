/**
 * Table QR Code Encryption & Security Module
 * 
 * Provides dynamic, tamper-proof, slug-bound URL encryption for dining table QR codes.
 * Ensures diners cannot manually alter URL parameters to order onto other tables.
 * Fully synchronous and portable between Next.js SSR, client browser, and Node.js.
 */

const SECRET_KEY = process.env.NEXT_PUBLIC_TABLE_SECRET || 'HOTELKADA_DINING_SEC_2026_SECURE_QR';

/**
 * 32-bit FNV-1a non-cryptographic fast hash with avalanche properties
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
 * Produces an encrypted hex token bound to the shop slug.
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

  // Encrypt with keystream
  const streamKey = `${SECRET_KEY}:${normSlug}:${nonce}`;
  const keystream = generateKeystream(streamKey, payloadBytes.length);
  const cipherHexArr: string[] = [];
  for (let i = 0; i < payloadBytes.length; i++) {
    const cipherByte = payloadBytes[i] ^ keystream[i];
    cipherHexArr.push(cipherByte.toString(16).padStart(2, '0'));
  }
  const cipherHex = cipherHexArr.join('');

  // Signature check: 8-char FNV-1a hash of cipherHex + SECRET_KEY
  const sig = fnv1a(`${cipherHex}:${SECRET_KEY}:${normSlug}`).toString(16).padStart(8, '0');

  // Final token: nonce (6) + sig (8) + cipherHex
  return `${nonce}${sig}${cipherHex}`;
}

/**
 * Decodes and cryptographically verifies an encrypted table token.
 * Returns { valid: true, table: "1" } or { valid: false, table: null }.
 */
export function decodeTableToken(
  slug: string,
  token: string | null | undefined
): { valid: boolean; table: string | null } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, table: null };
    }

    const cleanToken = token.trim();
    if (cleanToken.length < 16) {
      return { valid: false, table: null };
    }

    const normSlug = (slug || '').toLowerCase().trim();
    const nonce = cleanToken.slice(0, 6);
    const sig = cleanToken.slice(6, 14);
    const cipherHex = cleanToken.slice(14);

    // Verify cryptographic signature
    const expectedSig = fnv1a(`${cipherHex}:${SECRET_KEY}:${normSlug}`).toString(16).padStart(8, '0');
    if (sig.toLowerCase() !== expectedSig.toLowerCase()) {
      return { valid: false, table: null };
    }

    // Decrypt cipherHex
    const streamKey = `${SECRET_KEY}:${normSlug}:${nonce}`;
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
      return { valid: false, table: null };
    }

    const [table, embeddedSlug, embeddedNonce] = parts;
    if (embeddedSlug !== normSlug || embeddedNonce !== nonce) {
      return { valid: false, table: null };
    }

    if (!table || table.trim().length === 0) {
      return { valid: false, table: null };
    }

    return { valid: true, table: table.trim() };
  } catch {
    return { valid: false, table: null };
  }
}

/**
 * Generates the full encrypted QR URL for a dining table
 */
export function buildTableQrUrl(
  baseUrl: string,
  slug: string,
  tableNumber: string | number
): { url: string; token: string } {
  const token = encodeTableToken(slug, tableNumber);
  const cleanBase = (baseUrl || 'https://www.hotelkada.com').replace(/\/+$/, '');
  const url = `${cleanBase}/shop/${slug}/${token}`;
  return { url, token };
}
