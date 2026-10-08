const FAVORITES_KEY = "a-table:favorites";

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); }
  catch { return []; }
}

export function toggleFavorite(id) {
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}
