import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    host: 'live.smtp.mailtrap.io',
    port: 587,
    auth: {
        user: 'api',
        pass: '22398517d4775996e4b11425d108f90e',
    },
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendMail(subject: string, html: string, to: string) {
    // send mail with defined transport object
    const info = await transport.sendMail({
        from: 'info@boardo.site', // sender address
        to: `${to}`, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    });

    console.log('Message sent: %s', info.messageId);
}
