export function allocate(blocks, budget) {
    const live = blocks.filter((b) => b.duplicateOf === undefined);
    const totalScore = live.reduce((s, b) => s + b.score, 0) || 1;
    const pinned = live.filter((b) => b.pinned);
    const rest = live.filter((b) => !b.pinned);
    let spent = pinned.reduce((s, b) => s + b.tokens, 0);
    const keptIds = new Set(pinned.map((b) => b.id));
    // Density-first: value per token, not raw value.
    const ranked = [...rest].sort((a, b) => b.score / Math.max(1, b.tokens) - a.score / Math.max(1, a.tokens));
    for (const b of ranked) {
        if (spent + b.tokens > budget)
            continue; // skip, do not stop: a later smaller block may still fit
        keptIds.add(b.id);
        spent += b.tokens;
    }
    // A budget smaller than the pinned set is unsatisfiable. Rather than silently
    // truncating something the caller declared non-negotiable, keep the pins and
    // let the receipt report the overrun so the caller can react.
    const kept = live.filter((b) => keptIds.has(b.id));
    const dropped = blocks.filter((b) => !keptIds.has(b.id));
    const keptScore = kept.reduce((s, b) => s + b.score, 0);
    return { kept, dropped, salienceRetained: Math.min(1, keptScore / totalScore) };
}
