use crate::constants::{KEEPER_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

pub fn acquire_loot(ctx: &Context<UnlockStronghold>, amount: u64) -> Result<()> {
    // Below is the actual instruction that we are going to send to the Token program.
    let transfer_instruction = Transfer {
        from: ctx.accounts.stronghold.to_account_info(),
        to: ctx.accounts.reserve.to_account_info(),
        authority: ctx.accounts.keeper.to_account_info(),
    };

    let bump = ctx.bumps.keeper;
    let seeds = &[KEEPER_SEED.as_ref(), &[bump]];
    let signer = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        signer,
    );

    anchor_spl::token::transfer(cpi_ctx, amount)?;

    Ok(())
}

#[derive(Accounts)]
pub struct UnlockStronghold<'info> {
    /// CHECK: The keeper of the treasure, required to unlock the stronghold.
    #[account(
        mut,
        seeds = [KEEPER_SEED],
        bump,
    )]
    keeper: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, gem.key().as_ref()],
        bump,
        token::mint = gem,
        token::authority = keeper,
    )]
    stronghold: Account<'info, TokenAccount>,

    #[account(mut)]
    reserve: Account<'info, TokenAccount>,
    gem: Account<'info, Mint>,

    #[account(mut)]
    supplier: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}