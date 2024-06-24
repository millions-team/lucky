pub use crate::state::game::Game;
use crate::errors::GameErrorCode;
use crate::constants::GAME_SEED;
use anchor_lang::prelude::*;

pub fn update_game(game: &mut Game, name: &[u8; 33]) -> Result<()> {
    game.set_name(&name)?;

    Ok(())
}

pub fn activate_game(game: &mut Game) -> Result<()> {
    game.set_active()?;

    Ok(())
}

pub fn pause_game(game: &mut Game) -> Result<()> {
    game.set_paused()?;

    Ok(())
}

pub fn end_game(game: &mut Game) -> Result<()> {
    game.set_ended();

    Ok(())
}

pub fn delete_game(game: &mut Game) -> Result<()> {
    if !game.ended() {
        return Err(GameErrorCode::GameNotEnded.into());
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateGame<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
    )]
    pub game: Account<'info, Game>,

    /// CHECK: This is the seed to only allow the owner update the game.
    pub secret: AccountInfo<'info>,
}


#[derive(Accounts)]
pub struct CloseGame<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
        close = owner,
    )]
    pub game: Account<'info, Game>,

    /// CHECK: This is the seed to only allow the owner close the game.
    pub secret: AccountInfo<'info>,
    system_program: Program<'info, System>,
}