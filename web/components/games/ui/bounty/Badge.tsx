import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  IconAlertTriangle,
  IconCoins,
  IconDeviceGamepad2,
  IconDotsVertical,
  IconTransform,
  IconTrophy,
} from '@tabler/icons-react';

import { fromBN, formatAmount, fromBigInt } from '@luckyland/anchor';
import { useBountyAccount, useTreasureGems } from '@/hooks';

import { UpdateBounty } from './Update';
import { FundBounty } from './Fund';

export function Badge({ pda }: { pda: PublicKey }) {
  const { mints } = useTreasureGems({});
  const { bountyQuery, vaultQuery, isOwner } = useBountyAccount({ pda });
  const [updating, setUpdating] = useState(false);

  const { gem, trader } = useMemo(() => {
    if (!bountyQuery?.data) return {};
    const gem = mints[bountyQuery.data.gem.toString()];
    const trader = mints[bountyQuery.data.trader.toString()];

    return { gem, trader };
  }, [mints, bountyQuery?.data]);

  const reward = useMemo(
    () =>
      gem && bountyQuery?.data?.reward
        ? formatAmount(fromBN(bountyQuery.data.reward, gem.decimals))
        : 0,
    [bountyQuery?.data?.reward, gem]
  );
  const price = useMemo(
    () =>
      trader && bountyQuery?.data?.price
        ? fromBN(bountyQuery.data.price, trader.decimals)
        : 0,
    [bountyQuery?.data?.price, trader]
  );
  const vaultMissed = !vaultQuery.isPending && !vaultQuery.data?.amount;

  const vaultAmount = useMemo(() => {
    if (!vaultQuery.data?.amount || !gem) return '0';
    return `${formatAmount(
      fromBigInt(vaultQuery.data.amount, gem.decimals)
    )} $${gem.symbol}`;
  }, [vaultQuery.data, gem]);

  return updating && isOwner ? (
    <UpdateBounty pda={pda} onChange={(active) => setUpdating(active)} />
  ) : (
    <div
      className={`badge badge-outline h-auto uppercase py-4 text-xl group ${
        vaultQuery.isPending
          ? 'badge-secondary'
          : vaultMissed
          ? 'badge-error'
          : 'badge-primary'
      }`}
    >
      {vaultQuery.isLoading ? (
        <span className="loading loading-ring loading-xs"></span>
      ) : (
        <>
          <span className="tooltip tooltip-primary" data-tip={vaultAmount}>
            <IconTrophy />
          </span>
          <div className="space-x-2 mx-2 flex max-md:flex-col items-center justify-center">
            <span
              className="cursor-default tooltip tooltip-accent"
              data-tip={gem?.name}
            >
              {reward}
            </span>

            {vaultMissed ? (
              <IconAlertTriangle />
            ) : (
              <div className="tooltip tooltip-info" data-tip="Play">
                <span className="swap swap-rotate group-hover:swap-active">
                  <div className="btn btn-sm btn-circle swap-off">
                    <IconTransform size={20} />
                  </div>
                  <div className="btn btn-sm btn-circle btn-outline btn-info swap-on">
                    <IconDeviceGamepad2 size={20} />
                  </div>
                </span>
              </div>
            )}

            <span
              className="cursor-default tooltip tooltip-accent"
              data-tip={trader?.name}
            >
              {price}
            </span>
          </div>
          <IconCoins />
          {isOwner &&
            (vaultMissed ? (
              <FundBounty pda={pda} />
            ) : (
              <button
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => setUpdating(true)}
              >
                <div
                  className="tooltip tooltip-primary"
                  data-tip="Update Bounty"
                >
                  <IconDotsVertical />
                </div>
              </button>
            ))}
        </>
      )}
    </div>
  );
}
