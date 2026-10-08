import { recipes } from "./data/recipes.js";
import { getSuggestions } from "./services/recipeService.js";
import { loadRecipes, saveRecipes } from "./services/recipeStorageService.js";

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

const meal = document.querySelector("#meal-filter");
const time = document.querySelector("#time-filter");
const type = document.querySelector("#type-filter");
const wheel = document.querySelector("#meal-wheel");
const context = wheel.getContext("2d");
const spinButton = document.querySelector("#spin-button");
const hint = document.querySelector("#wheel-hint");
const recipesList = document.querySelector("#wheel-recipes-list");
const dialog = document.querySelector("#recipe-dialog");
const editDialog = document.querySelector("#edit-dialog");
const recipeForm = document.querySelector("#recipe-form");
const manageList = document.querySelector("#manage-recipe-list");
const recipeCount = document.querySelector("#recipe-count");
let allRecipes = loadRecipes(recipes);
let candidates = [];
let wheelRotation = -22.5;
let selectedRecipe = null;
let pendingRecipe = null;
let spinFallback = null;
let editingRecipeId = null;

const colors = ["#d9e4d5", "#f1e5ce", "#e8d8d1", "#e5e8d9", "#dce5e9", "#f0dfd0", "#e8e2d1", "#d8e4dd"];

function drawWheel() {
  candidates = getSuggestions(allRecipes.filter((recipe) => recipe.enabledInWheel !== false), { meal: meal.value, time: time.value, type: type.value });
  recipesList.replaceChildren(...candidates.map((recipe, index) => {
    const item = document.createElement("li");
    const marker = document.createElement("span");
    marker.className = "wheel-recipe-marker";
    marker.style.backgroundColor = colors[index % colors.length];
    const title = document.createElement("span");
    title.className = "wheel-recipe-title";
    title.textContent = recipe.title;
    const timeText = document.createElement("span");
    timeText.className = "wheel-recipe-time";
    timeText.textContent = `${recipe.time} min`;
    item.append(marker, title, timeText);
    return item;
  }));
  const center = wheel.width / 2;
  const radius = center - 10;
  context.clearRect(0, 0, wheel.width, wheel.height);
  if (!candidates.length) {
    hint.textContent = "Aucune recette ne correspond. Essaie d’élargir tes critères.";
    spinButton.disabled = true;
    return;
  }
  spinButton.disabled = false;
  hint.textContent = `${candidates.length} recette${candidates.length > 1 ? "s" : ""} dans la roue`;
  const slice = (Math.PI * 2) / candidates.length;
  candidates.forEach((recipe, index) => {
    const start = -Math.PI / 2 + index * slice;
    const end = start + slice;
    const middle = (start + end) / 2;
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, end);
    context.closePath();
    context.fillStyle = colors[index % colors.length];
    context.fill();
    context.strokeStyle = "#fff";
    context.lineWidth = 4;
    context.stroke();

    const labelX = center + Math.cos(middle) * radius * 0.62;
    const labelY = center + Math.sin(middle) * radius * 0.62;
    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "38px sans-serif";
    context.fillText(recipe.emoji, labelX, labelY - 14);
    context.fillStyle = "#353a33";
    context.font = "600 18px sans-serif";
    const label = recipe.title.split(" ")[0];
    context.fillText(label, labelX, labelY + 17, 130);
    context.restore();
  });
  context.beginPath();
  context.arc(center, center, 22, 0, Math.PI * 2);
  context.fillStyle = "#fff";
  context.fill();
  context.strokeStyle = "#e5e7e1";
  context.lineWidth = 2;
  context.stroke();
}

function drawManageList() {
  recipeCount.textContent = `(${allRecipes.length})`;
  manageList.replaceChildren(...allRecipes.map((recipe) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = `${recipe.emoji} ${recipe.title}`;
    const includeLabel = document.createElement("label");
    includeLabel.className = "include-recipe-toggle";
    const include = document.createElement("input");
    include.type = "checkbox";
    include.checked = recipe.enabledInWheel !== false;
    include.setAttribute("aria-label", `Inclure ${recipe.title} dans la roulette`);
    include.addEventListener("change", () => {
      allRecipes = allRecipes.map((item) => item.id === recipe.id ? { ...item, enabledInWheel: include.checked } : item);
      saveRecipes(allRecipes);
      drawWheel();
    });
    const includeText = document.createElement("span");
    includeText.textContent = "Dans la roulette";
    includeLabel.append(include, includeText);
    const actions = document.createElement("span");
    actions.className = "manage-recipe-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Modifier";
    edit.setAttribute("aria-label", `Modifier ${recipe.title}`);
    edit.addEventListener("click", () => openEditForm(recipe));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Supprimer";
    remove.setAttribute("aria-label", `Supprimer ${recipe.title}`);
    remove.addEventListener("click", () => deleteRecipe(recipe));
    actions.append(edit, remove);
    item.append(name, includeLabel, actions);
    return item;
  }));
}

function openEditForm(recipe = null) {
  editingRecipeId = recipe?.id ?? null;
  recipeForm.reset();
  recipeForm.elements.title.value = recipe?.title ?? "";
  recipeForm.elements.description.value = recipe?.description ?? "";
  recipeForm.elements.type.value = recipe?.type ?? "Végétarien";
  recipeForm.elements.meal.value = recipe?.meal ?? "dejeuner";
  recipeForm.elements.time.value = recipe?.time ?? 20;
  recipeForm.elements.ingredients.value = recipe?.ingredients.join("\n") ?? "";
  recipeForm.elements.steps.value = recipe?.steps.join("\n") ?? "";
  document.querySelector("#edit-dialog-title").textContent = recipe ? "Modifier la recette" : "Ajouter une recette";
  editDialog.showModal();
}

function deleteRecipe(recipe) {
  if (!window.confirm(`Supprimer « ${recipe.title} » ?`)) return;
  allRecipes = allRecipes.filter((item) => item.id !== recipe.id);
  saveRecipes(allRecipes);
  drawManageList();
  drawWheel();
}

function spin() {
  if (!candidates.length) return;
  const chosenIndex = Math.floor(Math.random() * candidates.length);
  pendingRecipe = candidates[chosenIndex];
  const sliceDegrees = 360 / candidates.length;
  const centerDegrees = -90 + (chosenIndex + 0.5) * sliceDegrees;
  const currentOffset = ((wheelRotation % 360) + 360) % 360;
  const delta = ((-90 - centerDegrees - currentOffset) % 360 + 360) % 360;
  wheelRotation += 360 * 5 + delta;
  spinButton.disabled = true;
  [meal, time, type].forEach((filter) => { filter.disabled = true; });
  hint.textContent = "La roue tourne…";
  wheel.style.transform = `rotate(${wheelRotation}deg)`;
  clearTimeout(spinFallback);
  spinFallback = setTimeout(finishSpin, 5500);
}

function finishSpin() {
  if (!spinButton.disabled || !pendingRecipe) return;
  selectedRecipe = pendingRecipe;
  openRecipe();
  hint.textContent = "Bon appétit !";
  spinButton.disabled = false;
  [meal, time, type].forEach((filter) => { filter.disabled = false; });
  clearTimeout(spinFallback);
}

wheel.addEventListener("transitionend", (event) => {
  if (event.propertyName !== "transform" || spinButton.disabled === false) return;
  finishSpin();
});

function openRecipe() {
  if (!selectedRecipe) return;
  document.querySelector("#dialog-emoji").textContent = selectedRecipe.emoji;
  document.querySelector("#dialog-title").textContent = selectedRecipe.title;
  document.querySelector("#dialog-meta").textContent = `${selectedRecipe.time} min · ${selectedRecipe.difficulty} · ${selectedRecipe.type}`;
  document.querySelector("#dialog-description").textContent = selectedRecipe.description;
  const ingredients = document.querySelector("#dialog-ingredients");
  const steps = document.querySelector("#dialog-steps");
  ingredients.replaceChildren(...selectedRecipe.ingredients.map((item) => {
    const row = document.createElement("li");
    row.textContent = item;
    return row;
  }));
  steps.replaceChildren(...selectedRecipe.steps.map((item) => {
    const row = document.createElement("li");
    row.textContent = item;
    return row;
  }));
  dialog.showModal();
}

[meal, time, type].forEach((filter) => filter.addEventListener("change", drawWheel));
wheel.style.transform = `rotate(${wheelRotation}deg)`;
spinButton.addEventListener("click", spin);
document.querySelector("#add-recipe-button").addEventListener("click", () => openEditForm());
document.querySelector("#edit-dialog-close").addEventListener("click", () => editDialog.close());
document.querySelector("#cancel-recipe").addEventListener("click", () => editDialog.close());
recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(recipeForm);
  const title = form.get("title").trim();
  const ingredients = form.get("ingredients").split("\n").map((line) => line.trim()).filter(Boolean);
  const steps = form.get("steps").split("\n").map((line) => line.trim()).filter(Boolean);
  if (!ingredients.length || !steps.length) return;
  const previous = allRecipes.find((recipe) => recipe.id === editingRecipeId);
  const recipe = {
    id: editingRecipeId ?? `custom-${Date.now()}`,
    title,
    description: form.get("description").trim(),
    emoji: previous?.emoji ?? "🍽️",
    category: form.get("type"),
    time: Number(form.get("time")),
    difficulty: "Facile",
    type: form.get("type"),
    meal: form.get("meal"),
    ingredients,
    preview: ingredients.slice(0, 4).join(", "),
    steps,
    enabledInWheel: previous?.enabledInWheel !== false,
  };
  if (editingRecipeId) allRecipes = allRecipes.map((item) => item.id === editingRecipeId ? recipe : item);
  else allRecipes = [...allRecipes, recipe];
  saveRecipes(allRecipes);
  drawManageList();
  drawWheel();
  editDialog.close();
});
drawManageList();
drawWheel();
