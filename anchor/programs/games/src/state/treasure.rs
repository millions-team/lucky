use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Treasure {
    pub authority: Pubkey, // This is the treasure keeper & escrow initializer.
}

impl Treasure {
    pub fn new(authority: Pubkey) -> Self {
        Treasure {
            authority,
        }
    }
}
