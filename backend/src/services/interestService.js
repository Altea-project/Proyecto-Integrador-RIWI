// services/interestService.js
// Capa de lógica de negocio: controla la transacción completa y orquesta
// interestRepository + mailService. El controller no sabe nada de SQL ni
// de BEGIN/COMMIT/ROLLBACK — eso vive únicamente aquí.

const pool = require('../config/db');
const interestRepository = require('../repositories/interestRepository');
const { getTLByCoderId, sendInterestEmail } = require('./mailService');

// Errores de dominio propios, para que el controller decida el código
// HTTP sin tener que leer mensajes de texto ni acoplarse a SQL.
class CoderNotFoundError extends Error {}
class CoderUnavailableError extends Error {}
class NoTLAssignedError extends Error {}

// ------------------------------------------------------------
// HU-07 · T2  +  HU-10 · T1 — lógica de "mostrar interés"
//
// Orden dentro de la transacción:
//   1. Bloquear y leer el estado actual del coder (RN-06).
//   2. Resolver el TL del coder (HU-07 T4).
//   3. Enviar el correo (HU-07 T1). Si falla, se relanza y el
//      catch hace ROLLBACK total (RN-08).
//   4. Insertar el interés (status 'open').
//   5. Mover a 'in_conversation' SOLO si estaba 'available'.
//   6. COMMIT.
// ------------------------------------------------------------
async function createInterest(recruiterId, coderId) {
    const client = await pool.connect();
    try {
    await client.query('BEGIN');

    const coder = await interestRepository.findCoderForUpdate(coderId, client);
    if (!coder) {
        throw new CoderNotFoundError('Coder no encontrado.');
    }
    if (coder.availability_status === 'unavailable') {
        throw new CoderUnavailableError('Este coder ya no está disponible.');
    }

    const tl = await getTLByCoderId(coderId, client);
    if (!tl) {
        throw new NoTLAssignedError('El coder no tiene un instructor asignado.');
    }

    const recruiter = await interestRepository.findRecruiterById(recruiterId, client);

    // Si sendInterestEmail lanza excepción, cae directo al catch de abajo
    // y se hace ROLLBACK completo — no queda nada guardado (RN-08).
    await sendInterestEmail({
        tlEmail: tl.email,
        tlName: tl.name,
        recruiterName: recruiter.name,
        company: recruiter.company,
        recruiterEmail: recruiter.email,
        coderName: coder.name
    });

    const interest = await interestRepository.insertInterest(recruiterId, coderId, client);

    if (coder.availability_status === 'available') {
        await interestRepository.markCoderInConversation(coderId, client);
    }

    await client.query('COMMIT');
    return interest;
    } catch (err) {
    await client.query('ROLLBACK');
    throw err; // el controller decide el status HTTP según el tipo de error
    } finally {
    client.release();
    }
}

module.exports = {
    createInterest,
    CoderNotFoundError,
    CoderUnavailableError,
    NoTLAssignedError
};