pub use crate::state::{game_mode::GameMode, bounty::{Bounty, BountySettings}};
use crate::constants::{BOUNTY_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint};

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

    system_program: Program<'info, System>,
}
