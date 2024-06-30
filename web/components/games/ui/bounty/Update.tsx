import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

import { useBountyAccount } from '@/hooks';

import { BountyForm } from './Form';

type CreateBountyProps = {
  pda: PublicKey;
  onCompleted?: () => void;
  onChange?: (active: boolean) => void;
};

export function UpdateBounty({ pda, onChange }: CreateBountyProps) {
  const { bountyQuery, update } = useBountyAccount({ pda });
  const task = useMemo(
    () => bountyQuery?.data?.task,
    [bountyQuery?.data?.task]
  );

  return (
    task && (
      <BountyForm
        task={task}
        settings={bountyQuery.data}
        onSubmit={async (bounty) => {
          await update.mutateAsync(bounty);
          onChange?.(false);
        }}
        onCancel={() => onChange?.(false)}
      />
    )
  );
}
