'use client';
import { useState } from 'react';

import {
  type ChatMessages,
  Selector,
  ChatController,
  asLink,
} from '@/ui/messages';
import { Assistant } from '@/ui';

const MESSAGES = {
  welcome: {
    Actions: Selector({
      actions: [
        '_close',
        asLink('tokenomics'),
        asLink('roadmap'),
        {
          label: 'Assistant',
          next: 'assistant',
          className: 'btn btn-ghost btn-xs',
        },
      ],
    }),
  },
  assistant: { Actions: () => <Assistant scope="presale" /> },
} as ChatMessages;

export function SaleChat() {
  const [active, setActive] = useState<string | undefined>('welcome');

  return (
    <ChatController
      active={active}
      setActive={setActive}
      messages={MESSAGES}
      settings={{
        minimized: true,
        typing: 10,
        namespace: 'Presale',
        palId: 'lucky',
        backdrop: ' ',
      }}
    />
  );
}
