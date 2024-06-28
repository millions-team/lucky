use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BountySettings {
    pub price: u64,
    pub reward: u64,
}
#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub owner: Pubkey, // This is the bounty creator.
    pub task: Pubkey, // This is the GameMode tied to this Bounty.

    pub gem: Pubkey, // The gem to be claim.
    pub reward: u64, // Reward in gems. This is the reward for winning the game.

    pub trader: Pubkey, // This is the token mint to be charged.
    pub price: u64, // Price in trader's token to be changed for playing the game.

    pub currently_issued: u64, // Total bounties issued. Only when vault is below threshold bounty could be updated.

    pub winners: u32, // Total winners.
    pub total_claimed: u64, // Total gems claimed.
}

impl Bounty {
    // pub const INIT_SPACE: usize = 32 + 16 + 16 + 32;

    pub fn new(owner: Pubkey,
               task: Pubkey,
               gem: Pubkey,
               reward: u64,
               trader: Pubkey,
               price: u64,
               currently_issued: u64,
               winners: u32,
               total_claimed: u64) -> Result<Self> {
        let bounty = Self {
            owner,
            task,
            gem,
            reward,
            trader,
            price,
            currently_issued,
            winners,
            total_claimed,
        };

        Ok(bounty)
    }
}
