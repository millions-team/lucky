import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconSquareRoundedCheckFilled } from '@tabler/icons-react';

import { useLuckyWallet } from '@/providers';

export function Generate({
  onChange,
}: {
  onChange: (confirmed: boolean) => void;
}) {
  const t = useTranslations('Components.Bag.Generate');
  const { wallet, activate } = useLuckyWallet();
  const loading = useMemo(() => !wallet, [wallet]);
  const [confirmed, setConfirmed] = useState(!loading);

  useEffect(() => {
    if (!loading) return onChange(true);

    const debounced = setTimeout(() => {
      const luckyWallet = activate();

      setTimeout(() => {
        const confirmed = Boolean(luckyWallet);
        setConfirmed(confirmed);
      }, 500);
    }, 1000);

    return () => clearTimeout(debounced);
  }, [activate]);

  return (
    <>
      <h1 className="modal-title text-center text-2xl sm:text-3xl">
        {t(loading ? 'loading' : 'success')}
      </h1>
      {confirmed ? (
        <IconSquareRoundedCheckFilled
          className="w-full text-success mt-8"
          size={128}
        />
      ) : (
        <span
          className={`loading loading-ring w-full ${
            loading ? '' : 'animate-scale-down'
          }`}
        />
      )}
    </>
  );
}
