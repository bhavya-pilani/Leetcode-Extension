const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/hint", async (req, res) => {
  const { title } = req.body;

  const prompt = `
    "Give me 3 progressive hints (without code) to solve the LeetCode problem titled "${title}". The first hint should be high-level intuition, the second should point toward an approach or algorithm, and the third can guide me toward edge cases or implementation strategy — but not the full solution." ,give hints in a order such that they will make solve .
    Format your response strictly as a numbered list like:
    1. ...
    2. ...
    3. ...
  `;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const rawText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract hints from the numbered list using regex
    const hints = rawText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /^[0-9]\./.test(line)) // lines starting with 1. 2. 3.
      .map((line) => line.replace(/^[0-9]\.\s*/, "")); // remove numbering

    res.json({ hints: hints.length ? hints : ["No hint generated."] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ hints: ["Error generating hint."] });
  }
});

app.listen(3000, () =>
  console.log("🚀 API server running on http://localhost:3000")
);
