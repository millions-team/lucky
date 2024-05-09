import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Dealer } from '../target/types/dealer';
import { getDealerPDA } from '../src';

const Strategy = {
  PseudoRandom: { pseudoRandom: {} },
  Vrf: { vrf: {} },
};
describe('dealer', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Dealer as Program<Dealer>;

  describe('PseudoRandom', () => {
    const { payer } = provider.wallet as anchor.Wallet;
    const dealerKeypair = payer;
    const dealer = getDealerPDA(dealerKeypair.publicKey);

    it('Initialize Dealer with PseudoRandom strategy', async () => {
      await program.methods
        .initialize(Strategy.PseudoRandom)
        .accounts({ dealer })
        .signers([dealerKeypair])
        .rpc();

      const dealerAccount = await program.account.dealer.fetch(dealer);

      expect(dealerAccount.count).toEqual(0);
      // expect(dealerAccount.strategy).toEqual(Strategy.PseudoRandom);
    });

    it('Get value with PseudoRandom strategy', async () => {
      await program.methods.get().accounts({ dealer }).rpc();

      const dealerAccount = await program.account.dealer.fetch(dealer);

      expect(dealerAccount.count).toEqual(1);
      expect(dealerAccount.lastValue.toNumber()).toBeGreaterThan(0);
    });

    it('Close the dealer account', async () => {
      await program.methods
        .close()
        .accounts({
          payer: payer.publicKey,
          dealer,
        })
        .rpc();

      const dealerAccount = await program.account.dealer.fetchNullable(dealer);
      expect(dealerAccount).toBeNull();
    });
  });

  describe('Vrf', () => {
    const { payer } = provider.wallet as anchor.Wallet;
    const dealerKeypair = payer;
    const dealer = getDealerPDA(dealerKeypair.publicKey);

    it('Initialize Dealer with Vrf strategy', async () => {
      await program.methods
        .initialize(Strategy.Vrf)
        .accounts({ dealer })
        .signers([dealerKeypair])
        .rpc();

      const dealerAccount = await program.account.dealer.fetch(dealer);

      expect(dealerAccount.count).toEqual(0);
      // expect(dealerAccount.strategy).toEqual(Strategy.Vrf);
    });

    it('Get value with Vrf strategy', async () => {
      await program.methods.get().accounts({ dealer }).rpc();

      const dealerAccount = await program.account.dealer.fetch(dealer);

      expect(dealerAccount.count).toEqual(1);
      expect(dealerAccount.lastValue.toNumber()).toBeGreaterThan(0);
    });

    it('Close the dealer account', async () => {
      await program.methods
        .close()
        .accounts({
          payer: payer.publicKey,
          dealer,
        })
        .rpc();

      const dealerAccount = await program.account.dealer.fetchNullable(dealer);
      expect(dealerAccount).toBeNull();
    });
  });
});
