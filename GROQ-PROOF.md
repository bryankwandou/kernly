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

Recorded 2026-08-29 against `openai/gpt-oss-20b`.

```
==============================================================================
https://en.wikipedia.org/wiki/Apollo_program
Q: how many people did the Apollo program employ at its peak, and how many
   industrial firms and universities supported it

  page      152,371 chars, ~51,878 tokens
  COLD      MODEL ALREADY KNOWS IT — this case proves nothing
  UNCUT     REFUSED 502 — limit 8000, requested 40309
  KERNLY    accepted at 5272 prompt tokens, ratio 10% (50,988 → 6,102, 88.0% cut,
                                                       confidence 0.78)
  ANSWER    …roughly 400,000 people at its peak, supported by over 20,000
            industrial firms and universities.
  CHECK     correct (expected /400,?000/)

==============================================================================
https://en.wikipedia.org/wiki/History_of_Indonesia
Q: how old is the wild boar hunt cave painting in the Maros-Pangkep karst of
   Sulawesi

  page      116,283 chars, ~39,498 tokens
  COLD      model does not know it without the document
  UNCUT     REFUSED 502 — limit 8000, requested 30598
  KERNLY    accepted at 5516 prompt tokens, ratio 12% (39,161 → 5,682, 85.5% cut,
                                                       confidence 0.91)
  ANSWER    …estimated to be at least 43,900 years old.
  CHECK     correct (expected /43,?900/)

==============================================================================
https://en.wikipedia.org/wiki/History_of_Indonesia
Q: what is the minimum age of the painted hand stencil from Leang Timpuseng

  page      116,283 chars, ~39,498 tokens
  COLD      model does not know it without the document
  UNCUT     REFUSED 502 — limit 8000, requested 30592
  KERNLY    accepted at 5427 prompt tokens, ratio 12% (39,161 → 5,685, 85.5% cut,
                                                       confidence 0.91)
  ANSWER    …a minimum age of 39,900 years.
  CHECK     correct (expected /39,?900/)

==============================================================================
3/3 cases where the uncompressed request was refused and the compressed one
answered correctly.
2 of those are attributable to the compression. 1 the model already knew without
the document, so that row demonstrates the ceiling but not the retrieval.
```

## Reading it

**The refusals are the baseline and they are real.** 40,309, 30,598 and 30,592
tokens, each turned away against a limit of 8,000. Without compression these
three questions cannot be asked on this tier at all. Not slowly, not expensively
— not at all.

**All three then answered correctly on the same key**, at 5,272 to 5,516 prompt
tokens, an 85% to 88% cut.

**Two of the three are evidence. The first is not, and the run says so itself.**

That COLD row is the whole reason this file was rewritten. The version recorded
on 2026-08-23 asked which conference divided Germany, which experiment traced
oxygen to water, and what killed the Apollo 1 crew — and reported 2 of 3
correct as though that settled something. It did not. Asked with no document at
all, gpt-oss-20b produces Yalta, Ruben and Kamen, and the cabin fire from
training alone. Every one of those answers was consistent with the compressor
having dropped the relevant passage entirely and the model reciting what it
already knew. A test that cannot fail is not a test.

So the questions were replaced with facts a model has no reason to hold —
43,900 years for the Maros-Pangkep boar hunt, 39,900 for the Leang Timpuseng
hand stencil — and the cold check now runs on every case rather than being
reasoned about once. It earned its place immediately: the Apollo employment
question had passed selection, and on this run the model produced 400,000
unaided. That row is honest about the ceiling and proves nothing about
retrieval, and the summary now counts those separately.

**What the two attributable rows show.** The model could not produce 43,900 or
39,900 without the document. The document could not be sent — 30,000 tokens
against a limit of 8,000. Compressed to an eighth, it went through and both
numbers came back correct. The only path from the question to the answer runs
through the compressor.
