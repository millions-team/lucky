import { Keypair, PublicKey } from '@solana/web3.js';

import type { EncryptedBag, LuckyBag } from './LuckyWallet.d';
import { Crypto } from '@/utils';
import { Buffer } from 'buffer';

export const getKey = (luckyKey: PublicKey | string) =>
  typeof luckyKey === 'string' ? luckyKey : luckyKey.toString();

export const encryptBag = (bag: LuckyBag, crypto: Crypto): EncryptedBag => {
  const { name, kp } = bag;
  const _ = JSON.stringify({
    name,
    kp: Buffer.from(kp.secretKey).toString('base64'),
  });
  return crypto.encrypt(_);
};

export const decryptBag = (encrypted: string, crypto: Crypto): LuckyBag => {
  const _ = crypto.decrypt(encrypted);
  const { name, kp } = JSON.parse(_);
  return { name, kp: Keypair.fromSecretKey(Buffer.from(kp, 'base64')) };
};
