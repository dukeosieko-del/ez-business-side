// Encryption helper for integration connection secrets.
// Uses AES-256-GCM via the Web Crypto API (available in Node 19+ and browsers).
// Secrets are stored as "enc:<base64>" blobs — never plaintext.

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes

function getEncryptionKey(): Promise<CryptoKey> {
  const raw = process.env.INTEGRATION_SECRETS_KEY;
  if (!raw) {
    throw new Error('INTEGRATION_SECRETS_KEY is not configured.');
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(raw),
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSecret(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );
  const payload = Buffer.concat([
    Buffer.from(iv),
    Buffer.from(ciphertext),
  ]).toString('base64');
  return `enc:${payload}`;
}

export async function decryptSecret(blob: string): Promise<string> {
  const key = await getEncryptionKey();
  const raw = blob.replace(/^enc:/, '');
  const payload = Buffer.from(raw, 'base64');
  const iv = payload.subarray(0, IV_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}