import { join } from 'node:path';
export * from '@/app/ipfs/coin/constants';

export const GEMS_TO_STOCKPILE = BigInt(300000000);
export const IDS_BASE_PATH = '~/.config/solana/luckyland';

export enum ID_NAME {
  GEM = 'gem-id.json',
  PAYER = 'payer-id.json',
  MINTER = 'minter-id.json',
  SUPPLIER = 'supplier-id.json',
}

export function idPath(name: ID_NAME) {
  return join(IDS_BASE_PATH, name);
}
