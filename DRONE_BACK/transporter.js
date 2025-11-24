// DRONE_BACK/transporter.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "ac0b2ddeaec5c9",        // 👈 TU USER
    pass: "edca741a5592db"         // 👈 TU PASSWORD REAL
  }
});

export default transporter;
