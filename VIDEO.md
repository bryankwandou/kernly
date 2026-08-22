# Marketing video — 90 second cut

A demo video for a developer tool has one job: make the viewer believe the thing
works. Every second spent on a logo animation is a second not spent on that.
This cut is 90 seconds, has no music bed under the terminal sections, and shows
real output throughout. Nothing is mocked up.

Capture at 1920x1080, 60fps, from a 2560-wide window scaled down, so text stays
sharp rather than resampled. Terminal at 16pt minimum — a judge watching on a
laptop cannot read 11pt.

---

## Shot list

**0:00–0:06 — cold open, no logo**

Terminal, dark, already open. Type `npm run eval` and let it run. The table
prints. Hold on it.

> Voiceover: "This is the number most compression tools won't show you."

Opening on the hardest evidence rather than a title card is deliberate. It buys
attention for the eighty seconds that follow.

**0:06–0:18 — the problem**

Screen recording of an agent loop in a real terminal, turn counter climbing. The
same system prompt block highlighted each turn it reappears.

> "An agent re-reads its own history every turn. By turn twenty you have paid for
> the same system prompt twenty times. And past a certain length the extra
> context stops being neutral — it dilutes attention and the answer gets worse.
> You are paying to make your own output worse."

**0:18–0:30 — the pipeline**

Cut to the playground at kernly.vercel.app. Paste a long context. Hit
compress. The six stage rows fill in with token counts falling down the right
edge. Let the real timing show — it is milliseconds, and that is the point.

> "Six stages. Segment, fold, score, fit, compact, gate. No GPU, no API call, no
> model anywhere in the loop. That runs in your browser."

**0:30–0:42 — determinism**

Split screen. Same input compressed twice. Two identical digests.

> "Because there is no model inside it, a run is a pure function. Same input,
> same config, same bytes — forever. Every compressor built on a language model
> fails that test, and it is the property everything else here depends on."

**0:42–0:58 — the chain, live**

Back to terminal. `npm run proof`. Let it run unedited: compress, post to devnet,
read back, recompute, compare. The last two lines print true.

> "So we hash the run and write the hash to Solana. This is devnet, right now.
> It posts the digest, reads it back off the chain, recomputes locally, and
> compares. No prompt content ever leaves. Ten seconds, and you need nothing
> from us but a keypair."

Do not cut away during the wait for confirmation. The pause is evidence.

**0:58–1:10 — verification by a stranger**

Explorer, real transaction, memo payload visible. Then the verifier page: paste
the signature, paste the input, watch the browser recompute.

> "Anyone can check it. The verifier runs entirely client side — there is no
> Kernly server in that path, which is the whole reason the record is on a public
> ledger instead of in our database."

**1:10–1:22 — the honest slide**

The retention table again, this time with the failing rows highlighted rather
than hidden.

> "Here is where it breaks. Above two times compression, three quarters of
> questions still have their answer. Below that, it is a gamble, and the gate
> tells you so — it caught twenty-two of twenty-eight failures and missed six.
> Those numbers are in the repository, including the six."

**1:22–1:30 — close**

Mark, wordmark, URL. First and only appearance of the logo.

> "Send less. Prove it. kernly.vercel.app."

---

## Production notes

- **No stock footage.** Not one shot of a server room or a rotating globe.
- **No music under the terminal.** Music under a live command reads as a cover
  for something not working.
- **Type at human speed, or don't show typing.** Sped-up typing is the most
  common tell that a demo was assembled rather than run.
- **Device frames only for the web pages**, never for the terminal. A terminal
  in a rounded browser chrome looks staged.
- **Colour grade nothing.** The site already has a defined palette; regrading it
  makes the video and the product look like different things.
- **Export at CRF 18 or better.** A blurred or blocked-up demo video reads as
  carelessness about everything else, and compression artefacts on a video about
  compression is a joke a judge will make out loud.

## If it has to be 30 seconds

Keep 0:00–0:06, 0:42–0:58, and 1:22–1:30. Evidence, chain, close. Everything
else is elaboration.
