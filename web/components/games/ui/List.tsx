'use client';

import { useGamesProgram } from '../games-data-access';
import { GameCard } from './Card';

export function GamesList() {
  const { games, getProgramAccount } = useGamesProgram();

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
      {games.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : games.data?.length ? (
        <div className="flex flex-wrap justify-around gap-4">
          {games.data?.map(({ publicKey, modes }) => (
            <GameCard
              key={publicKey.toString()}
              pda={publicKey}
              modes={modes}
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
