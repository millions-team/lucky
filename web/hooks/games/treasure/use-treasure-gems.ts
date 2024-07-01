import { PublicKey } from '@solana/web3.js';

import { useTreasureProgram } from '@/components/treasure/treasure-data-access';
import { useOwnedTokens } from '@/hooks';

export function useTreasureGems({ callback }: { callback?: () => void }) {
  const { keeperPDA } = useTreasureProgram({ callback });
  const { tokens: gems, mints, ..._ } = useOwnedTokens(keeperPDA);

  return {
    owner: keeperPDA,
    gems,
    mints,
    getGem: (mint: PublicKey) => mints[mint.toString()],
    ..._,
  };
}
