import { join } from 'node:path';
import { getToken } from '../../constants';

const {
  name: NAME,
  symbol: SYMBOL,
  decimals: DECIMALS,
  PIECES_PER_TOKEN,
} = getToken('LS');

export { NAME, SYMBOL, DECIMALS, PIECES_PER_TOKEN };
export const TRADES_FOR_SALE = BigInt(1000000000);
export const IDS_BASE_PATH = '~/.config/solana/luckyland';

export enum ID_NAME {
  TRADER = 'trader-id.json',
  PAYER = 'payer-id.json',
  MINTER = 'minter-id.json',
}

export function idPath(name: ID_NAME) {
  return join(IDS_BASE_PATH, name);
}