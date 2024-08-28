'use client';

import { useTranslations } from 'next-intl';
import { Sale } from '@/app/[locale]/(home)/buy/_ui/sale';
import { useMessages } from '@/providers';

export default function Presale() {
  const { messages } = useMessages();
  const t = useTranslations('Presale');

  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${
        messages.length ? '' : 'modal-open'
      }`}
    >
      <div className="modal-box bg-base-300 glass">
        <h1 className="text-5xl text-center mt-2">{t('title')}</h1>
        <Sale />
      </div>
    </dialog>
  );
}
