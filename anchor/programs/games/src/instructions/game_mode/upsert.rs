pub use crate::state::game_mode::GameMode;
use crate::constants::{GAME_SEED, GAME_MODE_SEED};
use anchor_lang::prelude::*;
use crate::instructions::Game;

pub fn verify_and_set(mode: &mut GameMode, settings: GameMode) -> Result<()> {
    mode.slots = settings.slots.clone();
    mode.digits = settings.digits.clone();
    mode.choices = settings.choices.clone();
    mode.winner_choice = settings.winner_choice.clone();
    mode.pick_winner = settings.pick_winner.clone();
    mode.verify()?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(mode_seed: String)]
pub struct InitializeGameMode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [GAME_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        seeds = [GAME_MODE_SEED, game.key().as_ref(), mode_seed.as_ref()],
        bump,
        space = 8 + GameMode::INIT_SPACE,
        payer = owner
    )]
    pub mode: Account<'info, GameMode>,

    /// CHECK: This is the game seed to only allow an owner create different game modes.
    pub secret: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(mode_seed: String)]
pub struct UpdateGameMode<'info> {
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
    )]
    pub mode: Account<'info, GameMode>,

    /// CHECK: This is the seed to only allow the owner update the game mode.
    pub secret: AccountInfo<'info>,
}