import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Lucky } from '../target/types/lucky';

describe('lucky', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Lucky as Program<Lucky>;

  const luckyKeypair = Keypair.generate();

  it('Initialize Lucky', async () => {
    await program.methods
      .initialize()
      .accounts({
        lucky: luckyKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([luckyKeypair])
      .rpc();

    const currentCount = await program.account.lucky.fetch(
      luckyKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment Lucky', async () => {
    await program.methods
      .increment()
      .accounts({ lucky: luckyKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.lucky.fetch(
      luckyKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment Lucky Again', async () => {
    await program.methods
      .increment()
      .accounts({ lucky: luckyKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.lucky.fetch(
      luckyKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement Lucky', async () => {
    await program.methods
      .decrement()
      .accounts({ lucky: luckyKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.lucky.fetch(
      luckyKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set lucky value', async () => {
    await program.methods
      .set(42)
      .accounts({ lucky: luckyKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.lucky.fetch(
      luckyKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the lucky account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        lucky: luckyKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.lucky.fetchNullable(
      luckyKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
