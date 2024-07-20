use crate::state::store::Store;
use crate::errors::StoreErrorCode;
use crate::constants::{COLLECTOR_SEED};
use crate::instructions::sale::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

pub fn first_trade(ctx: &Context<StoreInitSale>, amount: u64) -> Result<()> {
    let sale = Sale {
        tollkeeper: ctx.accounts.tollkeeper.clone(),
        bump: ctx.bumps.tollkeeper,
        collector: ctx.accounts.collector.clone(),
        trader: ctx.accounts.trader.clone(),
        store: ctx.accounts.store.clone(),
        payer: ctx.accounts.payer.clone(),
        receiver: ctx.accounts.receiver.clone(),
        feed: ctx.accounts.feed.clone(),
        chainlink_program: ctx.accounts.chainlink_program.clone(),
        system_program: ctx.accounts.system_program.clone(),
        token_program: ctx.accounts.token_program.clone(),
    };

    sale.charge(amount)?;
    sale.transfer(amount)?;

    Ok(())
}

#[derive(Accounts)]
pub struct StoreInitSale<'info> {
    /// CHECK: This is the collector keeper, Needs to sign for transfer.
    #[account(
        seeds = [COLLECTOR_SEED],
        bump,
    )]
    tollkeeper: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [COLLECTOR_SEED, trader.key().as_ref()],
        bump
    )]
    collector: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        token::mint = trader,
        token::authority = payer,
        token::token_program = token_program,
    )]
    receiver: Account<'info, TokenAccount>,

    /// CHECK: This is the chainlink feed account, to get the latest price rate.
    #[account(
        constraint = feed.key() == store.feed @ StoreErrorCode::InvalidFeed,
    )]
    feed: AccountInfo<'info>,
    /// CHECK: This is the Chainlink program library
    chainlink_program: AccountInfo<'info>,
    #[account(
        constraint = trader.key() == store.trader @ StoreErrorCode::InvalidTrader,
    )]
    trader: Account<'info, Mint>,

    #[account(mut)]
    store: Account<'info, Store>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}