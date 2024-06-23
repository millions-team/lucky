import { PublicKey } from '@solana/web3.js';

import { useTreasureProgram } from '../treasure-data-access';
type CreateProps = {
  mint: PublicKey;
  onCompleted?: () => void;
};

export function Create({ mint, onCompleted }: CreateProps) {
  const { initialize } = useTreasureProgram({ callback: onCompleted });

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => initialize.mutateAsync(mint)}
      disabled={initialize.isPending}
    >
      Create Vault{initialize.isPending && '...'}
    </button>
  );
}
