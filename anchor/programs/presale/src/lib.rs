#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("uXyqdxGC3btcfYEUt8j4Z7g65jKdxiGKiYjjB5eLand");

#[program]
pub mod presale {
    use super::*;

    pub fn init(_ctx: Context<Initialize>) -> Result<()> { Ok(())}
    pub fn init_sale(ctx: Context<InitializeSale>, settings: Settings) -> Result<()> {
        sale::handle::create(ctx, settings)
    }

    pub fn purchase(ctx: Context<StagePurchase>, amount: u64) -> Result<()> {
        sale::stage::purchase(ctx, amount)
    }
}