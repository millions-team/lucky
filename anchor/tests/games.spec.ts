import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';

import { Games } from '../target/types/games';
import {
  getGamePDA,
  MAX_DIGITS,
  MAX_SLOTS,
  MIN_CHOICES,
  MIN_DIGITS,
  MIN_SLOTS,
} from '../src/games-exports';

describe('games', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Games as Program<Games>;
  type GameAccount = ReturnType<
    typeof program.account.gameMode.fetch
  > extends Promise<infer T>
    ? T
    : never;

  const { payer: gamesKeypair } = payer;

  describe('Valid Game Settings', () => {
    const VALID_GAMES: GameAccount[] = [
      {
        slots: 1,
        digits: 1,
        choices: 2,
        winnerChoice: 1,
        pickWinner: true,
      },
      {
        slots: 1,
        digits: 8,
        choices: 99999999,
        winnerChoice: 99999999,
        pickWinner: false,
      },
      {
        slots: 16,
        digits: 1,
        choices: 2,
        winnerChoice: 0,
        pickWinner: false,
      },
      {
        slots: 16,
        digits: 1,
        choices: 2,
        winnerChoice: 1,
        pickWinner: true,
      },
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
    const INVALID_GAME: GameAccount = {
      slots: 1,
      digits: 1,
      choices: 2,
      winnerChoice: 0, // not allowed when slots == 1
      pickWinner: false,
    };

    VALID_GAMES.forEach((settings, i) => {
      describe(`Game with ${JSON.stringify(settings)}`, () => {
        const secret = Keypair.generate();
        const gamePDA = getGamePDA(gamesKeypair.publicKey, secret.publicKey);

        it(`Should initialize the game with the correct settings`, async () => {
          await program.methods
            .createGame(settings)
            .accounts({ secret: secret.publicKey })
            .signers([gamesKeypair])
            .rpc();

          const game = await program.account.gameMode.fetch(gamePDA);

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
              .updateGame(newSettings)
              .accounts({ secret: secret.publicKey })
              .rpc();

            const game = await program.account.gameMode.fetch(gamePDA);

            expect(game.slots).toEqual(newSettings.slots);
            expect(game.digits).toEqual(newSettings.digits);
            expect(game.choices).toEqual(newSettings.choices);
            expect(game.winnerChoice).toEqual(newSettings.winnerChoice);
            expect(game.pickWinner).toEqual(newSettings.pickWinner);
          });
        else
          it(`Should fail to update the game settings`, async () => {
            await expect(
              program.methods
                .updateGame(INVALID_GAME)
                .accounts({ secret: secret.publicKey })
                .rpc()
            ).rejects.toThrow();
          });

        it('Should close the game account', async () => {
          await program.methods
            .closeGame()
            .accounts({ secret: secret.publicKey })
            .rpc();

          // The account should no longer exist, returning null.
          const game = await program.account.gameMode.fetchNullable(gamePDA);
          expect(game).toBeNull();
        });
      });
    });
  });

  describe('Invalid Game Settings', () => {
    // Invalid game set tests. The goal is to reach all the branches of the verify function.
    const INVALID_GAMES: Partial<GameAccount & { reason: string }>[] = [
      {
        slots: 0,
        digits: 1,
        choices: 2,
        winnerChoice: 1,
        pickWinner: false,
        reason: `Slots < ${MIN_SLOTS}`,
      },
      {
        slots: 17,
        digits: 1,
        choices: 2,
        winnerChoice: 1,
        pickWinner: false,
        reason: `Slots > ${MAX_SLOTS}`,
      },
      {
        slots: 1,
        digits: 0,
        choices: 2,
        winnerChoice: 1,
        pickWinner: false,
        reason: `Digits < ${MIN_DIGITS}`,
      },
      {
        slots: 1,
        digits: 9,
        choices: 2,
        winnerChoice: 1,
        pickWinner: false,
        reason: `Digits > ${MAX_DIGITS}`,
      },
      {
        slots: 1,
        digits: 1,
        choices: 1,
        winnerChoice: 1,
        pickWinner: false,
        reason: `Choices < ${MIN_CHOICES}`,
      },
      {
        slots: 1,
        digits: 1,
        choices: 10,
        winnerChoice: 1,
        pickWinner: false,
        reason: `Choices > (10 ^ digits) - 1`,
      },
      {
        slots: 1,
        digits: 8,
        choices: 100000000,
        winnerChoice: 1,
        pickWinner: false,
        reason: 'Choices > (10 ^ digits) - 1',
      },
      {
        slots: 1,
        digits: 1,
        choices: 2,
        winnerChoice: 0,
        pickWinner: false,
        reason: 'Winner choice 0 on single slot game',
      },
      {
        slots: 1,
        digits: 1,
        choices: 9,
        winnerChoice: 10,
        pickWinner: false,
        reason: 'Winner choice > choices',
      },
      {
        slots: 2,
        digits: 1,
        choices: 2,
        winnerChoice: 3,
        pickWinner: false,
        reason: 'Winner choice > choices',
      },
      {
        slots: 1,
        digits: 8,
        choices: 99999999,
        winnerChoice: 100000000,
        pickWinner: false,
        reason: 'Winner choice > choices',
      },
      {
        slots: 2,
        digits: 1,
        choices: 2,
        winnerChoice: -1,
        pickWinner: false,
        reason: 'Winner choice < 0',
      },
      {
        slots: 2,
        digits: 1,
        choices: 2,
        winnerChoice: 0,
        pickWinner: true,
        reason: 'Pick winner true on winner choice 0',
      },
    ];

    INVALID_GAMES.forEach(({ reason, ...settings }) => {
      describe(`Invalid game with ${reason}`, () => {
        const secret = Keypair.generate();
        const gamePDA = getGamePDA(gamesKeypair.publicKey, secret.publicKey);

        it(`Should fail to initialize the game with the invalid settings`, async () => {
          await expect(
            program.methods
              .createGame(settings as any)
              .accounts({ secret: secret.publicKey })
              .signers([gamesKeypair])
              .rpc()
          ).rejects.toThrow();
        });
      });
    });
  });
});
