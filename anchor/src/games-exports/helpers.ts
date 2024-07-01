import { BN } from '@coral-xyz/anchor';
import { GAME_NAME_LEN } from './constants';

export function encodeName(name: string) {
  const buffer = new TextEncoder().encode(name);
  const MAX_LEN = GAME_NAME_LEN - 1;
  return Array.from({ length: GAME_NAME_LEN }, (_, i) =>
    i === MAX_LEN ? 0 : buffer[i] ?? 0
  );
}

export function decodeName(name: number[]) {
  return new TextDecoder().decode(Uint8Array.from(name));
}

export function toBigInt(value: number, decimals = 0) {
  if (isNaN(value)) return BigInt(0);
  if (isNaN(decimals) || decimals === 0) return BigInt(value);
  if (decimals < 0) throw new Error('Decimals must be a positive number');

  if (value < 1) return BigInt(value * 10 ** decimals);
  return BigInt(value) * BigInt(10 ** decimals);
}

export function toBN(value: number, decimals = 0) {
  return new BN(toBigInt(value, decimals).toString());
}

export function fromBigInt(value?: bigint, decimals = 0) {
  if (!value) return 0;
  if (isNaN(decimals) || decimals === 0) return Number(value);
  if (decimals < 0) throw new Error('Decimals must be a positive number');

  return Number(value) / 10 ** decimals;
}

export function fromBN(value?: BN, decimals = 0) {
  if (!value) return 0;
  return fromBigInt(BigInt(value.toString()), decimals);
}

export function formatAmount(value?: number | bigint) {
  if (!value) return '0';
  return Intl.NumberFormat('en-US').format(value);
}
