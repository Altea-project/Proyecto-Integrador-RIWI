const nodemailer = require('nodemailer');
const pool = require('../config/db');

// ------------------------------------------------------------
// HU-07 · T1 — Configuración del transporte de correo.
// Se usa Nodemailer con app password de Gmail (alternativa:
// EmailJS invocado server-side). Las credenciales viven en
// variables de entorno, nunca en el código (regla 8.1 del PDR).
// ------------------------------------------------------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD
    }
});

// ------------------------------------------------------------
// HU-07 · T4 — Obtener el correo del TL dinámicamente a partir
// de la relación users.tl_id del coder. No se guarda el correo
// del TL en ningún otro lado: siempre se resuelve por JOIN.
// ------------------------------------------------------------
async function getTLByCoderId(coderId, dbClient = pool) {
    const query = `
    SELECT tl.id, tl.name, tl.email
    FROM users coder
    JOIN users tl ON tl.id = coder.tl_id
    WHERE coder.id = $1
    `;
    const { rows } = await dbClient.query(query, [coderId]);
  return rows[0]; // undefined si el coder no tiene TL asignado
}

// ------------------------------------------------------------
// HU-07 · T1 — Envío del correo de interés.
// Recibe los datos ya resueltos (no hace queries) para que sea
// una función pura y fácil de probar / reutilizar.
// ------------------------------------------------------------
async function sendInterestEmail({ tlEmail, tlName, recruiterName, company, recruiterEmail, coderName }) {
    const mailOptions = {
    from: process.env.MAIL_USER,
    to: tlEmail,
    subject: `Nuevo interés en tu coder: ${coderName}`,
    text: `Hola ${tlName},

El reclutador ${recruiterName} de la empresa ${company} (contacto: ${recruiterEmail})
ha mostrado interés en tu coder ${coderName}.

Puedes revisar el perfil del coder y ponerte en contacto con el reclutador
para continuar el proceso.

— Altea`
    };

  // nodemailer lanza excepción si el envío falla; el controlador
  // que llama a esta función decide si hace ROLLBACK.
    await transporter.sendMail(mailOptions);
}

module.exports = { getTLByCoderId, sendInterestEmail };