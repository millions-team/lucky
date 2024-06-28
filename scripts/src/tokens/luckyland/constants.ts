import { join } from 'node:path';
import { getToken } from '../../constants';

const {
  name: NAME,
  symbol: SYMBOL,
  decimals: DECIMALS,
  PIECES_PER_TOKEN: PIECES_PER_GEM,
} = getToken('L');

export { NAME, SYMBOL, DECIMALS, PIECES_PER_GEM };
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
