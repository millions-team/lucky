import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TinyAdventure } from '../target/types/tiny_adventure';
import { PublicKey } from '@solana/web3.js';

describe('tiny-adventure', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.TinyAdventure as Program<TinyAdventure>;

  const [gameDataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('level1', 'utf8')],
    program.programId
  );


  it('Initialize Adventure', async () => {
    await program.methods
      .initialize()
      .accounts({
        newGameDataAccount: gameDataAccount,
        signer: payer.publicKey
      })
      .signers([payer.payer])
      .rpc();

    const currentPosition = await program.account.gameDataAccount.fetch(gameDataAccount);

    expect(currentPosition.playerPosition).toEqual(0);
  });

  it('Move Right', async () => {
    await program.methods
      .moveRight()
      .accounts({ gameDataAccount })
      .rpc();

    const currentPosition = await program.account.gameDataAccount.fetch(gameDataAccount);

    expect(currentPosition.playerPosition).toEqual(1);
  });

  it('Move Left', async () => {
    await program.methods
      .moveLeft()
      .accounts({ gameDataAccount })
      .rpc();

    const currentPosition = await program.account.gameDataAccount.fetch(gameDataAccount);

    expect(currentPosition.playerPosition).toEqual(0);
  });

  it('Move Right Until End', async () => {
    for (let i = 0; i < 4; i++) {
      await program.methods
        .moveRight()
        .accounts({ gameDataAccount })
        .rpc();
    }

    const currentPosition = await program.account.gameDataAccount.fetch(gameDataAccount);

    expect(currentPosition.playerPosition).toEqual(3);
  });

  it('Move Left Until Start', async () => {
    for (let i = 0; i < 4; i++) {
      await program.methods
        .moveLeft()
        .accounts({ gameDataAccount })
        .rpc();
    }

    const currentPosition = await program.account.gameDataAccount.fetch(gameDataAccount);

    expect(currentPosition.playerPosition).toEqual(0);
  });
});