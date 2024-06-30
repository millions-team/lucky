pub use crate::state::{bounty::{Bounty, BountySettings}};
use crate::errors::BountyErrorCode;
use crate::constants::{RENEW_THRESHOLD, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};

pub fn existent_bounty(bounty: &mut Bounty, settings: BountySettings) -> Result<()> {
    bounty.price = settings.price.clone();
    bounty.reward = settings.reward.clone();

    Ok(())
}

#[derive(Accounts)]
pub struct RenewBounty<'info> {
    #[account(mut)]
    pub supplier: Signer<'info>,

    #[account(
        mut,
        constraint = bounty.owner == supplier.key() @ BountyErrorCode::InvalidOwner,
    )]
    pub bounty: Account<'info, Bounty>,

    #[account(
        seeds = [VAULT_SEED, bounty.key().as_ref()],
        constraint = vault.amount * RENEW_THRESHOLD <= bounty.currently_issued @ BountyErrorCode::ThresholdNotReached,
        bump,
    )]
    vault: Account<'info, TokenAccount>,
    system_program: Program<'info, System>,
}
