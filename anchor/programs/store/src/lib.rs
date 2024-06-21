#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::system_program;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

declare_id!("BJuNDJJkJAFGZGzo8UfaH3t7FgUL5ESCusUFEzKeuLwA");

const MINT_SEED: &[u8] = b"LUCKY_STORE_MINT_AUTHORITY";
const VAULT_SEED: &[u8] = b"LUCKY_STORE_VAULT";
const STORE_SEED: &[u8] = b"LUCKY_STORE";

const RATE: u64 = 13249075000; // USD/SOL price from chainlink on-chain data feed.

#[account]
#[derive(InitSpace)]
pub struct Store {
    price: u64,
    mint: Pubkey,
}

fn get_price(price: u64, amount: u64) -> u64 {
    // Convert price from USD to SOL
    let price_in_sol = price * LAMPORTS_PER_SOL / RATE;

    // Calculate the total price for the amount of tokens
    let total_price_in_sol = price_in_sol * amount;

    // Return the price in lamports
    total_price_in_sol / LAMPORTS_PER_SOL
}

fn pay_exchange(ctx: &Context<TransferAccounts>, amount: u64) -> Result<()> {
    let lamports = get_price(ctx.accounts.store.price, amount);

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.signer.to_account_info(),
            to: ctx.accounts.store.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, lamports)?;

    Ok(())
}

#[program]
pub mod store {
    use super::*;

    pub fn initialize(ctx: Context<InitializeStore>, price: u64) -> Result<()> {
        ctx.accounts.store.price = price.clone();
        ctx.accounts.store.mint = ctx.accounts.token_mint.key();
        Ok(())
    }

    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
        Ok(())
    }

    pub fn deposit(ctx: Context<TransferAccounts>, amount: u64) -> Result<()> {
        let transfer_instruction = Transfer {
            from: ctx.accounts.target_account.to_account_info(),
            to: ctx.accounts.token_vault.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        anchor_spl::token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn sell(ctx: Context<TransferAccounts>, amount: u64) -> Result<()> {
        pay_exchange(&ctx, amount)?;

        let transfer_instruction = Transfer {
            from: ctx.accounts.token_vault.to_account_info(),
            to: ctx.accounts.target_account.to_account_info(),
            authority: ctx.accounts.store_vaults_owner.to_account_info(),
        };

        let bump = ctx.bumps.store_vaults_owner;
        let seeds = &[MINT_SEED.as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );

        anchor_spl::token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn update(ctx: Context<Update>, price: u64) -> Result<()> {
        ctx.accounts.store.price = price.clone();
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let balance = ctx.accounts.store.get_lamports();
        let rent = ctx.accounts.rent.minimum_balance(8 + Store::INIT_SPACE);
        if balance - amount < rent { panic!("Not enough balance to withdraw") }

        ctx.accounts.store.sub_lamports(amount)?;
        ctx.accounts.owner.add_lamports(amount)?;
        Ok(())
    }

    pub fn close(_ctx: Context<CloseStore>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeStore<'info> {
    #[account(
        init,
        seeds = [STORE_SEED, owner.key().as_ref(), token_mint.key().as_ref()],
        bump,
        space = 8 + Store::INIT_SPACE,
        payer = owner
    )]
    pub store: Account<'info, Store>,

    #[account(mut)]
    owner: Signer<'info>,
    token_mint: Account<'info, Mint>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    // Derived PDAs
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        init_if_needed,
        payer = owner,
        seeds = [MINT_SEED],
        bump,
        space = 8 + 1
    )]
    store_vaults_owner: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [VAULT_SEED, store.key().as_ref()],
        token::mint = token_mint,
        token::authority = store_vaults_owner,
        bump
    )]
    token_vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [STORE_SEED, owner.key().as_ref(), token_mint.key().as_ref()],
        bump,
    )]
    pub store: Account<'info, Store>,

    #[account(mut)]
    owner: Signer<'info>,
    token_mint: Account<'info, Mint>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferAccounts<'info> {
    // Derived PDAs
    /// CHECK: This is not dangerous because we only write from this account on sell
    #[account(
        mut,
        seeds = [MINT_SEED],
        bump,
    )]
    store_vaults_owner: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, store.key().as_ref()],
        bump,
    )]
    token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    target_account: Account<'info, TokenAccount>,

    #[account(mut)]
    signer: Signer<'info>,

    #[account(mut)]
    store: Account<'info, Store>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [STORE_SEED, owner.key().as_ref(), token_mint.key().as_ref()],
        bump,
    )]
    pub store: Account<'info, Store>,

    #[account(mut)]
    owner: Signer<'info>,
    token_mint: Account<'info, Mint>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [STORE_SEED, owner.key().as_ref(), token_mint.key().as_ref()],
        bump,
    )]
    pub store: Account<'info, Store>,

    #[account(mut)]
    owner: Signer<'info>,
    token_mint: Account<'info, Mint>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CloseStore<'info> {
    #[account(
        mut,
        seeds = [STORE_SEED, owner.key().as_ref(), token_mint.key().as_ref()],
        bump,
        close = owner, // close account and return lamports to owner
    )]
    pub store: Account<'info, Store>,

    #[account(mut)]
    owner: Signer<'info>,
    token_mint: Account<'info, Mint>,
    system_program: Program<'info, System>,
}
