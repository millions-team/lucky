pub use crate::state::game_mode::GameMode;
use crate::constants::GAME_SEED;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseGameMode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
        close = owner // close account and return lamports to payer
    )]
    pub game: Account<'info, GameMode>,

    /// CHECK: This is the seed to only allow the owner close the game.
    pub secret: AccountInfo<'info>,
}