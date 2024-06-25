use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub gem: Pubkey, // The gem to be claim.
    pub task: Pubkey, // This is the GameMode tied to this Bounty.
    pub price: u64, // Price in merchandise's token. This is the cost to play the game.
    pub reward: u64, // Reward in gems. This is the reward for winning the game.
    pub merchandise: Pubkey, // This is the chainlink data feed to be used for the price.
}

impl Bounty {
    // pub const INIT_SPACE: usize = 32 + 16 + 16 + 32;

    pub fn new(gem: Pubkey, task: Pubkey, price: u64, reward: u64, merchandise: Pubkey) -> Result<Self> {
        let bounty = Self {
            gem,
            task,
            price,
            reward,
            merchandise,
        };

        Ok(bounty)
    }
}