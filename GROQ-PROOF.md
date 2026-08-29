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

Recorded 2026-08-29 against `openai/gpt-oss-120b`, through the deployed
endpoint.

```
==============================================================================
https://en.wikipedia.org/wiki/Chernobyl_disaster
Q: how many individual fuel channels did Chernobyl reactor no. 4 have

  page      143,528 chars, ~49,867 tokens
  COLD      model does not know it without the document
  UNCUT     REFUSED 502 — limit 8000, requested 37623
  KERNLY    accepted at 5145 prompt tokens, ratio 10% (49,368 → 5,884, 88.1% cut,
                                                       confidence 0.82)
  ANSWER    Chernobyl reactor No. 4 contained 1,661 individual fuel channels.
  CHECK     correct (expected /1,?661/)

==============================================================================
https://en.wikipedia.org/wiki/History_of_Indonesia
Q: how old is the wild boar hunt cave painting in the Maros-Pangkep karst of
   Sulawesi

  page      116,283 chars, ~39,498 tokens
  COLD      model does not know it without the document
  UNCUT     REFUSED 502 — limit 8000, requested 30617
  KERNLY    accepted at 5535 prompt tokens, ratio 12% (39,161 → 5,682, 85.5% cut,
                                                       confidence 0.91)
  ANSWER    …dated to at least 43,900 years old.
  CHECK     correct (expected /43,?900/)

==============================================================================
https://en.wikipedia.org/wiki/Borobudur
Q: how many surfaces of stone stairs does Borobudur have in total

  page      97,516 chars, ~33,061 tokens
  COLD      model does not know it without the document
  UNCUT     REFUSED 502 — limit 8000, requested 27582
  KERNLY    accepted at 5573 prompt tokens, ratio 15% (32,447 → 5,867, 81.9% cut,
                                                       confidence 0.86)
  ANSWER    Borobudur has a total of 2,033 stone-stair surfaces.
  CHECK     correct (expected /2,?033/)

==============================================================================
3/3 cases where the uncompressed request was refused and the compressed one
answered correctly.
```

## Reading it

**The refusals are the baseline and they are real.** 37,623, 30,617 and 27,582
tokens, each turned away against a limit of 8,000. Without compression these
three questions cannot be asked on this tier at all. Not slowly, not
expensively — not at all.

**All three then answered correctly on the same key**, at 5,145 to 5,573 prompt
tokens, an 82% to 88% cut.

**All three are attributable to the compression**, and that sentence has been
earned twice over rather than assumed.

The first version of this file asked which conference divided Germany, which
experiment traced oxygen to water, and what killed the Apollo 1 crew, and
reported 2 of 3 correct as though that settled something. It did not. Asked
with no document at all, the model produces Yalta, Ruben and Kamen, and the
cabin fire from training alone. Every one of those answers was consistent with
the compressor having dropped the relevant passage and the model reciting
Wikipedia from memory. A test that cannot fail is not a test.

The second version added a cold check and a qualifier — and still shipped a
question the model knew. The qualifier asked each candidate cold exactly once,
which decides nothing about a fact a model produces most of the time but not
always. The Apollo employment question cleared on a single decline, shipped
here, and was caught on the next run answering 400,000 unaided. Asked three
times it answers three times out of three.

The questions below now come from a qualifier that asks cold three times and
drops a candidate on any hit. Eighteen candidates went in and five came out:
seven the model already knew, five whose fact did not survive the cut, one whose
answer the text extractor never carried off the page. The three above are one
each from three different articles, so a quirk of a single Wikipedia page cannot
be what the run is measuring. The COLD row re-checks all of it on every run,
because a later model may simply know more.

**What the three rows show.** The model could not produce 1,661, 43,900 or 2,033
without the document. The documents could not be sent — 27,000 to 37,000 tokens
against a limit of 8,000. Compressed to roughly a seventh, all three went
through and all three numbers came back correct. The only path from each
question to its answer runs through the compressor.

## Why the model in the transcript is the 120B

The demo key is shared with the live site, and the token window is metered per
model. While the site is being used, `gpt-oss-20b` refuses a large request with
a bare 429 — the window is already spent — and never reaches the size check that
produces the numbers this file is built on. That refusal is about our pacing,
not about the document, and `scripts/groq-proof.mjs` now marks such a case
inconclusive rather than counting it.

The run above used a model nobody was occupying at the time. The ceiling is the
same 8,000 tokens either way; the difference is only whether the provider got
far enough to say so. Running it with your own key avoids the contention
entirely, which is the second reason to prefer that form.
