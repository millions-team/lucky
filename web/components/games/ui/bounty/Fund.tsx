import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

import { useBountyAccount } from '@/hooks';

export function FundBounty({ pda }: { pda: PublicKey }) {
  const { bountyQuery, vaultQuery, fund } = useBountyAccount({ pda });
  const vaultMissed = !vaultQuery.isPending && !vaultQuery.data;
  if (!vaultMissed || !bountyQuery.data) return null;

  return (
    <button
      className="btn btn-xs btn-primary mx-2"
      onClick={() => {
        const amount = bountyQuery.data.reward.mul(new BN(10));
        fund.mutate(amount);
      }}
    >
      Fund
    </button>
  );
}
