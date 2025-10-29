import nodemailer from "nodemailer";
import { htmlEmail } from "./ejemplo.js";
import dotenv from "dotenv";

dotenv.config();

console.log("Microservicio de envío de mails funcionando");


const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "juanpablomasuet@gmail.com", // your email
        pass: process.env.GOOGLE_API_KEY // the app password you generated, paste without spaces
    },
    secure: true,
    port: 465
});
(async () => {
  await transporter.sendMail({
  from: "juanpablomasuet@gmail.com", // your email
  to: "masuetjuanpablo@gmail.com", // the email address you want to send an email to
  subject: "Prueba de mail", // The title or subject of the email
  html: htmlEmail // I like sending my email as html, you can send \
           // emails as html or as plain text
});

console.log("Email sent");
})();