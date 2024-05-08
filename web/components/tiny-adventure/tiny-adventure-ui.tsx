'use client';


import { globalLevel1GameDataAccount, useGameData, useTinyAdventureProgram } from './tiny-adventure-data-access';
import { PublicKey } from '@solana/web3.js';

export function TinyAdventureCreate({ account }: { account: PublicKey }) {
  const { initialize } = useTinyAdventureProgram();

  return (
    <button
      className="btn lg:btn-wide btn-primary"
      onClick={() => initialize.mutateAsync(account)}
      disabled={initialize.isPending}
    >
      Initialize{initialize.isPending && '...'}
    </button>
  );
}

export function TinyAdventureProgram({ account }: { account: PublicKey }) {
  const { getProgramAccount } = useTinyAdventureProgram();

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
  return <GameData account={account} />;
}

export function GameData({ account }: { account: PublicKey }) {
  const {
    playerPosition,
    message,
    gameData,
    moveLeft,
    moveRight
  } = useGameData({ account: globalLevel1GameDataAccount });

  return (
    <div className="flex justify-center items-center w-full p-20">
      <div className="flex flex-col justify-center text-center gap-4">
        <h1 className="text-2xl font-bold">{message}</h1>
        <h1 className="text-6xl font-bold">{playerPosition}</h1>
        <div className="flex justify-around gap-4">
          <button className="btn btn-primary" onClick={() => moveLeft.mutateAsync()}>
            Move Left
          </button>
          <button className="btn btn-primary" onClick={() => gameData.refetch()}>
            Get Data
          </button>
          <button className="btn btn-primary" onClick={() => moveRight.mutateAsync()}>
            Move Right
          </button>
        </div>
      </div>
    </div>
  );
}
