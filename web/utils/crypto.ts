import * as crypto from 'crypto';

const { NEXT_PUBLIC_BAG_PASSWORD = 'Unsaf3-$Lucky-p@ss' } = process.env;

function splitEncryptedText(encryptedText: string) {
  return {
    ivString: encryptedText.slice(0, 32),
    encryptedDataString: encryptedText.slice(32),
  };
}
export class Crypto {
  encoding: BufferEncoding = 'hex';
  private readonly key: string; // 32 bytes

  constructor(key: string = NEXT_PUBLIC_BAG_PASSWORD) {
    this.key = crypto
      .createHash('sha256')
      .update(String(key))
      .digest('base64')
      .slice(0, 32);
  }

  encrypt(plaintext: string) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);

      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf-8'),
        cipher.final(),
      ]);

      return iv.toString(this.encoding) + encrypted.toString(this.encoding);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  decrypt(cipherText: string) {
    const { encryptedDataString, ivString } = splitEncryptedText(cipherText);

    try {
      const iv = Buffer.from(ivString, this.encoding);
      const encryptedText = Buffer.from(encryptedDataString, this.encoding);

      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);

      const decrypted = decipher.update(encryptedText);
      return Buffer.concat([decrypted, decipher.final()]).toString();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
