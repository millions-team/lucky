pub use crate::state::bounty::Bounty;
use crate::errors::BountyErrorCode;
use crate::constants::{KEEPER_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

pub fn vault_load(ctx: &Context<VaultLoad>, amount: u64) -> Result<u64> {
    let available = ctx.accounts.vault.amount.clone();
    let transfer_instruction = Transfer {
        from: ctx.accounts.stronghold.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
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

    Ok(available + amount)
}

pub fn gems_issued(bounty: &mut Bounty, amount: u64) -> Result<()> {
    if amount % bounty.reward != 0 { return Err(BountyErrorCode::UncollectibleReward.into()); }
    bounty.currently_issued = amount;

    Ok(())
}

#[derive(Accounts)]
pub struct VaultLoad<'info> {
    /// CHECK: The keeper of the treasure, required to relocate the gems.
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
    pub bounty: Account<'info, Bounty>,
    #[account(
        constraint = gem.key() == bounty.gem @ BountyErrorCode::InvalidGem,
    )]
    gem: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = supplier,
        seeds = [VAULT_SEED, bounty.key().as_ref()],
        bump,
        token::mint = gem,
        token::authority = keeper,
    )]
    vault: Account<'info, TokenAccount>,

    #[account(mut)]
    supplier: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}
