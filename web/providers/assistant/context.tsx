'use client';

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react';
import { atomWithStorage } from 'jotai/utils';
import { atom, useAtomValue, useSetAtom } from 'jotai/index';

import type { AssistantContext, Message } from './assistant.d';
import { Provider as MessagesProvider } from '../messages/context';

import { useMessages } from '@/providers';
import {
  type AssistantScope,
  createThread,
  askAssistant,
  loadThread,
} from '@/actions/assistant';
import { useTranslations } from 'next-intl';

const threadAtom = atomWithStorage<string | undefined>(
  'll-assistant-thread',
  undefined,
  undefined,
  {
    getOnInit: true,
  }
);
const activeThreadAtom = atom<string | undefined>((get) => get(threadAtom));

const Context = createContext({} as AssistantContext);

export type AssistantContextProps = PropsWithChildren<{
  scope: AssistantScope;
}>;
function Provider({ scope, children }: AssistantContextProps) {
  const thread = useAtomValue(activeThreadAtom);
  const setThread = useSetAtom(threadAtom);

  const messagesContext = useMessages();
  const t = useTranslations(messagesContext.namespace);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [question, setQuestion] = useState<string>();

  useEffect(() => {
    if (loading || !question || !thread) return;
    setLoading(true);
    setQuestion(undefined);

    askAssistant(question, thread, scope).then((reply) => {
      messagesContext.setMessages((prev) => [...prev, reply]);

      setLoading(false);
    });
  }, [loading, question, thread]);

  useEffect(() => {
    if (thread && !error) {
      if (messagesContext.messages.length) return;

      setLoading(true);
      loadThread(thread, { limit: 10 }).then((messages) => {
        if (!messages.length)
          messages = [
            {
              id: `t_0`,
              type: 'answer',
              text: t('hello'),
            } as Message,
          ];

        messagesContext.setMessages(messages.reverse());
        setLoading(false);
      });

      return;
    }

    setLoading(true);
    createThread()
      .then((thread) => {
        setLoading(false);
        setThread(thread);
        setError(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
        messagesContext.setMessages([
          {
            id: `t_0`,
            type: 'answer',
            text: t('error'),
          } as Message,
        ]);
      });
  }, [thread, error]);

  const value = {
    ...messagesContext,

    thread,
    loading,
    error,

    ask: useCallback(
      async (text: string) => {
        messagesContext.setMessages((prev) => [
          ...prev,
          {
            id: `q_${prev.length}`,
            type: 'question',
            text,
          } as Message,
        ]);

        setQuestion(text);
      },
      [messagesContext.setMessages]
    ),
    retry: () => {
      messagesContext.setMessages([]);
      setError(false);
    },
  } as AssistantContext;

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function AssistantProvider({
  children,
  ...props
}: AssistantContextProps) {
  return (
    <MessagesProvider namespace="Components.Assistant">
      <Provider {...props}>{children}</Provider>
    </MessagesProvider>
  );
}

export function useAssistant() {
  return useContext(Context);
}
