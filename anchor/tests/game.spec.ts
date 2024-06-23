import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';

import { Games } from '../target/types/games';
import { encodeName, getGamePDA } from '../src/games-exports';

const Status = {
  Created: { created: {} },
  Active: { active: {} },
  Paused: { paused: {} },
  Ended: { ended: {} },
};
describe('Game', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Games as Program<Games>;

  type Game = ReturnType<typeof program.account.game.fetch> extends Promise<
    infer T
  >
    ? T
    : never;
  const { payer: gamesKeypair } = payer;

  describe('Valid Settings', () => {
    const secret = Keypair.generate();
    const gamePDA = getGamePDA(gamesKeypair.publicKey, secret.publicKey);

    it(`Should initialize the game`, async () => {
      const name = encodeName('Valid Game Name');

      await program.methods
        .createGame(name)
        .accounts({ secret: secret.publicKey })
        .signers([gamesKeypair])
        .rpc();

      const game = await program.account.game.fetch(gamePDA);

      expect(game.name).toEqual(name);
      expect(game.state).toEqual(Status.Created);
    });

    it(`Should activate the game`, async () => {
      const gameBeforeUpdate = await program.account.game.fetch(gamePDA);
      expect(gameBeforeUpdate.state).not.toEqual(Status.Active);

      await program.methods
        .activateGame()
        .accounts({ secret: secret.publicKey })
        .rpc();

      const game = await program.account.game.fetch(gamePDA);

      expect(game.state).toEqual(Status.Active);
    });

    it(`Should pause the game`, async () => {
      const gameBeforeUpdate = await program.account.game.fetch(gamePDA);
      expect(gameBeforeUpdate.state).not.toEqual(Status.Paused);

      await program.methods
        .pauseGame()
        .accounts({ secret: secret.publicKey })
        .rpc();

      const game = await program.account.game.fetch(gamePDA);

      expect(game.state).toEqual(Status.Paused);
    });

    it(`Should end the game`, async () => {
      const gameBeforeUpdate = await program.account.game.fetch(gamePDA);
      expect(gameBeforeUpdate.state).not.toEqual(Status.Ended);

      await program.methods
        .endGame()
        .accounts({ secret: secret.publicKey })
        .rpc();

      const game = await program.account.game.fetch(gamePDA);

      expect(game.state).toEqual(Status.Ended);
    });
  });

  describe('Invalid Settings', () => {
    // Invalid game set tests. The goal is to reach all the branches of the verify function.
    const INVALID_GAMES: Partial<Game & { reason: string }>[] = [
      { name: encodeName('a'.repeat(2)), reason: 'name too short' },
      {
        name: Array.from({ length: 33 }).map((_, i) => i + 1),
        reason: 'name too long',
      },
    ];

    INVALID_GAMES.forEach(({ reason, name }) => {
      describe(reason, () => {
        const secret = Keypair.generate();

        it(`Should fail to initialize the game`, async () => {
          await expect(
            program.methods
              .createGame(name)
              .accounts({ secret: secret.publicKey })
              .signers([gamesKeypair])
              .rpc()
          ).rejects.toThrow();
        });
      });
    });
  });
});
