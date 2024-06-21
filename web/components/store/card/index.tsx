import { useState } from 'react';
import type { BaseProps } from './card.d';

import { useStoreProgramAccount } from '../store-data-access';
import { Layout } from './Layout';
import { Store } from './store';
import { Settings } from './settings';

export function StoreCard({ storePda }: BaseProps) {
  const { isOwner } = useStoreProgramAccount({ storePda });
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [{ label: 'Store', content: <Store storePda={storePda} /> }];
  if (isOwner)
    tabs.push({ label: 'Settings', content: <Settings storePda={storePda} /> });

  return (
    <Layout storePda={storePda}>
      <div role="tablist" className="tabs tabs-lifted w-full">
        {tabs.map(({ label, content }, index) => (
          <>
            <a
              key={`tab_${label}`}
              role="tab"
              aria-label={label}
              className={'tab' + (activeTab === index ? ' tab-active' : '')}
              onClick={() => setActiveTab(index)}
            >
              {label}
            </a>

            <div
              key={`content_${label}`}
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6 space-y-6"
            >
              {content}
            </div>
          </>
        ))}
      </div>
    </Layout>
  );
}
