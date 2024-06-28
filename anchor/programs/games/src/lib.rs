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

    // ------------------------ GAME ------------------------
    pub fn create_game(ctx: Context<InitializeGame>, name: [u8; 33]) -> Result<()> {
        game::init::new_game(&mut ctx.accounts.game, &name)
    }

    pub fn update_game(ctx: Context<UpdateGame>, name: [u8; 33]) -> Result<()> {
        game::manage::update_game(&mut ctx.accounts.game, &name)
    }

    pub fn activate_game(ctx: Context<UpdateGame>) -> Result<()> {
        game::manage::activate_game(&mut ctx.accounts.game)
    }

    pub fn pause_game(ctx: Context<UpdateGame>) -> Result<()> {
        game::manage::pause_game(&mut ctx.accounts.game)
    }

    pub fn end_game(ctx: Context<UpdateGame>) -> Result<()> {
        game::manage::end_game(&mut ctx.accounts.game)
    }

    pub fn close_game(ctx: Context<CloseGame>) -> Result<()> {
        game::manage::delete_game(&mut ctx.accounts.game)
    }

    // ------------------------ GAME_MODE ------------------------
    pub fn add_game_mode(ctx: Context<InitializeGameMode>, _mode_seed: String, settings: GameMode) -> Result<()> {
        ctx.accounts.mode.game = ctx.accounts.game.key();
        game_mode::upsert::verify_and_set(&mut ctx.accounts.mode, settings)
    }

    pub fn update_game_mode(ctx: Context<UpdateGameMode>, _mode_seed: String, settings: GameMode) -> Result<()> {
        game_mode::upsert::verify_and_set(&mut ctx.accounts.mode, settings)
    }

    pub fn close_game_mode(_ctx: Context<CloseGameMode>, _mode_seed: String) -> Result<()> { Ok(()) }

    // ------------------------ BOUNTY ------------------------
    pub fn issue_bounty(ctx: Context<InitializeBounty>, settings: BountySettings) -> Result<()> {
        ctx.accounts.bounty.owner = ctx.accounts.supplier.key();
        ctx.accounts.bounty.gem = ctx.accounts.gem.key();
        ctx.accounts.bounty.task = ctx.accounts.task.key();
        ctx.accounts.bounty.trader = ctx.accounts.trader.key();

        bounty::publish::new_bounty(&mut ctx.accounts.bounty, settings)
    }

    pub fn fund_bounty(ctx: Context<VaultLoad>, amount: u64) -> Result<()> {
        let available = bounty::fund::vault_load(&ctx, amount)?;
        bounty::fund::gems_issued(&mut ctx.accounts.bounty, available)?;

        Ok(())
    }
}
