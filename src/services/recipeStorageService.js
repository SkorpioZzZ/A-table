const RECIPES_KEY = "a-table:recipes";

export function loadRecipes(defaultRecipes) {
  try {
    const stored = localStorage.getItem(RECIPES_KEY);
    if (!stored) return [...defaultRecipes];
    const recipes = JSON.parse(stored);
    return Array.isArray(recipes) ? recipes : [...defaultRecipes];
  } catch {
    return [...defaultRecipes];
  }
}

export function saveRecipes(recipes) {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}
