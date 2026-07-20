/* Lógica de negocio del flujo de interés. 
Acá se controla toda la transacción y se coordinan interestRepository + mailService. 
El controller no sabe nada de SQL ni de BEGIN/COMMIT/ROLLBACK, eso vive solo acá.
*/

const pool = require('../config/db');
const interestRepository = require('../repositories/interestRepository');
const { getTLByCoderId, sendInterestEmail } = require('./mailService');


// Errores de dominio propios, para que el controller elija el código HTTP sin tener que leer mensajes de texto.
class CoderNotFoundError extends Error {}
class CoderUnavailableError extends Error {}
class NoTLAssignedError extends Error {}

// lógica de "mostrar interés".
// Orden dentro de la transacción:
//   1. Bloquear y leer el estado actual del coder.
//   2. Buscar el TL del coder.
//   3. Enviar el correo. Si falla, se relanza y el catch hace el ROLLBACK.
//   4. Insertar el interés (status 'open').
//   5. Pasar a 'in_conversation' SOLO si estaba 'available'.
//   6. COMMIT.

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

    // Si sendInterestEmail lanza excepción, cae al catch de abajo y se hace ROLLBACK completo: no queda nada guardado
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