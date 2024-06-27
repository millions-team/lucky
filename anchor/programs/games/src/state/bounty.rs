use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub task: Pubkey, // This is the GameMode tied to this Bounty.

    pub gem: Pubkey, // The gem to be claim.
    pub reward: u64, // Reward in gems. This is the reward for winning the game.

    pub trader: Pubkey, // This is the token mint to be charged.
    pub price: u64, // Price in trader's token to be changed for playing the game.
}

impl Bounty {
    // pub const INIT_SPACE: usize = 32 + 16 + 16 + 32;

    pub fn new(task: Pubkey, gem: Pubkey, reward: u64, trader: Pubkey, price: u64) -> Result<Self> {
        let bounty = Self {
            task,
            gem,
            reward,
            trader,
            price,
        };

        Ok(bounty)
    }
}
