require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const upload = multer({ dest: "uploads/" });
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Handle audio transcription
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const originalPath = req.file.path;
    const renamedPath = path.join("uploads", `${req.file.filename}.webm`);
    fs.renameSync(originalPath, renamedPath);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(renamedPath));
    formData.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    fs.unlinkSync(renamedPath); // Cleanup temporary file
    res.json({ text: response.data.text });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

// Handle GPT response
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a compassionate and non-judgmental listener. Respond in a calm, supportive tone with short, emotionally validating sentences. Do not go on long philosophical tangents."
          },
          {
            role: "user",
            content: userMessage,
          }
        ],
        max_tokens: 60
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = gptResponse.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("GPT error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get GPT response" });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
