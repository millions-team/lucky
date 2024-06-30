use crate::state::bounty::Bounty;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub game: Pubkey,           // Each player will have a game account per game.

    pub rounds: u32,             // Number of rounds played.
    pub last_round: [u32; 16],  // Last round values.
    pub winning_count: u32,     // Number of rounds won.
    pub winner: bool            // If the last round was won.
}

impl Player {
    pub fn new(game: Pubkey) -> Self {
        Self {
            game,
            rounds: 0,
            last_round: [0; 16],
            winning_count: 0,
            winner: false,
        }
    }

    pub fn play(&mut self, _bounty: &Bounty) -> Result<bool> {
        // Game logic here

        self.add_round();
        Ok(true)
    }

    fn add_round(&mut self) {
        self.rounds += 1;
    }
}