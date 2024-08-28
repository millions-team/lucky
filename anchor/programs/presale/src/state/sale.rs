use crate::constants::{MAX_STAGES, MIN_DURATION};
use crate::errors::SaleErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct Settings {
    pub prices: Vec<u64>,
    pub amounts: Vec<u64>,

    pub start: i64,
    pub end: i64,

    pub min: u64,
    pub max: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Sale {
    pub owner: Pubkey,
    pub token: Pubkey,

    #[max_len(MAX_STAGES as usize)]
    pub prices: Vec<u64>, // Price of the token in SOL.

    #[max_len(MAX_STAGES as usize)]
    pub amounts: Vec<u64>, // Amount of tokens available for sale.

    pub start: i64, // Start time of the sale. (optional) default: now
    pub end: i64, // End time of the sale. (optional) default: 0

    pub sold: u64, // Amount of tokens sold.

    pub min: u64, // Minimum amount of tokens to buy. (required)
    pub max: u64, // Maximum amount of tokens to buy. (optional)
}


impl Sale {
    pub fn init(&mut self, owner: Pubkey, token: Pubkey, settings: Settings) -> Result<()> {
        if settings.prices.len() != settings.amounts.len() {
            return Err(SaleErrorCode::SettingsLengthMismatch.into());
        }

        if settings.prices.iter().any(|&x| x == 0) {
            return Err(SaleErrorCode::PricesEmpty.into());
        }

        if settings.min == 0 {
            return Err(SaleErrorCode::MinAmountZero.into());
        }

        if settings.max > 0 && settings.min >= settings.max {
            return Err(SaleErrorCode::MinAmountGreaterThanMax.into());
        }

        if settings.amounts.iter().any(|&x| settings.min > x) {
            return Err(SaleErrorCode::AmountsOutOfRange.into());
        }

        let now = Clock::get()?.unix_timestamp;
        if settings.start > 0 && settings.start < now {
            return Err(SaleErrorCode::InvalidDate.into());
        }

        let start = if settings.start == 0 { now } else { settings.start };
        if settings.end > 0 && settings.end < start {
            return Err(SaleErrorCode::InvalidDate.into());
        }

        if settings.end > 0 && settings.end - start < MIN_DURATION {
            return Err(SaleErrorCode::DatesTooClose.into());
        }

        self.owner = owner;
        self.token = token;
        self.prices = settings.prices;
        self.amounts = settings.amounts;
        self.start = start;
        self.end = settings.end;
        self.sold = 0;
        self.min = settings.min;
        self.max = settings.max;

        Ok(())
    }

    pub fn is_open(&self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        if self.start <= now {
            if self.end > 0 && self.end < now {
                return Err(SaleErrorCode::SaleClosed.into());
            }
            Ok(())
        } else {
            Err(SaleErrorCode::SaleNotOpen.into())
        }
    }

    pub fn get_price(&self, amount: Decimal) -> Result<u64> {
        self.is_open()?;

        if amount.value < self.min {
            return Err(SaleErrorCode::MinAmountNotMet.into());
        }

        if self.max > 0 && amount.value > self.max {
            return Err(SaleErrorCode::MaxAmountExceeded.into());
        }

        let stage = self.get_stage()?;
        if amount.value > self.amounts[stage] {
            Err(SaleErrorCode::InsufficientAmount.into())
        } else {
            Ok(self.prices[stage] * amount.reduce())
        }
    }

    pub fn get_stage(&self) -> Result<usize> {
        let mut available: u64 = self.sold;
        let stages = self.amounts.len();

        for i in 0..stages {
            if available <= self.amounts[i] {
                return Ok(i);
            }
            available -= self.amounts[i];
        }

        Err(SaleErrorCode::AllStagesCompleted.into())
    }
}


#[derive(Clone, Copy)]
pub struct Decimal {
    value: u64,
    decimals: u32,
}

impl Decimal {
    pub fn new(value: u64, decimals: u32) -> Self {
        Decimal { value, decimals }
    }

    fn reduce(&self) -> u64 { (self.value / 10u64.pow(self.decimals)) as u64 }
}
