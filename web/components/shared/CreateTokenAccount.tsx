import { PublicKey } from '@solana/web3.js';
import { useCreateTokenAccount } from '@/hooks';

type CreateTokenAccountProps = {
  mint: PublicKey;
  onChange?: (success: boolean) => void;
};
export function CreateTokenAccount({
  mint,
  onChange,
}: CreateTokenAccountProps) {
  const create = useCreateTokenAccount({
    mint,
    callback: () => onChange?.(true),
  });

  return (
    <div className="card max-w-md bg-base-100 my-8 border-2 border-accent">
      <div className="card-body">
        <h2 className="card-title">No Token Account</h2>
        <p>
          You need to create an account for this token before you can interact
          with the vault.
        </p>

        <div className="card-actions justify-end mt-8">
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                return await create.mutateAsync();
              } catch (e) {
                onChange?.(false);
              }
            }}
          >
            Create Token Account
          </button>
        </div>
      </div>
    </div>
  );
}
