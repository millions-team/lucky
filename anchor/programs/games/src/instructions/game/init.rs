pub use crate::state::game::Game;
use crate::constants::GAME_SEED;
use anchor_lang::prelude::*;

pub fn new_game(game: &mut Game, name: &[u8; 33]) -> Result<()> {
    let _game = Game::new(&name)?;

    game.name = _game.name;
    game.state = _game.state;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [GAME_SEED, owner.key().as_ref(), secret.key().as_ref()],
        bump,
        space = 8 + Game::INIT_SPACE,
        payer = owner
    )]
    pub game: Account<'info, Game>,

    /// CHECK: This is just a seed to allow an owner create different games.
    pub secret: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
