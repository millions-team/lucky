pub use crate::state::sale::{Sale, Settings, Decimal};
use crate::constants::{SALE_SEED, VAULT_SEED, KEEPER_SEED};
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

pub fn purchase(ctx: Context<StagePurchase>, amount: u64) -> Result<()> {
    ctx.accounts.sale.sold += amount;
    let price = ctx.accounts.sale.get_price(Decimal::new(amount, u32::from(ctx.accounts.token.decimals)))?;

    // Charge the buyer
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.sale.to_account_info(),
        },
    );

    system_program::transfer(cpi_context, price)?;

    // Transfer the tokens to the buyer
    let transfer_instruction = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.receiver.to_account_info(),
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
pub struct StagePurchase<'info> {
    #[account(
        mut,
        seeds = [SALE_SEED, token.key().as_ref()],
        bump,
    )]
    sale: Account<'info, Sale>,

    #[account(
        mut,
        seeds = [VAULT_SEED, token.key().as_ref()],
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
        init_if_needed,
        payer = buyer,
        seeds = [VAULT_SEED, token.key().as_ref(), buyer.key().as_ref()],
        token::mint = token,
        token::authority = buyer,
        bump
    )]
    receiver: Account<'info, TokenAccount>,

    #[account(mut)]
    buyer: Signer<'info>,
    token: Account<'info, Mint>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
