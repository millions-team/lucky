use crate::instructions::Play;
use crate::constants::{ESCROW_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Transfer};

pub fn reward(ctx: &Context<Play>) -> Result<()> {
    let amount = ctx.accounts.bounty.reward.clone();

    let transfer_instruction = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.bag.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };

    let bump = ctx.bumps.escrow;
    let seeds = &[ESCROW_SEED.as_ref(), &[bump]];
    let signer = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        signer,
    );

    anchor_spl::token::transfer(cpi_ctx, amount)?;

    Ok(())
}