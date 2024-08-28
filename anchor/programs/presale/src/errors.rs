use anchor_lang::error_code;

#[error_code]
pub enum SaleErrorCode {
    #[msg("Sale is closed.")]
    SaleClosed,
    #[msg("Sale is not open.")]
    SaleNotOpen,
    #[msg("All stages completed.")]
    AllStagesCompleted,

    #[msg("Insufficient amount.")]
    InsufficientAmount,

    #[msg("Minimum amount not met.")]
    MinAmountNotMet,
    #[msg("Maximum amount exceeded.")]
    MaxAmountExceeded,

    #[msg("Prices and amounts must be the same length.")]
    SettingsLengthMismatch,
    #[msg("Prices must not be empty.")]
    PricesEmpty,
    #[msg("Amounts out of range.")]
    AmountsOutOfRange,

    #[msg("Min amount must be greater than 0.")]
    MinAmountZero,
    #[msg("Min amount must be less than max amount.")]
    MinAmountGreaterThanMax,

    #[msg("Invalid date.")]
    InvalidDate,
    #[msg("Dates are too close.")]
    DatesTooClose,
}