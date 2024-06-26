import { join } from 'node:path';

export const NAME = 'LuckyLand';
export const SYMBOL = 'L';
export const DECIMALS = 8;
export const PIECES_PER_GEM = BigInt(10 ** DECIMALS);

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
