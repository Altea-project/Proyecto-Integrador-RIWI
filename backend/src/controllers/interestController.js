
// Controller del flujo de interes: no toca SQL ni transacciones. 
// Solo lee req/res y traduce los errores de dominio del service a códigos HTTP.

const interestService = require('../services/interestService');

async function createInterest(req, res) {
  try {
    const recruiterId = req.user.id;
    const { coder_id } = req.body;

    const interest = await interestService.createInterest(recruiterId, coder_id);

    return res.status(201).json({
      message: 'Gracias por tu interés; el correo se ha enviado al instructor con éxito.',
      interest
    });
  } catch (err) {
    if (err instanceof interestService.CoderNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof interestService.CoderUnavailableError) {
      return res.status(409).json({ error: err.message });
    }
    if (err instanceof interestService.NoTLAssignedError) {
      return res.status(422).json({ error: err.message });
    }

    console.error('Error en createInterest:', err);
    return res.status(500).json({ error: 'Hubo un error al procesar tu interés. Intenta de nuevo.' });
  }
}

module.exports = { createInterest };