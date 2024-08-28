import { AssistantMessages } from './Chat';
import { UserQuestion } from './UserQuestion';

import { AssistantProvider } from '@/providers';
import type { AssistantScope } from '@/actions/assistant';

type AssistantProps = {
  scope: AssistantScope;
};
export function Assistant({ scope }: AssistantProps) {
  return (
    <AssistantProvider scope={scope}>
      <div className="flex flex-col max-h-[60vh] p-2">
        <AssistantMessages />
        <UserQuestion />
      </div>
    </AssistantProvider>
  );
}
