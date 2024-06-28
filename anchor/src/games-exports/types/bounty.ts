import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export type Bounty = {
  /*
   * The GameMode that the bounty is associated with
   **/
  task: PublicKey;

  /*
   * The gem that is being offered as a reward
   **/
  gem: PublicKey;
  reward: BN;

  /*
   * The token that needs to be pay to play for the bounty.
   **/
  trader: PublicKey;
  price: BN;
};
