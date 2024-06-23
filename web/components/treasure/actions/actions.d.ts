import type { TokenAccount } from '@/hooks';
import { PublicKey } from '@solana/web3.js';

export type BaseProps = {
  token: TokenAccount;
  player: PublicKey;
};

export type AccountsProps = BaseProps & {
  onEnabled: (v: boolean) => void;
};

export type ActionsProps = BaseProps & {
  balance: number;
  onCompleted?: () => void;
};
