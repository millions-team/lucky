'use client';

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useTranslations } from 'next-intl';

import type {
  Message,
  Messages,
  MessagesContext,
  MessagesContextHandler,
  MessagesSettings,
} from './messages.d';
import { type GamePalId, useGamePal } from '../game-pal';

const Context = createContext({} as MessagesContext);

function valueOrDefault(
  t: (path: string) => string,
  path: string,
  defaultValue?: string
): string | undefined {
  try {
    const value = t(path);

    if (value.endsWith(path)) return defaultValue;
    return value;
  } catch (e) {
    return defaultValue;
  }
}

export function useMessages(): MessagesContext {
  return useContext(Context);
}

export function useMessagesHandler(
  settings: MessagesSettings = {}
): MessagesContextHandler {
  const { palId, ttl } = settings;
  const context = useMessages();
  const { namespace, setMessages } = context;

  const t = useTranslations(settings.namespace || namespace);
  const { getPal } = useGamePal();
  const pal = useMemo(() => getPal(palId as GamePalId), [palId]);

  const show: MessagesContextHandler['show'] = useCallback(
    (id, values, replace = true) => {
      const path = `messages.${id}`;
      const message: Message = {
        id,
        sender: pal,
        text: t(`${path}.text`, values),
        advice: valueOrDefault(t, `${path}.advice`),
        select: valueOrDefault(t, `${path}.select.title`),
        options: valueOrDefault(t, `${path}.select.options`)?.split(',') || [],
        expire: ttl ? Date.now() + ttl * 1000 : undefined,
      };

      setMessages((prev) => {
        if (replace) return [message];
        return [
          ...prev.filter(({ expire }) => !expire || expire >= Date.now()),
          message,
        ];
      });
    },
    [t, ttl, pal]
  );

  useEffect(() => {
    if (!ttl) return;

    const interval = setInterval(
      () =>
        setMessages((m) =>
          m.filter(({ expire }) => !expire || expire >= Date.now())
        ),
      ttl * 1000
    );

    return () => clearInterval(interval);
  }, [ttl]);

  return { ...context, show };
}

export function Provider({
  children,
  namespace = 'General',
}: PropsWithChildren<{ namespace?: string }>) {
  const [messages, setMessages] = useState<Messages>([]);
  const [loading, setLoading] = useState(false);

  const value = {
    namespace,
    messages,
    setMessages,
    clear: useCallback(() => {
      if (!messages.length) return;
      setMessages([]);
    }, [messages.length]),

    loading,
    setLoading,
  } as MessagesContext;

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
