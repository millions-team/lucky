import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  Account,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';

import { Games } from '../target/types/games';
import {
  getGameModePDA,
  getKeeperPDA,
  getStrongholdPDA,
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
  const connection = provider.connection;

  describe('GameMode', () => {
    type GameMode = ReturnType<
      typeof program.account.gameMode.fetch
    > extends Promise<infer T>
      ? T
      : never;
    const { payer: gamesKeypair } = payer;

    describe('Valid Game Settings', () => {
      const VALID_GAMES: GameMode[] = [
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
      const INVALID_GAME: GameMode = {
        slots: 1,
        digits: 1,
        choices: 2,
        winnerChoice: 0, // not allowed when slots == 1
        pickWinner: false,
      };

      VALID_GAMES.forEach((settings, i) => {
        describe(`Game with ${JSON.stringify(settings)}`, () => {
          const secret = Keypair.generate();
          const gamePDA = getGameModePDA(
            gamesKeypair.publicKey,
            secret.publicKey
          );

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
      const INVALID_GAMES: Partial<GameMode & { reason: string }>[] = [
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
          const gamePDA = getGameModePDA(
            gamesKeypair.publicKey,
            secret.publicKey
          );

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

  describe('Treasury', () => {
    let mint: PublicKey;
    let accounts: Record<string, PublicKey>;

    beforeAll(async () => {
      const { payer } = provider.wallet as anchor.Wallet;

      mint = await createMint(
        connection, // conneciton
        payer, // fee payer
        payer.publicKey, // mint authority
        null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        8 // decimals
      );

      const ata = await createAssociatedTokenAccount(
        connection, // connection
        payer, // fee payer
        mint, // mint
        payer.publicKey // owner,
      );

      accounts = {
        keeper: getKeeperPDA(),
        stronghold: getStrongholdPDA(mint),
        supplier: payer.publicKey,
        gem: mint,
      };

      await mintToChecked(
        connection, // connection
        payer, // fee payer
        mint, // mint
        ata, // receiver (should be a token account)
        payer, // mint authority
        1000e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        8 // decimals
      );
    });

    it('Should initialize Keeper & Stronghold', async () => {
      const { payer } = provider.wallet as anchor.Wallet;

      await program.methods
        .forgeStronghold()
        .accounts(accounts)
        .signers([payer])
        .rpc();

      const { keeper, stronghold } = accounts;
      const vaultAccount = await getAccount(connection, stronghold);

      expect(vaultAccount.owner).toEqual(keeper);
      expect(vaultAccount.amount.toString()).toEqual('0');
    });

    describe('Deposit', () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const sender = Keypair.generate();
      let reserve: PublicKey;
      let senderAccount: Account;

      beforeAll(async () => {
        const { address } = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint,
          sender.publicKey
        );

        reserve = address;
        await mintToChecked(connection, payer, mint, reserve, payer, 10e8, 8);
      });

      beforeEach(async () => {
        senderAccount = await getAccount(connection, reserve);
      });

      it('Should store gems', async () => {
        const { stronghold } = accounts;

        const { amount } = senderAccount;
        const vaultBeforeDeposit = await getAccount(connection, stronghold);

        await program.methods
          .stockpileGems(new BN(amount))
          .accounts({
            ...accounts,
            supplier: sender.publicKey,
            reserve,
          })
          .signers([sender])
          .rpc();

        const vaultAccount = await getAccount(connection, stronghold);
        const senderAfterDeposit = await getAccount(connection, reserve);
        expect(vaultAccount.amount).toEqual(vaultBeforeDeposit.amount + amount);
        expect(senderAfterDeposit.amount.toString()).toEqual('0');
      });
    });

    describe('Withdraw', () => {
      let receiver: Keypair;
      let receiverTokenAccount: PublicKey;
      let receiverAccount: Account;

      beforeAll(async () => {
        const { payer } = provider.wallet as anchor.Wallet;
        receiver = Keypair.generate();
        receiverTokenAccount = await createAssociatedTokenAccount(
          connection,
          payer,
          mint,
          receiver.publicKey
        );
      });

      beforeEach(async () => {
        receiverAccount = await getAccount(connection, receiverTokenAccount);
      });

      it('Should withdraw tokens', async () => {
        const { payer } = provider.wallet as anchor.Wallet;
        const { stronghold } = accounts;
        const vaultBeforeWithdraw = await getAccount(connection, stronghold);
        const amount = vaultBeforeWithdraw.amount / BigInt(2);
        expect(amount).toBeGreaterThan(BigInt(0));

        await program.methods
          .retrieveGems(new BN(amount))
          .accounts({
            ...accounts,
            reserve: receiverTokenAccount,
          })
          .signers([payer])
          .rpc();

        const vaultAccount = await getAccount(connection, stronghold);
        const receiverAfterWithdraw = await getAccount(
          connection,
          receiverTokenAccount
        );
        expect(vaultAccount.amount).toEqual(
          vaultBeforeWithdraw.amount - amount
        );
        expect(receiverAfterWithdraw.amount).toEqual(
          receiverAccount.amount + amount
        );
      });

      it('Should fail to withdraw more than the vault has', async () => {
        const { payer } = provider.wallet as anchor.Wallet;
        const { stronghold } = accounts;
        const vaultBeforeWithdraw = await getAccount(connection, stronghold);
        const amount = vaultBeforeWithdraw.amount * BigInt(2);

        try {
          await program.methods
            .retrieveGems(new BN(amount))
            .accounts({
              ...accounts,
              reserve: receiverTokenAccount,
            })
            .signers([payer])
            .rpc();
          fail('Should have failed');
        } catch (err) {
          const vaultAccount = await getAccount(connection, stronghold);
          expect(err.toString()).toContain('custom program error: 0x1');
          expect(vaultAccount.amount).toEqual(vaultBeforeWithdraw.amount);
        }
      });
    });
  });
});
