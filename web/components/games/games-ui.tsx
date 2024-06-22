'use client';

import { useState } from 'react';

import { useGamesProgram, useGamesProgramAccount } from './games-data-access';
import { GamesCard, SettingsForm } from './game';

export function GamesCreate() {
  const [create, setCreate] = useState(false);
  const { initialize } = useGamesProgram({
    callback: () => setCreate(false),
  });

  return (
    <div className="flex justify-center items-center">
      {create ? (
        <SettingsForm
          title="Create Game"
          onSubmit={async (settings) => {
            await initialize.mutateAsync(settings);
          }}
          onCancel={() => setCreate(false)}
        />
      ) : (
        <button className="btn btn-primary" onClick={() => setCreate(true)}>
          Create
        </button>
      )}
    </div>
  );
}

export function GamesList() {
  const { accounts, getProgramAccount } = useGamesProgram({});

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <GamesCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}
