'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconRefresh, IconSend } from '@tabler/icons-react';

import { useAssistant } from '@/providers';

export function UserQuestion() {
  const t = useTranslations('Components.Common');
  const { ask, loading, error, retry } = useAssistant();
  const [text, setText] = useState('');

  return (
    <form
      className="form-control space-y-1"
      action={async (formData) => {
        const text = formData.get('q') as string;
        if (!text) return;

        await ask(text);
        setText('');
      }}
      onReset={retry}
    >
      <textarea
        name="q"
        className="textarea textarea-info w-full"
        disabled={loading || error}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('input.question')}
      />
      <button
        type={error ? 'reset' : 'submit'}
        className={`btn btn-sm ${error ? 'btn-error' : 'btn-primary'}`}
        disabled={loading}
      >
        {t(`action.${error ? 'retry' : 'ask'}`)}
        {error ? <IconRefresh /> : <IconSend />}
      </button>
    </form>
  );
}
