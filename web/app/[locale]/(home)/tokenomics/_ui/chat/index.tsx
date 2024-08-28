'use client';
import { useState } from 'react';

import { type ChatMessages, Selector, ChatController } from '@/ui/messages';
import { Assistant } from '@/ui';

const MESSAGES = {
  welcome: {
    Actions: Selector({
      actions: [
        'supply',
        'distribution',
        'use',
        'faq',
        {
          label: 'Assistant',
          next: 'assistant',
          className: 'btn btn-ghost btn-xs',
        },
      ],
    }),
  },
  assistant: { Actions: () => <Assistant scope="tokenomics" /> },
} as ChatMessages;

export function TokenomicsChat() {
  const [active, setActive] = useState<string | undefined>('welcome');

  return (
    <ChatController
      active={active}
      setActive={setActive}
      messages={MESSAGES}
      settings={{
        minimized: true,
        typing: 10,
        namespace: 'Tokenomics',
        palId: 'lucky',
        backdrop: ' ',
        className: 'z-50',
      }}
    />
  );
}
