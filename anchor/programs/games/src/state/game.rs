use crate::errors::GameErrorCode;
use anchor_lang::prelude::*;

#[derive(InitSpace, Copy, Clone, Debug, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum GameStatus {
    Created,
    Active,
    Paused,
    Ended,
}

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub name: [u8; 33], // Only 32 bytes are used. The last byte is a null terminator.
    pub state: GameStatus,
}

impl Game {
    pub const INIT_SPACE: usize = 33 + 8;

    pub fn new(name: &[u8; 33]) -> Result<Self> {
        let mut game = Self {
            name: [0; 33],
            state: GameStatus::Created,
        };

        game.set_name(name)?;

        Ok(game)
    }

    pub fn set_name(&mut self, name: &[u8; 33]) -> Result<()> {
        Self::verify_name(name)?;
        self.name = name.clone();

        Ok(())
    }

    pub fn active(&self) -> bool {
        self.state == GameStatus::Active
    }

    pub fn paused(&self) -> bool {
        self.state == GameStatus::Paused
    }

    pub fn ended(&self) -> bool {
        self.state == GameStatus::Ended
    }

    pub fn created(&self) -> bool {
        self.state == GameStatus::Created
    }

    pub fn set_active(&mut self) -> Result<()> {
        if self.ended() { return Err(GameErrorCode::GameEnded.into()); }
        self.state = GameStatus::Active;

        Ok(())
    }

    pub fn set_paused(&mut self) -> Result<()> {
        if self.ended() { return Err(GameErrorCode::GameEnded.into()); }
        self.state = GameStatus::Paused;

        Ok(())
    }

    pub fn set_ended(&mut self) {
        self.state = GameStatus::Ended;
    }

    fn verify_name(name: &[u8; 33]) -> Result<()> {
        if !(name[0] != 0 && name[1] != 0 && name[2] != 0) { return Err(GameErrorCode::InvalidName.into()); }
        if name[32] != 0 { return Err(GameErrorCode::InvalidName.into()); }

        Ok(())
    }
}
