use crate::constants::KEEPER_SEED;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: This is the vault keeper, required to manage the vault.
    #[account(
        init,
        payer = authority,
        seeds = [KEEPER_SEED],
        bump,
        space = 8 + 1
    )]
    keeper: AccountInfo<'info>,

    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}