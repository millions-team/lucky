// ----------------------------- Game -----------------------------
pub const GAME_SEED: &[u8] = b"LUCKY_GAME";
pub const GAME_NAME_LEN: usize = 33;

// ----------------------------- GameMode -----------------------------
pub const GAME_MODE_SEED: &[u8] = b"GAME_MODE";
pub const MIN_SLOTS: u8 = 1;
pub const MAX_SLOTS: u8 = 16;
pub const MIN_DIGITS: u8 = 1;
pub const MAX_DIGITS: u8 = 8;
pub const MIN_CHOICES: u32 = 2;

// ----------------------------- Bounty -----------------------------
pub const BOUNTY_SEED: &[u8] = b"BOUNTY";
pub const RENEW_THRESHOLD: u64 = 10; // 10% of the last issued bounty.

// ----------------------------- Treasure -----------------------------
pub const KEEPER_SEED: &[u8] = b"TREASURE_KEEPER";
pub const VAULT_SEED: &[u8] = b"TREASURE_VAULT";
pub const TREASURE_SEED: &[u8] = b"TREASURE";
