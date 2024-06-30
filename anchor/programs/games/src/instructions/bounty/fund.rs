pub use crate::state::bounty::Bounty;
use crate::errors::BountyErrorCode;
use crate::constants::{ESCROW_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

pub fn vault_load(ctx: &Context<VaultLoad>, amount: u64) -> Result<u64> {
    let available = ctx.accounts.vault.amount.clone();
    let transfer_instruction = Transfer {
        from: ctx.accounts.reserve.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.supplier.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );

    anchor_spl::token::transfer(cpi_ctx, amount)?;

    Ok(available + amount)
}

pub fn gems_issued(bounty: &mut Bounty, amount: u64) -> Result<()> {
    if amount % bounty.reward != 0 { return Err(BountyErrorCode::UncollectibleReward.into()); }
    bounty.currently_issued = amount;

    Ok(())
}

#[derive(Accounts)]
pub struct VaultLoad<'info> {
    #[account(mut)]
    supplier: Signer<'info>,

    #[account(mut)]
    reserve: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bounty: Account<'info, Bounty>,

    /// CHECK: This is the bounties vault keeper, required to initialize a vault.
    #[account(
        seeds = [ESCROW_SEED],
        bump,
    )]
    escrow: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = supplier,
        seeds = [VAULT_SEED, bounty.key().as_ref()],
        bump,
        token::mint = gem,
        token::authority = escrow,
    )]
    vault: Account<'info, TokenAccount>,

    #[account(
        constraint = gem.key() == bounty.gem @ BountyErrorCode::InvalidGem,
    )]
    gem: Account<'info, Mint>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}
