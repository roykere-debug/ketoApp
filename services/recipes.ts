export type Recipe = {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string;
    ketoScore: number;
};

export const suggestRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (ingredients.length === 0) return [];

    return [
        {
            id: "1",
            title: "חביתת ירק קיטו",
            ingredients: ["ביצים", "תרד", "גבינת שמנת", "חמאה"],
            instructions: "טרפו את הביצים עם השמנת, טגנו בחמאה והוסיפו את התרד.",
            ketoScore: 9,
        },
        {
            id: "2",
            title: "סלט עוף ואבוקדו",
            ingredients: ["חזה עוף", "אבוקדו", "שמן זית", "לימון"],
            instructions: "חתכו את העוף והאבוקדו לקוביות, תבלו בשמן זית ולימון.",
            ketoScore: 10,
        }
    ];
};
