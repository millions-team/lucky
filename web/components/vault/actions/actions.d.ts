import { Token } from '@/hooks';
import { PublicKey } from '@solana/web3.js';

export type BaseProps = {
  token: Token;
  player: PublicKey;
};

export type AccountsProps = BaseProps & {
  onEnabled: (v: boolean) => void;
};

export type ActionsProps = BaseProps & {
  balance: number;
  onCompleted?: () => void;
};
