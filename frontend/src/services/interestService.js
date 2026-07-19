import { apiClient } from "./apiClient.js";

export const interestService = {
  // POST /interests — el reclutador muestra interés en un coder.
  // El backend (en una transacción) notifica al TL por correo, registra
  // el interés y pasa al coder a "en conversación" si estaba disponible.
  // El id del reclutador sale del token; aquí solo se manda el coder.
  async showInterest(coderId) {
    return apiClient.post("/interests", { coder_id: coderId });
  },
};
