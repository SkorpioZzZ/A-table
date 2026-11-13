export function exportRecipes(recipes) {
  const json = JSON.stringify(recipes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mes-recettes.json";
  link.click();
  URL.revokeObjectURL(url);
}

function isValidRecipe(recipe) {
  return typeof recipe === "object" && recipe !== null
    && Boolean(recipe.id)
    && Boolean(recipe.title)
    && Array.isArray(recipe.ingredients)
    && Array.isArray(recipe.steps);
}

export async function readRecipesFile(file) {
  try {
    const data = JSON.parse(await file.text());
    if (Array.isArray(data) && data.length > 0 && data.every(isValidRecipe)) return data;
    return null;
  } catch {
    return null;
  }
}
