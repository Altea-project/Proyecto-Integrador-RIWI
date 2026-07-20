
// Capa de acceso a datos: solo SQL, sin lógica de negocio.
// Todas las funciones reciben el `client` de la transacción (no el pool),
// porque el BEGIN/COMMIT/ROLLBACK lo controla interestService.

// Trae al coder con FOR UPDATE para bloquear la fila mientras dura la transacción. 
// Así evito la condición de carrera si dos reclutadores hacen clic casi al mismo tiempo sobre el mismo coder.

async function findCoderForUpdate(coderId, client) {
    const { rows } = await client.query(
    'SELECT id, name, availability_status FROM users WHERE id = $1 FOR UPDATE',
    [coderId]
    );
  return rows[0]; // undefined si no existe
}

// Datos del reclutador para el correo (nombre, empresa, email). No se duplican en recruiter_interests (ver PDR 3.2).

async function findRecruiterById(recruiterId, client) {
    const { rows } = await client.query(
    'SELECT name, company, email FROM users WHERE id = $1',
    [recruiterId]
    );
    return rows[0];
}

async function insertInterest(recruiterId, coderId, client) {
    const { rows } = await client.query(
    `INSERT INTO recruiter_interests (recruiter_id, coder_id, status)
    VALUES ($1, $2, 'open')
    RETURNING id, sent_at, status`,
    [recruiterId, coderId]
    );
    return rows[0];
}

async function markCoderInConversation(coderId, client) {
    await client.query(
    `UPDATE users SET availability_status = 'in_conversation', updated_at = now()
    WHERE id = $1`,
    [coderId]
    );
}

module.exports = {
    findCoderForUpdate,
    findRecruiterById,
    insertInterest,
    markCoderInConversation
};