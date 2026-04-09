export const CATEGORIES = [
    {
        id: 'fun-facts',
        name: 'Fun Facts',
        firestoreName: 'Fun Facts',
        accent: '#FF8A5B',
        tagline: 'Wild facts, internet bait, and brain snacks.',
        subCategories: [
            { id: 'brainy-bites', name: 'Brainy Bites' },
            { id: 'strange-world', name: 'Strange World' },
        ],
    },
    {
        id: 'history',
        name: 'History',
        firestoreName: 'History',
        accent: '#C77DFF',
        tagline: 'Empires, revolutions, leaders, and war stories.',
        subCategories: [
            { id: 'ancient', name: 'Ancient History' },
            { id: 'world-wars', name: 'World Wars' },
            { id: 'famous-figures', name: 'Famous Figures' },
        ],
    },
    {
        id: 'geography',
        name: 'Geography',
        firestoreName: 'Geography',
        accent: '#3BC9DB',
        tagline: 'Capitals, flags, oceans, borders, and maps.',
        subCategories: [
            { id: 'capitals', name: 'Capitals' },
            { id: 'landmarks', name: 'Landmarks' },
        ],
    },
    {
        id: 'maths',
        name: 'Maths',
        firestoreName: 'Maths',
        accent: '#FFD166',
        tagline: 'Mental maths, patterns, and fast thinking.',
        subCategories: [
            { id: 'mental-math', name: 'Mental Math' },
            { id: 'number-patterns', name: 'Number Patterns' },
        ],
    },
    {
        id: 'puzzles',
        name: 'Puzzles',
        firestoreName: 'Puzzles',
        accent: '#7AE582',
        tagline: 'Logic traps, riddles, and sneaky twists.',
        subCategories: [
            { id: 'logic', name: 'Logic' },
            { id: 'riddles', name: 'Riddles' },
        ],
    },
    {
        id: 'geopolitics',
        name: 'Geopolitics',
        firestoreName: 'Geopolitics',
        accent: '#FF6B6B',
        tagline: 'Power, alliances, borders, and current affairs basics.',
        subCategories: [
            { id: 'world-powers', name: 'World Powers' },
            { id: 'global-conflicts', name: 'Global Conflicts' },
        ],
    },
];

export function getCategoryById(categoryId) {
    return CATEGORIES.find((c) => c.id === categoryId) || null;
}

export function getSubCategoryById(categoryId, subCategoryId) {
    const category = getCategoryById(categoryId);
    if (!category) return null;
    return category.subCategories.find((s) => s.id === subCategoryId) || null;
}

export function getDefaultSubCategoryId(categoryId) {
    const category = getCategoryById(categoryId);
    return category?.subCategories?.[0]?.id || null;
}
