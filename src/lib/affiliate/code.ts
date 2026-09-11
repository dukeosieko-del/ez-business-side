import { randomBytes } from 'crypto';

export function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * 7) + 6; // 6-12 chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[randomBytes(1)[0] % chars.length];
  }
  return code;
}

export function validateAffiliateCode(code: string): boolean {
  return /^[A-Z0-9]{6,12}$/.test(code);
}