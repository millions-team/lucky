import type { Message, MessagesContext } from '@/providers/types.d';

export type AssistantContext = MessagesContext & {
  thread?: string;
  loading: boolean;
  error: boolean;

  ask: (text: string) => Promise<void>;
  retry: () => void;
};

export { Message };
