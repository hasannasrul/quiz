export function computePoints({ isCorrect, streak }) {
    if (!isCorrect) return 0;
    const base = 100;
    const multiplier = 1 + Math.min(0.5, (streak || 0) * 0.05);
    return Math.round(base * multiplier);
}
