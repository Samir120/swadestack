import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-character random string. Set in .env.');
  }
  return Buffer.from(key, 'utf8');
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encrypted: string): string {
  const key = getEncryptionKey();
  const [ivHex, encryptedHex] = encrypted.split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
