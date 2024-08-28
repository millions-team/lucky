'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';

export function ActivePresale() {
  const [show, setShow] = useState(true);
  const t = useTranslations('Presale.Active');

  if (!show) return null;
  return (
    <div className="fixed top-16 left-8 right-8 z-20">
      <div role="alert" className="alert alert-info shadow-xl">
        <IconAlertCircle />
        <div className="flex-1">
          <h3 className="font-bold">{t('title')}</h3>
          <div className="text-xs">{t('description')}</div>
        </div>
        <Link href="/buy" className="btn max-sm:btn-sm btn-accent">
          {t('title')}
        </Link>
        <button
          className="max-sm:absolute top-2 right-2 btn btn-circle btn-sm btn-ghost text-xl"
          onClick={() => setShow(false)}
        >
          x
        </button>
      </div>
    </div>
  );
}
