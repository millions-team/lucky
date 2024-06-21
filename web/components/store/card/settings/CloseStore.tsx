import type { BaseProps } from '../card.d';
import { useStoreProgramAccount } from '../../store-data-access';

export function CloseStore({ storePda }: BaseProps) {
  const { close } = useStoreProgramAccount({ storePda });

  return (
    <button
      className="btn btn-xs btn-secondary btn-outline"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return;
        }
        return close.mutateAsync();
      }}
      disabled={close.isPending}
    >
      Close
    </button>
  );
}
