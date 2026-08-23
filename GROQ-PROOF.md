# Does a free-tier Groq key hold a long document?

No. That is the point.

Groq's on-demand tier meters 8,000 prompt tokens per minute against the whole
organisation, not per key, so a long article is refused before a word of it is
read. Adding more keys from the same account changes nothing — the error names
the organisation, not the key.

What follows is the case for the compressor stated in the only terms that
matter: three real articles, fetched live, sent to the same model twice.

Reproduce it yourself:

```
npm run proof:groq                       # through the deployed endpoint
GROQ_API_KEY=gsk_... npm run proof:groq  # straight to Groq, no server of ours in the path
```

The second form is the one to trust. With a key set, `scripts/groq-proof.mjs`
fetches the page from Wikipedia, strips it to text in that file, compresses it
with the local library and posts to `api.groq.com` itself. Nothing of ours sits
between you and the provider, so neither the refusal nor the answer can have
been shaped by anything we run.

## The run

Recorded 2026-08-23 against `openai/gpt-oss-20b`.

```
==============================================================================
https://en.wikipedia.org/wiki/World_War_II
Q: which conference agreed to divide Germany into occupation zones after the war

  page      198,652 chars, ~68,489 tokens
  UNCUT     REFUSED 502 — limit 8000, requested 54086
  KERNLY    accepted at 5379 prompt tokens, ratio 8% (67,287 → 6,337, 90.6% cut,
                                                      confidence 0.31, GATE WARNS)
  ANSWER    The Potsdam Conference agreed to divide Germany into occupation zones.
  CHECK     WRONG (expected /yalta/)

==============================================================================
https://en.wikipedia.org/wiki/Photosynthesis
Q: which experiment showed the oxygen released comes from water rather than carbon dioxide

  page      100,779 chars, ~34,671 tokens
  UNCUT     REFUSED 502 — limit 8000, requested 27517
  KERNLY    accepted at 4783 prompt tokens, ratio 15% (34,240 → 6,179, 82.0% cut,
                                                       confidence 0.62)
  ANSWER    …performed by Samuel Ruben and Martin Kamen. They used radioactive isotopes…
  CHECK     correct

==============================================================================
https://en.wikipedia.org/wiki/Apollo_program
Q: what killed the three astronauts of the first crewed Apollo mission

  page      152,371 chars, ~51,878 tokens
  UNCUT     REFUSED 502 — limit 8000, requested 39952
  KERNLY    accepted at 4968 prompt tokens, ratio 10% (50,988 → 6,102, 88.0% cut,
                                                       confidence 0.58)
  ANSWER    …Ed White, Gus Grissom and Roger Chaffee were killed in the Apollo 1 fire
            during a pre-flight test on January 27, 1967.
  CHECK     correct

==============================================================================
2/3 cases where the uncompressed request was refused and the compressed one answered correctly.
```

## Reading it

**The refusals are the baseline and they are real.** 54,086, 27,517 and 39,952
tokens, each turned away against a limit of 8,000. Without compression these
three questions cannot be asked on this tier at all. Not slowly, not expensively
— not at all.

**Two of the three then answered correctly on the same key**, at 4,783 to 5,379
prompt tokens. An 82% to 90% cut, and the answers name Ruben and Kamen, and the
Apollo 1 fire, which is what the articles say.

**The third was wrong, and the gate said so before the answer was read.**
Confidence 0.31 against a threshold of 0.55, escalation raised. The compressed
context had lost the passage naming Yalta, the model reached for a related
conference from memory, and the receipt had already flagged the run as one not
to trust.

That last row is why this file reports 2/3 rather than being rerun until it
reads 3/3. A compressor that never fails is a compressor whose failures are
hidden, and the useful claim is not "the answer always survives" — it is "when
the answer does not survive, you are told". On this run the instrument was
right about itself three times out of three.

## What this does not show

The 8,000-token ceiling is a property of the free tier, not of the model.
On a paid tier or on Gemini, the uncompressed column goes through and the
comparison becomes one of cost rather than of possibility — measured separately
at 14,256 prompt tokens against 6,557, and 4.4 seconds against 1.2.

The correctness check is a regular expression over the answer text. It catches a
named entity appearing or not appearing; it is not a judgement of whether the
whole answer is sound. Read the answers.

Three documents is three documents. The wider measurement — 13 fixtures, 7
ratios, retention and silent-failure counts — is in [EVAL.md](EVAL.md), and it
is less flattering than this page.

The on-chain half of the project is proved separately in [PROOF.md](PROOF.md).
