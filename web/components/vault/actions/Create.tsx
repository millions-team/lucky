import { PublicKey } from '@solana/web3.js';

import { useVaultProgram } from '../vault-data-access';
type CreateProps = {
  mint: PublicKey;
  onCompleted?: () => void;
};

export function Create({ mint, onCompleted }: CreateProps) {
  const { initialize } = useVaultProgram({ callback: onCompleted });

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
