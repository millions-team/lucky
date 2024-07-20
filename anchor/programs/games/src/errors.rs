use anchor_lang::error_code;

#[error_code]
pub enum TreasureErrorCode {
    #[msg("Treasure authority is not the signer")]
    InvalidAuthority,
}

#[error_code]
pub enum StoreErrorCode {
    #[msg("Not enough balance to withdraw")]
    InsufficientBalance,

    #[msg("Invalid feed for the store")]
    InvalidFeed,

    #[msg("Invalid trader for the store")]
    InvalidTrader,
}

#[error_code]
pub enum GameErrorCode {
    #[msg("Name must be between 3 and 32 characters")]
    InvalidName,

    #[msg("Game is not active")]
    GameInactive,

    #[msg("Game is already ended")]
    GameEnded,

    #[msg("Game is not ended")]
    GameNotEnded,

    #[msg("Unimplemented")]
    Unimplemented,
}

#[error_code]
pub enum GameModeErrorCode {
    #[msg("Slots must be between 1 and 10")]
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

#[error_code]
pub enum BountyErrorCode {
    #[msg("Bounty is not owned by the supplier")]
    InvalidOwner,

    #[msg("Vault amount is above threshold")]
    ThresholdNotReached,

    #[msg("Invalid gem")]
    InvalidGem,

    #[msg("Total vault reward is uncollectible")]
    UncollectibleReward,
}

#[error_code]
pub enum PlayerErrorCode {
    #[msg("Game provided does not match the game mode")]
    GameMismatch,

    #[msg("Mode provided does not match the bounty task")]
    TaskMismatch,
}

#[error_code]
pub enum RoundErrorCode {
    #[msg("Invalid seed")]
    InvalidSeed,

    #[msg("Invalid choice")]
    InvalidPlayerChoice,
}