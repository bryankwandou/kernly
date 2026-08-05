# Proof of the on-chain loop

Everything below was produced by `scripts/devnet-proof.mjs` against Solana
devnet on 5 August 2026. Nothing here is a mock, a fixture snapshot or a
screenshot. Anyone with a devnet keypair can reproduce it in about ten seconds:

```
KERNLY_SIGNER=<base58 secret key> node scripts/devnet-proof.mjs
```

## What the run does

1. Compresses a fixture that deliberately contains repeated prose, a fenced
   TypeScript block, three near-identical log lines and one padded sentence.
2. Writes the receipt digest and the token counters to devnet through the SPL
   Memo program, signed by the author's wallet.
3. Waits for confirmation, reads the transaction back off the chain and parses
   the memo out of the program logs.
4. Recomputes the digest locally from the same input and config.
5. Compares the on-chain digest against the recomputed one.

Step 5 is the part that matters. A compression claim is worthless if the person
making it also controls the scoreboard, so the number on chain is a hash that
anyone can regenerate from open-source code.

## Two independent runs

Signer: `35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr`

| Run | Signature | Digest | Tokens |
| --- | --- | --- | --- |
| 1 | [`4khmn679…dbjHBVyN`](https://explorer.solana.com/tx/4khmn679ZPZ7hZJMwub6gpBhddhbLnDsZj2v45Nz2Avjdv7Cgwt3L1uJ6zVyQvtXfPjsNg2xjErDHiXGdbjHBVyN?cluster=devnet) | `191f39d9…a57c6d9a` | 150 → 65 |
| 2 | [`2jNCWyHH…Hu6Pyamq`](https://explorer.solana.com/tx/2jNCWyHHA2nyPwCeQG7WLAePfwSN413kwP19w7XUYWeToP3SXCmirNF3H4s23EjmnGNPgakMbrumMJ9tHu6Pyamq?cluster=devnet) | `191f39d9…a57c6d9a` | 150 → 65 |

Different transactions, minutes apart, identical digest. That is the
determinism claim demonstrated rather than asserted: the pipeline has no
sampling, no model call and no clock dependency inside the hashed region.

## The record that landed on chain

```json
{
  "v": "kernly.v1",
  "d": "191f39d9f7537c56dad2b7d46e5a42a4520d4427a8861f270e14512aa57c6d9a",
  "i": 150,
  "o": 65,
  "g": 0.0122,
  "t": 1785913657
}
```

`d` is the sha256 over the normalized input, the output and the canonicalised
config, with length prefixes so a crafted input cannot impersonate a config
boundary. `i` and `o` are token counts. `g` is grams of CO2e avoided — a derived
estimate from published energy factors, labelled as an estimate everywhere it
appears, never presented as a measurement. `t` is client-supplied and therefore
advisory; the blockchain's own slot time is the authoritative timestamp.

## What is deliberately not claimed

- The memo program stores the record; it does not validate it. A signer can post
  a digest for a compression they never ran. What they cannot do is post a
  digest that verifies against an input they did not compress, which is what the
  `/verify` page checks.
- Carbon figures are arithmetic over public grid-intensity averages. The token
  counts are exact; the grams are an interpretation of them.
- Devnet uses the Memo program rather than a custom Anchor program. The registry
  version in `programs/kernly-attest` moves the same payload into a PDA with
  cumulative per-signer totals. It changes where the data lives, not what is
  being asserted.

## Verify a run yourself

Open [/verify](https://getkernly.vercel.app/verify), paste a signature from the
table above, and paste the fixture input from `scripts/devnet-proof.mjs`. The
page fetches the memo from devnet, recomputes the digest in your browser, and
shows you both. No Kernly server sits in the middle of that check.
