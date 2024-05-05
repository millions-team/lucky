#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("79UvKxp3h9Dci5cHVRagBcxB2GzSUkdqQRFYBAhzA3NY");

#[program]
pub mod lucky {
    use super::*;

  pub fn close(_ctx: Context<CloseLucky>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.lucky.count = ctx.accounts.lucky.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.lucky.count = ctx.accounts.lucky.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeLucky>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.lucky.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeLucky<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Lucky::INIT_SPACE,
  payer = payer
  )]
  pub lucky: Account<'info, Lucky>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseLucky<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub lucky: Account<'info, Lucky>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub lucky: Account<'info, Lucky>,
}

#[account]
#[derive(InitSpace)]
pub struct Lucky {
  count: u8,
}
