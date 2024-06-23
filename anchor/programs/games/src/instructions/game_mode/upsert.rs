pub use crate::state::game_mode::GameMode;
use crate::constants::GAME_MODE_SEED;
use anchor_lang::prelude::*;

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
pub struct InitializeGameMode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [GAME_MODE_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
        space = 8 + GameMode::INIT_SPACE,
        payer = owner
    )]
    pub mode: Account<'info, GameMode>,

    /// CHECK: This is just a seed to allow an owner create different games.
    pub secret: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGameMode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_MODE_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
    )]
    pub mode: Account<'info, GameMode>,

    /// CHECK: This is the seed to only allow the owner update the game.
    pub secret: AccountInfo<'info>,
}