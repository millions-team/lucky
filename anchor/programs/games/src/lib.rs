#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("74arRDDazQJzSQRhm7VonhyhRnNrwBGZE4dyhNva5z8p");

#[program]
pub mod games {
    use super::*;

    pub fn create_game(ctx: Context<InitializeGameMode>, settings: GameMode) -> Result<()> {
        game_mode::upsert::verify_and_set(&mut ctx.accounts.mode, settings)?;
        Ok(())
    }

    pub fn update_game(ctx: Context<UpdateGameMode>, settings: GameMode) -> Result<()> {
        // TODO: Name is not being updated.
        game_mode::upsert::verify_and_set(&mut ctx.accounts.mode, settings)?;
        Ok(())
    }

    pub fn close_game(_ctx: Context<CloseGameMode>) -> Result<()> { Ok(()) }
}



