import { Token } from '@utils/token';

export interface TokenAccount extends Token {
  address: string;
  amount: number;
  balance: bigint;
}
