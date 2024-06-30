use crate::constants::{ESCROW_SEED, COLLECTOR_SEED, TREASURE_SEED, TRADER_LAUNCH_COST};
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::instructions::Treasure;

pub fn pay_definition(ctx: &Context<LaunchEscrow>) -> Result<()> {
    // When the supplier is the treasure authority, it is free to launch.
    if ctx.accounts.treasure.authority.key() == ctx.accounts.supplier.key() { return Ok(()); }

    let lamports = TRADER_LAUNCH_COST * LAMPORTS_PER_SOL;

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.supplier.to_account_info(),
            to: ctx.accounts.escrow.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, lamports)?;

    Ok(())
}

#[derive(Accounts)]
pub struct LaunchEscrow<'info> {
    /// CHECK: This is the treasure escrow, required to initialize the collector. and pay for the launch.
    #[account(
        mut,
        seeds = [ESCROW_SEED],
        bump,
    )]
    escrow: AccountInfo<'info>,

    // Only traders owned by the escrow could be collected as payment.
    #[account(
        init,
        payer = supplier,
        seeds = [COLLECTOR_SEED, trader.key().as_ref()],
        token::mint = trader,
        token::authority = escrow,
        bump
    )]
    collector: Account<'info, TokenAccount>,

    trader: Account<'info, Mint>,

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
