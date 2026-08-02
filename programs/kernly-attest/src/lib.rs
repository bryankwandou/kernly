//! Kernly attestation registry.
//!
//! The devnet MVP writes receipts through the SPL Memo program, which is enough
//! to prove a single run happened and is available on every cluster with no
//! deployment. This program is the next step up: it keeps a running total per
//! signer, so a team can point at one account and say "this is what we have
//! saved", without anyone having to trust an off-chain aggregator to have
//! summed the memos honestly.
//!
//! The design deliberately stores no prompt content. A receipt is a digest and
//! four integers. That keeps the account small, keeps the fee negligible, and
//! means the program never becomes a place where somebody's private context
//! ends up published by accident.

use anchor_lang::prelude::*;

declare_id!("KernLyAttest111111111111111111111111111111");

#[program]
pub mod kernly_attest {
    use super::*;

    /// Create the per-signer ledger. Idempotent by virtue of `init`, so a
    /// second call fails rather than resetting a total, which is the safer of
    /// the two behaviours for something that exists to be counted.
    pub fn open_ledger(ctx: Context<OpenLedger>) -> Result<()> {
        let ledger = &mut ctx.accounts.ledger;
        ledger.owner = ctx.accounts.owner.key();
        ledger.bump = ctx.bumps.ledger;
        ledger.runs = 0;
        ledger.tokens_in = 0;
        ledger.tokens_out = 0;
        Ok(())
    }

    /// Record one compression run.
    ///
    /// Nothing here is verified on chain, and pretending otherwise would be
    /// dishonest: the program cannot re-run a JavaScript pipeline. What it
    /// provides is an append-only, timestamped, signer-attributed record. The
    /// verification story is off-chain and permissionless — the pipeline is
    /// deterministic and open, so anybody can recompute the digest and check it
    /// against what was written here.
    pub fn attest(ctx: Context<Attest>, digest: [u8; 32], tokens_in: u64, tokens_out: u64) -> Result<()> {
        require!(tokens_out <= tokens_in, KernlyError::NegativeSaving);
        require!(tokens_in > 0, KernlyError::EmptyRun);

        let ledger = &mut ctx.accounts.ledger;
        ledger.runs = ledger.runs.checked_add(1).ok_or(KernlyError::Overflow)?;
        ledger.tokens_in = ledger.tokens_in.checked_add(tokens_in).ok_or(KernlyError::Overflow)?;
        ledger.tokens_out = ledger.tokens_out.checked_add(tokens_out).ok_or(KernlyError::Overflow)?;

        emit!(Attested {
            owner: ctx.accounts.owner.key(),
            digest,
            tokens_in,
            tokens_out,
            slot: Clock::get()?.slot,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct OpenLedger<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Ledger::LEN,
        seeds = [b"ledger", owner.key().as_ref()],
        bump
    )]
    pub ledger: Account<'info, Ledger>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Attest<'info> {
    #[account(
        mut,
        seeds = [b"ledger", owner.key().as_ref()],
        bump = ledger.bump,
        has_one = owner
    )]
    pub ledger: Account<'info, Ledger>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Ledger {
    pub owner: Pubkey,
    pub runs: u64,
    pub tokens_in: u64,
    pub tokens_out: u64,
    pub bump: u8,
}

impl Ledger {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

/// Emitted per run. Events are cheap, indexable, and keep the account itself at
/// a fixed size no matter how many runs a wallet records.
#[event]
pub struct Attested {
    pub owner: Pubkey,
    pub digest: [u8; 32],
    pub tokens_in: u64,
    pub tokens_out: u64,
    pub slot: u64,
}

#[error_code]
pub enum KernlyError {
    #[msg("compressed output cannot be larger than the input")]
    NegativeSaving,
    #[msg("a run with zero input tokens is not a run")]
    EmptyRun,
    #[msg("ledger total overflowed")]
    Overflow,
}
