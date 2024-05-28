#![allow(clippy::result_large_err)]

use anchor_lang::{
    prelude::*,
    solana_program::{native_token::LAMPORTS_PER_SOL},
    system_program,
};

declare_id!("6VCjdiYiU9rAWo7TptZMa423j44GSnyzWMG2KbCCdUz8");
// ---------------------------------- CONSTANTS ----------------------------------
const GAME_SEED: &[u8] = b"LUCKY_GAME";
const VAULT_SEED: &[u8] = b"LUCKY_VAULT";
const BOUNTY_SEED: &[u8] = b"LUCKY_BOUNTY";
const BASE_AMOUNT: u64 = 7 * LAMPORTS_PER_SOL / 1000; // 0.007 SOL
// const BASE_BOUNTY: u64 = 20000 * LAMPORTS_PER_SOL; // 20,000 $LUCKY
const MIN: u32 = 100000;
const MAX: u32 = 1000000;
const MIN_CHOICES: u8 = 4;
const DIGITS: u8 = 6;

// ---------------------------------- ENUMS --------------------------------------
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq, AnchorSerialize, AnchorDeserialize)]
#[derive(InitSpace)]
pub enum Strategy {
    PseudoRandom,
    Vrf,
}

#[error_code]
pub enum StrategyError {
    #[msg("PseudoRandom error")]
    PseudoRandomError = 100,
    #[msg("Vrf error")]
    VrfError = 200,
}

#[error_code]
pub enum LuckyError {
    #[msg("Invalid seed")]
    InvalidSeed = 10,
    #[msg("Two consecutive values are the same")]
    TwoEqualConsecutiveValues = 11,
    #[msg("Roll out of bound")]
    InvalidRoll = 12,
}

// ---------------------------------- ACCOUNTS -----------------------------------
#[account]
#[derive(InitSpace)]
pub struct Lucky {
    pub count: u32,
    pub last_value: u32,
    pub winning_count: u32,
    pub winner: bool,
    pub strategy: Strategy,
}

#[derive(Clone, Copy, Debug, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub struct DealerOptions {
    pub slots: u32,
    pub choices: u8,
    pub lucky_shoot: bool,
}

// ---------------------------------- EVENTS -------------------------------------
#[event]
pub struct SignupEvent {
    owner: Pubkey,
    player: Pubkey,
}

#[event]
pub struct LuckyWinnerEvent {
    player: Pubkey,
    value: u64,
    winning_count: u32,
}

#[event]
pub struct LuckyGameEvent {
    player: Pubkey,
    slots: u32,
    choices: u8,
    lucky_shoot: bool,
}

// ---------------------------------- FUNCTIONS ----------------------------------
fn roll_price(options: DealerOptions) -> u64 {
    let mut price = BASE_AMOUNT / options.slots as u64;
    price *= if options.lucky_shoot {5} else {1};

    return price;
}

fn range(seed: u32) -> u32 {
    return MIN + seed % (MAX - MIN);
}

fn shuffle_number(seed: u64) -> u32 {
    let mut numbers = seed.to_string().chars().map(|c| c.to_digit(10).unwrap() as u64).collect::<Vec<u64>>();
    let mut shuffled = Vec::new();

    while !numbers.is_empty() {
        let l = numbers.len() - 1;
        let index = numbers[l] % numbers.len() as u64;
        shuffled.push(numbers.remove(index as usize));
    }

    return shuffled.iter().fold(0, |acc, &x| acc * 10 + x) as u32;
}

fn pseudo_random() -> Result<u32> {
    let timestamp = Clock::get()?.unix_timestamp;
    // msg!("Timestamp: {}", timestamp);
    if timestamp == 0 {
        let code = StrategyError::PseudoRandomError as u32 + LuckyError::InvalidSeed as u32;
        return Err(ProgramError::Custom(code).into());
    }

    // seed is the blockhash converted to a number joined with the timestamp
    // let hash = blockhash.to_bytes().iter().fold(0, |acc, &x| acc * 10 + x);
    let seed = shuffle_number(timestamp as u64);
    let ranged = range(seed);
    // msg!("Seed: {}, Ranged: {}", seed, ranged);

    Ok(shuffle_number(ranged as u64))
}

fn vrf() -> Result<u32> {
    // TODO: implement VRF
    let seed = pseudo_random();
    Ok(seed?)
}

fn split_value(value: u32, size: u32) -> Vec<u32> {
    let mut digits = value.to_string().chars().map(|c| c.to_digit(10).unwrap() as u32).collect::<Vec<u32>>();
    if digits.len() % size as usize != 0 { panic!("Invalid chunk size"); }

    let mut parts = Vec::new();
    while !digits.is_empty() {
        let chunk = digits.drain(0..size as usize).collect::<Vec<u32>>();
        let number = chunk.iter().fold(0, |acc, &x| acc * 10 + x);
        parts.push(number);
    }

    return parts;
}

fn is_winner(value: u32, options: DealerOptions) -> bool {
    if value < MIN || value > MAX { panic!("Value out of bound"); }
    if options.choices < MIN_CHOICES { panic!("Invalid choices"); }
    if options.slots < 1 || options.slots > DIGITS as u32 { panic!("Invalid slots"); }
    if options.slots == 1 && options.lucky_shoot { panic!("Invalid call"); }

    let winner = (options.choices / 2) as u32;
    msg!("🔎 Winner: {}", if options.lucky_shoot || options.slots == 1 {winner.to_string()} else {"any".parse::<String>().unwrap()});
    if options.slots == 1 { return value % options.choices as u32 == winner; }

    let parts = split_value(value, DIGITS as u32 / options.slots);
    let shoots = parts.iter().map(|part| part % options.choices as u32).collect::<Vec<u32>>();
    let result = shoots.iter().fold(*shoots.first().unwrap_or(&0), |prev, &current| if prev == current { current } else { options.choices as u32 + 1 });

    msg!("🚦 Parts: {:?}, Shoots: {:?}, Result: {}", parts, shoots, result);
    return if options.lucky_shoot { result == winner } else { result != options.choices as u32 + 1 };
}

fn pay_roll(ctx: &Context<Play>, options: DealerOptions) -> Result<()> {
    let lamports = roll_price(options);

    msg!("🛫 Transferring bet to vault");
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.payer.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, lamports)?;
    msg!("🛬 Bet stored");

    Ok(())
}

// ---------------------------------- INSTRUCTIONS -------------------------------
#[derive(Accounts)]
pub struct InitializeLucky<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        seeds = [GAME_SEED, payer.key().as_ref()],
        space = 8 + Lucky::INIT_SPACE,
        payer = payer,
        bump
    )]
    pub player: Account<'info, Lucky>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseLucky<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, payer.key().as_ref()],
        close = payer, // close account and return lamports to payer
        bump
    )]
    pub player: Account<'info, Lucky>,
}

#[derive(Accounts)]
pub struct Play<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_SEED, payer.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Lucky>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED],
        bump,
    )]
    pub bounty: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

// ---------------------------------- PROGRAM ------------------------------------
#[program]
pub mod lucky {
    use super::*;

    pub fn initialize(ctx: Context<InitializeLucky>) -> Result<()> {
        ctx.accounts.player.count = 0;
        ctx.accounts.player.last_value = 0;
        ctx.accounts.player.winning_count = 0;
        ctx.accounts.player.winner = false;

        let strategy = Strategy::PseudoRandom;
        ctx.accounts.player.strategy = strategy;

        msg!("Lucky player initialized with strategy {:?}", strategy);
        emit!(SignupEvent {
            owner: *ctx.accounts.payer.to_account_info().key,
            player: *ctx.accounts.player.to_account_info().key
        });
        Ok(())
    }

    pub fn play(ctx: Context<Play>, options: DealerOptions) -> Result<u32> {
        msg!("🎰 Playing lucky game");
        msg!("⚙️ Game Settings | slots: {}, choices: {}, lucky_shoot: {}", options.slots, options.choices, options.lucky_shoot);

        pay_roll(&ctx, options)?;
        msg!("🎲 Rolling the dice");
        let value = match ctx.accounts.player.strategy {
            Strategy::PseudoRandom => { pseudo_random()? }
            Strategy::Vrf => { vrf()? }
        };
        if value == ctx.accounts.player.last_value { panic!("Two equal consecutive values"); }
        if value < MIN || value > MAX { panic!("Value out of bound"); }

        emit!(LuckyGameEvent {
            player: *ctx.accounts.player.to_account_info().key,
            slots: options.slots,
            choices: options.choices,
            lucky_shoot: options.lucky_shoot
        });
        msg!("🎲 Dealer roll #{}: {}", ctx.accounts.player.count, value);
        let winner = is_winner(value, options);
        ctx.accounts.player.winner = winner;
        ctx.accounts.player.last_value = value;
        ctx.accounts.player.count = ctx.accounts.player.count.checked_add(1).unwrap();

        if winner {
            let winning_count = ctx.accounts.player.winning_count.checked_add(1).unwrap();
            ctx.accounts.player.winning_count = winning_count;
            msg!("🎉 Lucky winner: {}", winning_count);
            emit!(LuckyWinnerEvent {
                player: *ctx.accounts.player.to_account_info().key,
                value: value as u64,
                winning_count
            });
        }
        Ok(value)
    }

    pub fn close(_ctx: Context<CloseLucky>) -> Result<()> {
        Ok(())
    }
}
