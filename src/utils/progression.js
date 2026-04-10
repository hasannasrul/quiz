export function getRankForLifetime(lifetime = 0) {
    const score = Number(lifetime || 0);
    if (score >= 5000) return { name: 'Legend', color: '#FFD166', nextTarget: null };
    if (score >= 2500) return { name: 'Master', color: '#7AE582', nextTarget: 5000 };
    if (score >= 1000) return { name: 'Challenger', color: '#3BC9DB', nextTarget: 2500 };
    if (score >= 250) return { name: 'Climber', color: '#FF8A5B', nextTarget: 1000 };
    return { name: 'Rookie', color: '#C77DFF', nextTarget: 250 };
}

export function getResultTier(score = 0) {
    if (score >= 900) return { label: 'Dominating', stars: 3 };
    if (score >= 500) return { label: 'Solid Run', stars: 2 };
    return { label: 'Warm Up', stars: 1 };
}
