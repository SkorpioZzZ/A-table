import { recipes as defaultRecipesData } from "../data/recipes.js";

const RECIPES_KEY = "a-table:recipes";

function emptyChanges() {
  return { version: 2, custom: [], edited: {}, deleted: [], disabled: [] };
}

function withoutWheelFlag(recipe) {
  const { enabledInWheel, ...rest } = recipe;
  return rest;
}

export function mergeRecipes(defaults, changes) {
  const baseRecipes = defaults
    .filter((recipe) => !changes.deleted.includes(recipe.id))
    .map((recipe) => changes.edited[recipe.id] ?? recipe);
  return [...baseRecipes, ...changes.custom].map((recipe) => ({
    ...recipe,
    enabledInWheel: !changes.disabled.includes(recipe.id),
  }));
}

export function loadRecipes(defaultRecipes) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECIPES_KEY));
    if (Array.isArray(stored)) {
      const changes = recipesToChanges(stored);
      localStorage.setItem(RECIPES_KEY, JSON.stringify(changes));
      return mergeRecipes(defaultRecipes, changes);
    }
    if (!stored || stored.version !== 2) return mergeRecipes(defaultRecipes, emptyChanges());
    const changes = { ...emptyChanges(), ...stored };
    return mergeRecipes(defaultRecipes, changes);
  } catch {
    return mergeRecipes(defaultRecipes, emptyChanges());
  }
}

function recipesToChanges(recipes) {
  const changes = emptyChanges();
  const ids = recipes.map((recipe) => recipe.id);
  for (const base of defaultRecipesData) {
    if (!ids.includes(base.id)) changes.deleted.push(base.id);
  }
  for (const recipe of recipes) {
    const clean = withoutWheelFlag(recipe);
    const base = defaultRecipesData.find((item) => item.id === recipe.id);
    if (!base) changes.custom.push(clean);
    else if (JSON.stringify(clean) !== JSON.stringify(base)) changes.edited[recipe.id] = clean;
    if (recipe.enabledInWheel === false) changes.disabled.push(recipe.id);
  }
  return changes;
}

export function saveRecipes(recipes) {
  const changes = recipesToChanges(recipes);
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(changes));
    return true;
  } catch (error) {
    console.error("Impossible d’enregistrer les recettes :", error);
    return false;
  }
}
