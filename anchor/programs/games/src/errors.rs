use anchor_lang::error_code;

#[error_code]
pub enum GameErrorCode {
    #[msg("Name must be between 3 and 32 characters")]
    InvalidName,

    #[msg("Game is already ended")]
    GameEnded,

    #[msg("Game is not ended")]
    GameNotEnded,
}

#[error_code]
pub enum GameModeErrorCode {
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