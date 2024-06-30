use crate::instructions::Play;
use anchor_lang::prelude::*;
use anchor_spl::token::{Transfer};

pub fn payment(ctx: &Context<Play>) -> Result<()> {
    let amount = ctx.accounts.bounty.price.clone();

    let transfer_instruction = Transfer {
        from: ctx.accounts.ammo.to_account_info(),
        to: ctx.accounts.collector.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );

    anchor_spl::token::transfer(cpi_ctx, amount)?;

    Ok(())
}