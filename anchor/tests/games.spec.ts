import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Games } from '../target/types/games';
import { DealerOptions, getGamePDA } from '../src';

describe('games', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Games as Program<Games>;
  type GameAccount = ReturnType<
    typeof program.account.game.fetch
  > extends Promise<infer T>
    ? T
    : never;

  const { payer: gamesKeypair } = payer;

  describe('Valid Game Settings', () => {
    const VALID_GAMES: GameAccount[] = [
      { slots: 1, digits: 1, choices: 2, winnerChoice: 1, pickWinner: true },
      {
        slots: 1,
        digits: 8,
        choices: 99999999,
        winnerChoice: 99999999,
        pickWinner: false,
      },
      { slots: 16, digits: 1, choices: 2, winnerChoice: 0, pickWinner: false },
      { slots: 16, digits: 1, choices: 2, winnerChoice: 1, pickWinner: true },
      {
        slots: 16,
        digits: 8,
        choices: 99999999,
        winnerChoice: 0,
        pickWinner: false,
      },
      {
        slots: 16,
        digits: 8,
        choices: 99999999,
        winnerChoice: 99999999,
        pickWinner: true,
      },
    ];

    VALID_GAMES.forEach((settings, i) => {
      describe(`Game with ${JSON.stringify(settings)}`, () => {
        const secret = Keypair.generate();
        const gamePDA = getGamePDA(gamesKeypair.publicKey, secret.publicKey);

        it(`Should initialize the game with the correct settings`, async () => {
          await program.methods
            .initialize(settings)
            .accounts({ secret: secret.publicKey })
            .signers([gamesKeypair])
            .rpc();

          const game = await program.account.game.fetch(gamePDA);

          expect(game.slots).toEqual(settings.slots);
          expect(game.digits).toEqual(settings.digits);
          expect(game.choices).toEqual(settings.choices);
          expect(game.winnerChoice).toEqual(settings.winnerChoice);
          expect(game.pickWinner).toEqual(settings.pickWinner);
        });

        if (i < VALID_GAMES.length - 1)
          it(`Should update the game settings`, async () => {
            const newSettings = VALID_GAMES[i + 1];

            await program.methods
              .update(newSettings)
              .accounts({ secret: secret.publicKey })
              .rpc();

            const game = await program.account.game.fetch(gamePDA);

            expect(game.slots).toEqual(newSettings.slots);
            expect(game.digits).toEqual(newSettings.digits);
            expect(game.choices).toEqual(newSettings.choices);
            expect(game.winnerChoice).toEqual(newSettings.winnerChoice);
            expect(game.pickWinner).toEqual(newSettings.pickWinner);
          });

        it('Should close the game account', async () => {
          await program.methods
            .close()
            .accounts({ secret: secret.publicKey })
            .rpc();

          // The account should no longer exist, returning null.
          const game = await program.account.game.fetchNullable(gamePDA);
          expect(game).toBeNull();
        });
      });
    });
  });

  describe('Invalid Game Settings', () => {
    // Invalid game set tests. The goal is to reach all the branches of the verify function.
    const INVALID_GAMES: Partial<GameAccount>[] = [
      { slots: 0 },
      { slots: 17 },
      { slots: 1, digits: 0 },
      { slots: 1, digits: 9 },
      { slots: 1, digits: 1, choices: 1 },
      { slots: 1, digits: 1, choices: 10 },
      { slots: 1, digits: 8, choices: 100000000 },
      { slots: 1, digits: 1, choices: 2, winnerChoice: 0 },
      { slots: 1, digits: 1, choices: 9, winnerChoice: 10 },
      { slots: 2, digits: 1, choices: 2, winnerChoice: 3 },
      { slots: 1, digits: 8, choices: 99999999, winnerChoice: 100000000 },
      { slots: 2, digits: 1, choices: 2, winnerChoice: -1 },
      { slots: 2, digits: 1, choices: 2, winnerChoice: 0, pickWinner: true },
    ];

    INVALID_GAMES.forEach((settings) => {
      describe(`Invalid game with ${JSON.stringify(settings)}`, () => {
        const secret = Keypair.generate();
        const gamePDA = getGamePDA(gamesKeypair.publicKey, secret.publicKey);

        it(`Should fail to initialize the game with the invalid settings`, async () => {
          await expect(
            program.methods
              .initialize(settings as any)
              .accounts({ secret: secret.publicKey })
              .signers([gamesKeypair])
              .rpc()
          ).rejects.toThrow();
        });
      });
    });
  });
});
