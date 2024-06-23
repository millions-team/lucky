use crate::constants::{KEEPER_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

pub fn receive(ctx: &Context<Stockpile>, amount: u64) -> Result<()> {
    let transfer_instruction = Transfer {
        from: ctx.accounts.reserve.to_account_info(),
        to: ctx.accounts.stronghold.to_account_info(),
        authority: ctx.accounts.supplier.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );

    anchor_spl::token::transfer(cpi_ctx, amount)?;

    Ok(())
}


#[derive(Accounts)]
pub struct Stockpile<'info> {
    /// CHECK: The keeper of the treasure, required to stockpile.
    #[account(
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