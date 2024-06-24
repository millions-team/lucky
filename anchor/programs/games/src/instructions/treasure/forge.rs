use crate::constants::{KEEPER_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct InitializeTreasure<'info> {
    /// CHECK: This is the treasure keeper, required to initialize the vault.
    #[account(
        init_if_needed,
        payer = supplier,
        seeds = [KEEPER_SEED],
        bump,
        space = 8 + 1
    )]
    keeper: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = supplier,
        seeds = [VAULT_SEED, gem.key().as_ref()],
        token::mint = gem,
        token::authority = keeper,
        bump
    )]
    stronghold: Account<'info, TokenAccount>,

    gem: Account<'info, Mint>,

    #[account(mut)]
    supplier: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}
