import { useTreasureProgram } from '@/components/treasure/treasure-data-access';
import { useOwnedTokens } from '@/hooks';

export function useTreasureGems({ callback }: { callback?: () => void }) {
  const { keeperPDA } = useTreasureProgram({ callback });
  return useOwnedTokens(keeperPDA);
}
