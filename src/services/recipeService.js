export function getSuggestions(recipes, filters = {}) {
  return recipes.filter((recipe) => {
    const matchesMeal = !filters.meal || filters.meal === "all" || recipe.meal === filters.meal;
    const matchesTime = !filters.time || recipe.time <= Number(filters.time);
    const matchesType = !filters.type || filters.type === "all" || recipe.type === filters.type;
    return matchesMeal && matchesTime && matchesType;
  });
}

export function pickRandom(items, excludedId) {
  const options = items.filter((item) => item.id !== excludedId);
  const pool = options.length ? options : items;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
