pub use crate::state::sale::{Sale, Settings};
use crate::constants::{SALE_SEED, VAULT_SEED, KEEPER_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

pub fn create(ctx: Context<InitializeSale>, settings: Settings) -> Result<()> {
    let amount = settings.amounts.iter().fold(0, |acc, x| acc + x);

    let transfer_instruction = Transfer {
        from: ctx.accounts.reserve.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );

    anchor_spl::token::transfer(cpi_ctx, amount)?;

    ctx.accounts.sale.init(ctx.accounts.authority.key(), ctx.accounts.token.key(), settings)?;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeSale<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [SALE_SEED, token.key().as_ref()],
        bump,
        space = 8 + Sale::INIT_SPACE
    )]
    sale: Account<'info, Sale>,

    #[account(
        init,
        payer = authority,
        seeds = [VAULT_SEED, token.key().as_ref()],
        token::mint = token,
        token::authority = keeper,
        bump
    )]
    vault: Account<'info, TokenAccount>,

    /// CHECK: This is the vault keeper, required to manage the vault.
    #[account(
        seeds = [KEEPER_SEED],
        bump,
    )]
    keeper: AccountInfo<'info>,

    #[account(
        mut,
        token::mint = token
    )]
    reserve: Account<'info, TokenAccount>,

    #[account(mut)]
    authority: Signer<'info>,
    token: Account<'info, Mint>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
