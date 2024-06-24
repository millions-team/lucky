import { useState } from 'react';

import { useGamesProgram } from '../games-data-access';
import { SettingsForm } from './SettingsForm';

export function GamesCreate() {
  const [create, setCreate] = useState(false);
  const { createGame, createGameMode } = useGamesProgram({
    callback: () => setCreate(false),
  });

  return (
    <div className="flex justify-center items-center">
      {create ? (
        <SettingsForm
          game
          title="Create Game"
          onSubmit={async (settings, name, seed) => {
            if (!name) throw new Error('Name is required');
            const { gamePDA } = await createGame.mutateAsync({ name, seed });
            await createGameMode.mutateAsync({ gamePDA, settings });
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
