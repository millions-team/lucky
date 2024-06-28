pub use crate::errors::GameModeErrorCode;
use crate::constants::{MAX_DIGITS, MAX_SLOTS, MIN_CHOICES, MIN_DIGITS, MIN_SLOTS};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GameModeSettings {
    pub slots: u8,
    pub digits: u8,
    pub choices: u32,
    pub winner_choice: u32,
    pub pick_winner: bool,
}

#[account]
#[derive(InitSpace)]
pub struct GameMode {
    pub game: Pubkey,       // The game account.

    pub slots: u8,          // Number of slots in the game.
    // 1 <= slots <= 16.

    pub digits: u8,         // Number of digits per slot. Each slot would have the same number of digits.
    // 1 <= digits <= 8.

    pub choices: u32,        // Number of choices per slot.
    // 2 <= choices <= max value of digits.
    // Example: digits = 3; 2 <= choices <= 999.

    pub winner_choice: u32,  // The winning choice.
    // w == 0; requires slots >= 2; means any equal choice across all slots is a winner.
    // slots == 1; requires 1 <= w <= choices.
    // slots >= 2 & 1 <= w <= choices; means the winning choice is the same in all slots.

    pub pick_winner: bool,   // If true, the player can pick the winner on each round.
    // w == 0; this is always false.
    // if true, winner_choice is ignored.
    // if false, winner_choice is used to determine the winner.
    // if true but winner_choice for the round is 0, the winner_choice is used as default winner.
}

impl GameMode {
    pub fn new(game: Pubkey, slots: u8, digits: u8, choices: u32, winner_choice: u32, pick_winner: bool) -> Self {
        Self {
            game,
            slots,
            digits,
            choices,
            winner_choice,
            pick_winner,
        }
    }
    pub fn verify(&self) -> Result<()> {
        Self::verify_slots(self.slots)?;
        Self::verify_digits(self.digits)?;
        Self::verify_choices(self.choices, self.digits)?;
        Self::verify_winner_choice(self.winner_choice, self.slots, self.choices)?;
        Self::verify_pick_winner(self.pick_winner, self.winner_choice)?;

        Ok(())
    }

    fn verify_slots(slots: u8) -> Result<()> {
        if slots < MIN_SLOTS || slots > MAX_SLOTS { return Err(GameModeErrorCode::InvalidSlots.into()); }
        Ok(())
    }

    fn verify_digits(digits: u8) -> Result<()> {
        if digits < MIN_DIGITS || digits > MAX_DIGITS { return Err(GameModeErrorCode::InvalidDigits.into()); }
        Ok(())
    }

    fn verify_choices(choices: u32, digits: u8) -> Result<()> {
        let max_choices = 10u32.pow(digits as u32) - 1;
        if choices < MIN_CHOICES || choices > max_choices { return Err(GameModeErrorCode::InvalidChoices.into()); }
        Ok(())
    }

    fn verify_winner_choice(winner_choice: u32, slots: u8, choices: u32) -> Result<()> {
        if slots == 1 {
            if winner_choice < 1 || winner_choice > choices { return Err(GameModeErrorCode::InvalidWinnerSingleChoice.into()); }
        } else {
            if winner_choice > choices { return Err(GameModeErrorCode::InvalidWinnerChoice.into()); }
        }
        Ok(())
    }

    fn verify_pick_winner(pick_winner: bool, winner_choice: u32) -> Result<()> {
        if pick_winner && winner_choice == 0 { return Err(GameModeErrorCode::InvalidPickWinner.into()); }
        Ok(())
    }
}
