import  nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";


export const transports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEEMAILER_PASSWORD!,
    }
})
export const sendWelcomeEmail = async ({email , name , intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);
    const mailOptions = {
        from :`"Big-Bull <bigbull@implement.pro"`,
        to:email,
        subject:`Welcome to Big-Bull -your stock market toolkit is ready!`,
        text: 'Thanks for joining Big-Bull',

        html: htmlTemplate,
    }
    await transports.sendMail(mailOptions);
}
