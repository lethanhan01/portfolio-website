const nodemailer = require('nodemailer');

function json(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

function sanitizeHeaderValue(value) {
    return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

module.exports = async (req, res) => {
    // Basic CORS (useful for local dev). Same-origin deploy works without this.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    if (req.method !== 'POST') {
        return json(res, 405, { message: 'Method Not Allowed' });
    }

    const body = await readJsonBody(req);
    if (body === null) {
        return json(res, 400, { message: 'Invalid JSON body' });
    }

    const name = sanitizeHeaderValue(body.name);
    const company = sanitizeHeaderValue(body.company);
    const email = sanitizeHeaderValue(body.email);
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
        return json(res, 400, {
            message: 'Missing required fields: name, email, message',
        });
    }

    const smtpUser = process.env.FOLIO_EMAIL;
    const smtpPass = process.env.FOLIO_PASSWORD;

    if (!smtpUser || !smtpPass) {
        return json(res, 500, {
            message:
                'Server email is not configured (set FOLIO_EMAIL and FOLIO_PASSWORD).',
        });
    }

    const toList = (process.env.FOLIO_TO_EMAILS || smtpUser)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    try {
        await transporter.verify();

        await transporter.sendMail({
            from: `"${name}" <${smtpUser}>`,
            to: toList,
            replyTo: email,
            subject: `${name} <${email}> ${company ? `from ${company}` : ''} submitted a contact form`,
            text: message,
        });

        return json(res, 200, { message: 'success' });
    } catch (e) {
        // Avoid leaking credentials / full stack traces.
        return json(res, 500, { message: 'Failed to send email' });
    }
};
