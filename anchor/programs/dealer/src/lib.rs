#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Fr5X3UAzQVMsPwJSVXEDVC9WpssNAd35apibXJXVdWvM");
const DEALER_SEED: &[u8] = b"DEALER";
// const STRATEGY_SEED: &[u8] = b"STRATEGY";
const MIN: u128 = 100000;
const MAX: u128 = 1000000;

#[program]
pub mod dealer {
    use super::*;

    pub fn close(_ctx: Context<CloseDealer>) -> Result<()> {
        Ok(())
    }

    pub fn initialize(ctx: Context<InitializeDealer>, strategy: Strategy) -> Result<()> {
        ctx.accounts.dealer.count = 0;
        ctx.accounts.dealer.last_value = 0;
        ctx.accounts.dealer.strategy = strategy;
        msg!("Dealer initialized with strategy {:?}", strategy);
        Ok(())
    }

    pub fn get(ctx: Context<Update>) -> Result<()> {
        let value = match ctx.accounts.dealer.strategy {
            Strategy::PseudoRandom => {
                pseudo_random()?
            }
            Strategy::Vrf => {
                vrf()?
            }
        };
        if value == ctx.accounts.dealer.last_value {
            return Err(ProgramError::Custom(DealerError::TwoEqualConsecutiveValues as u32).into());
        }

        ctx.accounts.dealer.last_value = value;
        ctx.accounts.dealer.count = ctx.accounts.dealer.count.checked_add(1).unwrap();
        msg!("Dealer roll #{}: {}", ctx.accounts.dealer.count, value);
        Ok(())
    }
}

fn range(seed:u128) -> u128 {
    return MIN + seed % (MAX - MIN);
}

fn shuffle_number(seed: u128) -> u128 {
    let mut numbers = seed.to_string().chars().map(|c| c.to_digit(10).unwrap() as u128).collect::<Vec<u128>>();
    let mut shuffled = Vec::new();

    while !numbers.is_empty() {
        let l = numbers.len() - 1;
        let index = numbers[l] % numbers.len() as u128;
        shuffled.push(numbers.remove(index as usize));
    }

    shuffled.iter().fold(0, |acc, &x| acc * 10 + x)
}

fn pseudo_random() -> Result<u128> {
    let timestamp = Clock::get()?.unix_timestamp;
    msg!("Timestamp: {}", timestamp);
    if timestamp == 0 {
        let code = StrategyError::PseudoRandomError as u32 + DealerError::InvalidSeed as u32;
        return Err(ProgramError::Custom(code).into());
    }

    // seed is the blockhash converted to a number joined with the timestamp
    // let hash = blockhash.to_bytes().iter().fold(0, |acc, &x| acc * 10 + x);
    let seed = shuffle_number(timestamp as u128);
    let ranged = range(seed);
    msg!("Seed: {}, Ranged: {}", seed, ranged);

    Ok(shuffle_number(ranged))
}

fn vrf() -> Result<u128> {
    // TODO: implement VRF
    let seed = pseudo_random();
    Ok(seed?)
}

#[derive(Accounts)]
pub struct InitializeDealer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        seeds = [
            DEALER_SEED,
            payer.key().as_ref(),
        ],
        space = 8 + Dealer::INIT_SPACE,
        payer = payer,
        bump
    )]
    pub dealer: Account<'info, Dealer>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseDealer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            DEALER_SEED,
            payer.key().as_ref(),
        ],
        close = payer, // close account and return lamports to payer
        bump
    )]
    pub dealer: Account<'info, Dealer>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            DEALER_SEED,
            payer.key().as_ref(),
        ],
        bump
    )]
    pub dealer: Account<'info, Dealer>,
}

#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq, AnchorSerialize, AnchorDeserialize)]
#[derive(InitSpace)]
pub enum Strategy {
    PseudoRandom,
    Vrf,
}

#[account]
#[derive(InitSpace)]
pub struct Dealer {
    pub count: u8,
    pub last_value: u128,
    pub strategy: Strategy,
    pub min: u128,
    pub max: u128,
}

#[error_code]
pub enum StrategyError {
    #[msg("PseudoRandom error")]
    PseudoRandomError=100,
    #[msg("Vrf error")]
    VrfError=200,
}

#[error_code]
pub enum DealerError {
    #[msg("Invalid seed")]
    InvalidSeed=10,
    #[msg("Two consecutive values are the same")]
    TwoEqualConsecutiveValues=11,
}