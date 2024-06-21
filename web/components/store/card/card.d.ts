import { PublicKey } from '@solana/web3.js';

export type BaseProps = { storePda: PublicKey };

export type AccountsProps = BaseProps & {
  onEnabled: (v: boolean) => void;
};

export type ActionsProps = BaseProps & {
  balance: number;
  onCompleted?: () => void;
};
