use crate::constants::{KEEPER_SEED, VAULT_SEED, TREASURE_SEED, TREASURE_FORGE_COST};
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::instructions::Treasure;

pub fn pay(ctx: &Context<InitializeTreasure>) -> Result<()> {
    // When the supplier is the treasure authority, it is free to forge.
    if ctx.accounts.treasure.authority.key() == ctx.accounts.supplier.key() { return Ok(()); }

    let lamports = TREASURE_FORGE_COST * LAMPORTS_PER_SOL;

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.supplier.to_account_info(),
            to: ctx.accounts.keeper.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, lamports)?;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeTreasure<'info> {
    /// CHECK: This is the treasure keeper, required to initialize the stronghold. and pay for the forge.
    #[account(
        mut,
        seeds = [KEEPER_SEED],
        bump,
    )]
    keeper: AccountInfo<'info>,

    // Only gems owned by the Treasure could be collected as bounty.
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

    #[account(
        seeds = [TREASURE_SEED],
        bump,
    )]
    treasure: Account<'info, Treasure>,

    #[account(mut)]
    supplier: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}
