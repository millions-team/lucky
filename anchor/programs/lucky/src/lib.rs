#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("26X5wc1gq84wsjKSgWLfoVfgurRQkuoDaDSdunzQ6txV");

pub fn is_owner(ctx: &Context<Update>) -> Result<()> {
    if ctx.accounts.lucky.owner != ctx.accounts.payer.key() {
        msg!("Unauthorized");
        return Err(ProgramError::Custom(0).into()); // 0 is the error code;
    }
    Ok(())
}

#[program]
pub mod lucky {
    use super::*;

    pub fn initialize(ctx: Context<InitializeLucky>) -> Result<()> {
        ctx.accounts.lucky.owner = ctx.accounts.payer.key();
        Ok(())
    }

    pub fn close(ctx: Context<CloseLucky>) -> Result<()> {
        if ctx.accounts.lucky.owner != ctx.accounts.payer.key() {
            msg!("Unauthorized");
            return Err(ProgramError::Custom(0).into()); // 0 is the error code;
        }
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        is_owner(&ctx)?;
        ctx.accounts.lucky.count = ctx.accounts.lucky.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        is_owner(&ctx)?;
        ctx.accounts.lucky.count = ctx.accounts.lucky.count.checked_add(1).unwrap();
        Ok(())
    }


    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        is_owner(&ctx)?;
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
    #[account(signer)]
    pub payer: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Lucky {
    count: u8,
    owner: Pubkey,
}