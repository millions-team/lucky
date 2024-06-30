pub use crate::state::treasure::Treasure;
use crate::constants::{KEEPER_SEED, ESCROW_SEED, TREASURE_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct BuildTreasure<'info> {
    /// CHECK: This is the treasure keeper, required to manage a stronghold.
    #[account(
        init,
        payer = authority,
        seeds = [KEEPER_SEED],
        bump,
        space = 8 + 1
    )]
    keeper: AccountInfo<'info>,

    /// CHECK: This is the bounties vault keeper, required to manage a vault.
    #[account(
        init,
        payer = authority,
        seeds = [ESCROW_SEED],
        bump,
        space = 8 + 1
    )]
    escrow: AccountInfo<'info>,

    /// CHECK: This is the main treasure account. It will contain all the main program settings.
    #[account(
        init,
        payer = authority,
        seeds = [TREASURE_SEED],
        bump,
        space = 8 + Treasure::INIT_SPACE,
    )]
    pub treasure: Account<'info, Treasure>,

    #[account(mut)]
    pub authority: Signer<'info>,
    system_program: Program<'info, System>,
}
