import axios from "../api/axiosInstance";

// ➤ Ajoute une quantité d’eau
export const addWater = async (id_utilisateur, amount_ml) => {
  return axios.post("/hydration/add", {
    id_utilisateur,
    amount_ml,
  });
};

// ➤ Récupère la progression du jour
export const getTodayHydration = async (id_utilisateur) => {
  return axios.get(`/hydration/today/${id_utilisateur}`);
};

// ➤ Récupère l’historique complet
export const getHydrationHistory = async (id_utilisateur) => {
  return axios.get(`/hydration/history/${id_utilisateur}`);
};

// ➤ Marque l’objectif comme atteint
export const setGoalReached = async (id_utilisateur) => {
  return axios.put("/hydration/goal-reached", {
    id_utilisateur,
  });
};
"l"