#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("74arRDDazQJzSQRhm7VonhyhRnNrwBGZE4dyhNva5z8p");

const GAME_SEED: &[u8] = b"GAME_CONFIG";

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub name: [u8; 32],      // The name of the game. Max 32 characters.

    pub slots: u8,          // Number of slots in the game.
    // 1 <= slots <= 16.

    pub digits: u8,         // Number of digits per slot. Each slot would have the same number of digits.
    // 1 <= digits <= 8.

    pub choices: u32,        // Number of choices per slot.
    // 2 <= choices <= max value of digits.
    // Example: digits = 3; 2 <= choices <= 999.

    pub winner_choice: u32,  // The winning choice.
    // w == 0; requires slots >= 2; means all slots must be the same.
    // slots == 1; requires 1 <= w <= choices.
    // slots >= 2 & 1 <= w <= choices; means the winning choice is the same in all slots.

    pub pick_winner: bool,   // If true, the player can pick the winner on each round.
    // w == 0; this is always false.
    // if true, winner_choice is ignored.
    // if false, winner_choice is used to determine the winner.
    // if true but winner_choice for the round is 0, the winner_choice is used as default winner.
}

#[error_code]
pub enum GameSettingsErrorCode {
    #[msg("Name must be between 3 and 32 characters")]
    InvalidName,

    #[msg("Slots must be between 1 and 16")]
    InvalidSlots,

    #[msg("Digits must be between 1 and 8")]
    InvalidDigits,

    #[msg("Choices must be between 2 and max value of digits")]
    InvalidChoices,

    #[msg("Winner choice must be between 1 and choices")]
    InvalidWinnerSingleChoice,

    #[msg("Winner choice must be between 0 and choices")]
    InvalidWinnerChoice,

    #[msg("Pick winner is true but winner choice is 0")]
    InvalidPickWinner,
}

impl Game {
    pub fn new(name: [u8; 32], slots: u8, digits: u8, choices: u32, winner_choice: u32, pick_winner: bool) -> Self {
        Self {
            name,
            slots,
            digits,
            choices,
            winner_choice,
            pick_winner,
        }
    }

    fn verify_game_name(name: &[u8; 32]) -> Result<()> {
        // verify the first 3 characters are not 0
        if !(name[0] != 0 && name[1] != 0 && name[2] != 0) { return Err(GameSettingsErrorCode::InvalidName.into()); }
        Ok(())
    }

    fn verify_game_slots(slots: u8) -> Result<()> {
        if slots < 1 || slots > 16 { return Err(GameSettingsErrorCode::InvalidSlots.into()); }
        Ok(())
    }

    fn verify_game_digits(digits: u8) -> Result<()> {
        if digits < 1 || digits > 8 { return Err(GameSettingsErrorCode::InvalidDigits.into()); }
        Ok(())
    }

    fn verify_game_choices(choices: u32, digits: u8) -> Result<()> {
        let max_choices = 10u32.pow(digits as u32) - 1;
        if choices < 2 || choices > max_choices { return Err(GameSettingsErrorCode::InvalidChoices.into()); }
        Ok(())
    }

    fn verify_game_winner_choice(winner_choice: u32, slots: u8, choices: u32) -> Result<()> {
        if slots == 1 {
            if winner_choice < 1 || winner_choice > choices { return Err(GameSettingsErrorCode::InvalidWinnerSingleChoice.into()); }
        } else {
            if winner_choice > choices { return Err(GameSettingsErrorCode::InvalidWinnerChoice.into()); }
        }
        Ok(())
    }

    fn verify_game_pick_winner(pick_winner: bool, winner_choice: u32) -> Result<()> {
        if pick_winner && winner_choice == 0 { return Err(GameSettingsErrorCode::InvalidPickWinner.into()); }
        Ok(())
    }

    fn verify(game: Game) -> Result<()> {
        Game::verify_game_name(&game.name)?;
        Game::verify_game_slots(game.slots)?;
        Game::verify_game_digits(game.digits)?;
        Game::verify_game_choices(game.choices, game.digits)?;
        Game::verify_game_winner_choice(game.winner_choice, game.slots, game.choices)?;
        Game::verify_game_pick_winner(game.pick_winner, game.winner_choice)?;

        Ok(())
    }
}

fn verify_and_update_game(game: &mut Game, settings: Game) -> Result<()> {
    game.name = settings.name.clone(); // CHECK: This is not being updated. it works correct on initialize.
    game.slots = settings.slots.clone();
    game.digits = settings.digits.clone();
    game.choices = settings.choices.clone();
    game.winner_choice = settings.winner_choice.clone();
    game.pick_winner = settings.pick_winner.clone();

    Game::verify(settings)?;
    Ok(())
}

#[program]
pub mod games {
    use super::*;

    pub fn create_game(ctx: Context<InitializeGame>, settings: Game) -> Result<()> {
        verify_and_update_game(&mut ctx.accounts.game, settings)?;
        Ok(())
    }

    pub fn update_game(ctx: Context<UpdateGame>, settings: Game) -> Result<()> {
        // TODO: Name is not being updated.
        verify_and_update_game(&mut ctx.accounts.game, settings)?;
        Ok(())
    }

    pub fn close_game(_ctx: Context<CloseGame>) -> Result<()> { Ok(()) }
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

    /// CHECK: This is just a seed to allow an owner created different games.
    pub secret: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
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
        close = owner // close account and return lamports to payer
    )]
    pub game: Account<'info, Game>,

    /// CHECK: This is the seed to only allow the owner close the game.
    pub secret: AccountInfo<'info>,
}
