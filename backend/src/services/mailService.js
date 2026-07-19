const nodemailer = require('nodemailer');
const pool = require('../config/db');

/*Configuración del transporte de correo.
Uso Nodemailer con un app password de Gmail. Las credenciales van en variables de entorno, nunca en el código.*/
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD
    }
});

/* Consigue el correo del TL a partir de users.tl_id del coder. El correo del TL no se guarda en ningún lado aparte: siempre se resuelve con este JOIN.*/
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

// Envía el correo de interés.
// Recibe los datos ya listos (no hace queries) para que sea una función simple y fácil de probar/reutilizar.
async function sendInterestEmail({ tlEmail, tlName, recruiterName, company, recruiterEmail, coderName }) {
    const mailOptions = {
    from: process.env.MAIL_USER,
    to: tlEmail,
    subject: `Hay un nuevo interés en tu coder: ${coderName}`,
    text: `Hola ${tlName},

El reclutador ${recruiterName} de la empresa ${company} (contacto: ${recruiterEmail})
ha mostrado interés en tu coder ${coderName}.

Puedes revisar el perfil del coder y ponerte en contacto con el reclutador
para continuar el proceso.

— Altea`
    };

  // nodemailer lanza excepción si el envío falla; quien llama decide si hace ROLLBACK.
    await transporter.sendMail(mailOptions);
}

module.exports = { getTLByCoderId, sendInterestEmail };