import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  type Lucky,
  type DealerOptions,
  getLuckyPlayerPDA,
  getLuckyBountyPDA,
  getLuckyVaultPDA,
  MIN,
  MAX,
} from '../src/lucky-exports';

const Strategy = {
  PseudoRandom: { pseudoRandom: {} },
  Vrf: { vrf: {} },
};

describe('lucky', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Lucky as Program<Lucky>;
  type PlayerAccount = ReturnType<
    typeof program.account.lucky.fetch
  > extends Promise<infer T>
    ? T
    : never;

  describe('Account Management', () => {
    const { payer: player } = provider.wallet as anchor.Wallet;
    const playerPDA = getLuckyPlayerPDA(player.publicKey);
    const accounts = {
      payer: player.publicKey,
      player: playerPDA,
    };

    describe('PseudoRandom', () => {
      it('Should initialize a PseudoRandom lucky player account', async () => {
        await program.methods
          .initialize()
          .accounts(accounts)
          .signers([player])
          .rpc();

        const luckyAccount = await program.account.lucky.fetch(playerPDA);

        expect(luckyAccount.count).toEqual(0);
        expect(luckyAccount.lastValue).toEqual(0);
        expect(luckyAccount.winningCount).toEqual(0);
        expect(luckyAccount.winner).toEqual(false);
        expect(luckyAccount.strategy).toEqual(Strategy.PseudoRandom);
      });

      it('Should close a PseudoRandom lucky player account', async () => {
        await program.methods
          .close()
          .accounts(accounts)
          .signers([player])
          .rpc();

        // The account should no longer exist, returning null.
        const luckyAccount = await program.account.lucky.fetchNullable(
          playerPDA
        );
        expect(luckyAccount).toBeNull();
      });
    });
  });

  describe('Gameplay', () => {
    const bounty = getLuckyBountyPDA();
    const vault = getLuckyVaultPDA();
    const VALID_GAME_OPTIONS: DealerOptions[] = [
      { slots: 1, choices: 25, luckyShoot: false },
      { slots: 2, choices: 12, luckyShoot: false },
      { slots: 2, choices: 12, luckyShoot: true },
      { slots: 3, choices: 8, luckyShoot: false },
      { slots: 3, choices: 8, luckyShoot: true },
      { slots: 6, choices: 4, luckyShoot: false },
      { slots: 6, choices: 4, luckyShoot: true },
    ];

    describe('PsuedoRandom', () => {
      // TODO: Generate a new KeyPair for this describe block
      const { payer: player } = provider.wallet as anchor.Wallet;
      const playerPDA = getLuckyPlayerPDA(player.publicKey);
      const gameAccounts = {
        payer: player.publicKey,
        player: playerPDA,
        bounty,
        vault,
      };
      let playerAccount: PlayerAccount;

      beforeAll(async () => {
        // TODO: Airdrop when is a new KeyPair
        // await provider.connection.requestAirdrop(
        //   player.publicKey,
        //   LAMPORTS_PER_SOL
        // );
        await program.methods
          .initialize()
          .accounts(gameAccounts)
          .signers([player])
          .rpc();
      });

      beforeEach(async () => {
        playerAccount = await program.account.lucky.fetch(playerPDA);
      });

      VALID_GAME_OPTIONS.map((options, i) =>
        it(`Should play a valid game ${JSON.stringify(options)}`, async () => {
          const { count: prevCount, lastValue: prevValue } = playerAccount;

          await program.methods
            .play(options)
            .accounts(gameAccounts)
            .signers([player])
            .rpc();

          const { count, lastValue } = await program.account.lucky.fetch(
            playerPDA
          );
          expect(count).toEqual(prevCount + 1);
          expect(lastValue).not.toEqual(prevValue);
          expect(lastValue).toBeGreaterThan(MIN);
          expect(lastValue).toBeLessThanOrEqual(MAX);
        })
      );

      afterAll(() =>
        program.methods.close().accounts(gameAccounts).signers([player]).rpc()
      );
    });
  });
});
