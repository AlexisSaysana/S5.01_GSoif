// utils/hydrationAI.js
function calculateHydrationGoal({ age, sexe, poids, temperature }) {
  let objectif = poids * 0.033; // base

  // Sexe
  if (sexe === "homme") objectif += 0.2;

  // Température
  if (temperature > 35) objectif += 0.7;
  else if (temperature > 30) objectif += 0.5;
  else if (temperature > 25) objectif += 0.3;

  // Âge
  if (age < 18) objectif *= 0.9;
  if (age > 55) objectif *= 0.95;

  return Number(objectif.toFixed(2)); // litres
}

module.exports = { calculateHydrationGoal };
