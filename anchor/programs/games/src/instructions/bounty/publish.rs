pub use crate::state::{game_mode::GameMode, bounty::{Bounty, BountySettings}};
use crate::constants::{BOUNTY_SEED, VAULT_SEED, COLLECTOR_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

pub fn new_bounty(bounty: &mut Bounty, settings: BountySettings) -> Result<()> {
    bounty.price = settings.price.clone();
    bounty.reward = settings.reward.clone();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeBounty<'info> {
    #[account(mut)]
    pub supplier: Signer<'info>,

    #[account(
        init,
        payer = supplier,
        seeds = [BOUNTY_SEED, task.key().as_ref(), gem.key().as_ref(), trader.key().as_ref()],
        bump,
        space = 8 + Bounty::INIT_SPACE
    )]
    pub bounty: Account<'info, Bounty>,

    pub task: Account<'info, GameMode>,
    pub gem: Account<'info, Mint>,
    pub trader: Account<'info, Mint>,

    // To prevent a bounty from an unknown gem.
    #[account(
        seeds = [VAULT_SEED, gem.key().as_ref()],
        token::mint = gem,
        bump
    )]
    stronghold: Account<'info, TokenAccount>,

    // To prevent charging an unknown token.
    #[account(
        seeds = [COLLECTOR_SEED, trader.key().as_ref()],
        token::mint = trader,
        bump
    )]
    collector: Account<'info, TokenAccount>,

    system_program: Program<'info, System>,
}
