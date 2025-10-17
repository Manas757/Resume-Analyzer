if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}
const axios = require("axios")
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const pdf = require("pdf-parse");
const cors = require("cors");

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })

app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        const buffer = fs.readFileSync(req.file.path);
        const result = await pdf(buffer)

        console.log("Parsed PDF Text Length:", result.text.length);


        res.json({ text: result.text })
        fs.unlinkSync(req.file.path)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to parse PDF" });
    }
})

app.post("/analyze", async (req, res) => {
    try {
        const { resumeText, JobDescription } = req.body;

        if (!resumeText || !JobDescription) {
            return res.status(400).json({ error: "Resume text and job description are required." });
        }

        const prompt = `
      You are an expert career coach and ATS resume scanner.
      Analyze the following resume against the provided job description.
      Provide your analysis in a JSON format with ONLY the following keys: "atsScore", "matchingKeywords", "missingKeywords", and "suggestions".

      [JOB DESCRIPTION]
      ${JobDescription}

      [RESUME TEXT]
      ${resumeText}
    `;

        // 1. Switched to Groq API
        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

        // 2. Switched to use the new API Key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not set!");
            return res.status(500).json({ error: "Server configuration error: Missing API Key." });
        }
        console.log("Server is using Groq API Key.");

        const response = await axios.post(
            groqUrl,
            {
                // 3. Groq uses a "messages" array format
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant", // Using a fast Llama 3 model
                response_format: { type: "json_object" },
            },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        // 4. The response format is slightly different
        const analysisText = response.data.choices[0]?.message?.content;
        if (!analysisText) {
            throw new Error("Received an empty analysis from the AI.");
        }

        res.json(JSON.parse(analysisText));

    } catch (error) {
        // This will now give us detailed errors from the Groq API if any occur
        console.error("Error during analysis:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to analyze Resume" });
    }
});


app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));