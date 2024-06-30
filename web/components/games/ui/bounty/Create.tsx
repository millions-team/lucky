import { GameMode } from '@luckyland/anchor';
import { PublicKey } from '@solana/web3.js';
import { BountyForm } from './Form';
import { useBountyProgram } from '@/hooks';

type CreateBountyProps = {
  task: PublicKey;
  gameMode: GameMode;
  onCompleted?: () => void;
  onCancel?: () => void;
};
export function CreateBounty({
  task,
  onCompleted,
  onCancel,
}: CreateBountyProps) {
  const { create } = useBountyProgram();

  return (
    <BountyForm
      task={task}
      onSubmit={async (bounty) => {
        await create.mutateAsync(bounty);
        onCompleted?.();
      }}
      onCancel={() => onCancel?.()}
    />
  );
}
