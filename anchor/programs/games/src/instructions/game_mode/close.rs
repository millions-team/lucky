pub use crate::state::game_mode::GameMode;
use crate::constants::{GAME_SEED, GAME_MODE_SEED};
use anchor_lang::prelude::*;
use crate::instructions::Game;

#[derive(Accounts)]
#[instruction(mode_seed: String)]
pub struct CloseGameMode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [GAME_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        seeds = [GAME_MODE_SEED, game.key().as_ref(), mode_seed.as_ref()],
        bump,
        close = owner // close account and return lamports to payer
    )]
    pub mode: Account<'info, GameMode>,

    /// CHECK: This is the seed to only allow the owner close the game mode.
    pub secret: AccountInfo<'info>,
}