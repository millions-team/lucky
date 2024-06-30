pub use crate::state::{bounty::Bounty, player::Player};
use crate::constants::{PLAYER_SEED, ESCROW_SEED, VAULT_SEED, COLLECTOR_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

pub fn play(player: &mut Player, bounty: &Bounty) -> Result<bool> {
    // TODO: Load game context to play
    //  load `mode` from `bounty.task`
    //  load `game` from `mode.game`
    //  pass `game` and `mode` to `player.play(game, mode)`
    player.play(bounty)
}

#[derive(Accounts)]
pub struct Play<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub bounty: Account<'info, Bounty>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [PLAYER_SEED, owner.key().as_ref()],
        space = 8 + Player::INIT_SPACE,
        bump
    )]
    pub player: Account<'info, Player>, // This account seed must include the game account.

    #[account(
        mut,
        token::mint = bounty.trader
    )]
    pub ammo: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = bounty.gem
    )]
    pub bag: Account<'info, TokenAccount>,

    /// CHECK: This is the vault keeper. Needs to sign to pay the reward.
    #[account(
        mut,
        seeds = [ESCROW_SEED],
        bump
    )]
    pub escrow: AccountInfo<'info>,

    // Rewards are issued from the vault.
    #[account(
        mut,
        seeds = [VAULT_SEED, bounty.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    // To prevent charging an unknown token.
    #[account(
        mut,
        seeds = [COLLECTOR_SEED, bounty.trader.as_ref()],
        bump
    )]
    pub collector: Account<'info, TokenAccount>,

    system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}