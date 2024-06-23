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

    // ------------------------ TREASURE ------------------------
    pub fn forge_stronghold(_ctx: Context<InitializeTreasure>) -> Result<()> { Ok(()) }

    pub fn stockpile_gems(ctx: Context<Stockpile>, amount: u64) -> Result<()> {
        treasure::stockpile::receive(&ctx, amount)
    }

    pub fn retrieve_gems(ctx: Context<UnlockStronghold>, amount: u64) -> Result<()> {
        treasure::unlock::acquire_loot(&ctx, amount)
    }

    // ------------------------ GAME_MODE ------------------------
    pub fn create_game(ctx: Context<InitializeGameMode>, settings: GameMode) -> Result<()> {
        game_mode::upsert::verify_and_set(&mut ctx.accounts.mode, settings)
    }

    pub fn update_game(ctx: Context<UpdateGameMode>, settings: GameMode) -> Result<()> {
        game_mode::upsert::verify_and_set(&mut ctx.accounts.mode, settings)
    }

    pub fn close_game(_ctx: Context<CloseGameMode>) -> Result<()> { Ok(()) }
}



