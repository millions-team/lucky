import { PublicKey } from '@solana/web3.js';

import { useOwnedTokens, useEscrowProgram } from '@/hooks';

export function useTollkeeperTraders({ callback }: { callback?: () => void }) {
  const { tollkeeperPDA } = useEscrowProgram({ callback });
  const { tokens: traders, mints, ..._ } = useOwnedTokens(tollkeeperPDA);

  return {
    owner: tollkeeperPDA,
    traders,
    mints,
    ..._,
    getTrader: (mint: PublicKey) => mints[mint.toString()],
  };
}
