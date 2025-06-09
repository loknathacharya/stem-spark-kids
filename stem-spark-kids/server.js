// --- NEW AND IMPROVED server.js ---
// This version uses the direct REST API for better reliability.

import express from 'express';
import 'dotenv/config'; // Loads our secret API key

// --- Configuration ---
const app = express();
const port = process.env.PORT || 8080;

// --- Middleware ---
app.use(express.json());
app.use(express.static('public'));

// --- API Key Setup ---
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

// --- API Endpoint ---
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }
    
    // Choose the model you want to use. 'gemini-1.5-flash-latest' is a great choice.
    const modelName = 'gemini-1.5-flash-latest';
    
    // The direct URL to the Google AI REST API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    // The data structure (payload) the REST API expects
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    // Make the direct API call using fetch
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      // If Google's API returns an error, send it back to the user
      const errorText = await apiResponse.text();
      console.error("Google API Error:", errorText);
      return res.status(apiResponse.status).json({ error: `Google API Error: ${errorText}` });
    }

    const data = await apiResponse.json();

    // Extract the generated text from the response
    // The structure is a bit deep: response -> candidates -> content -> parts -> text
    const generatedText = data.candidates[0].content.parts[0].text;

    // Send the result back to the frontend
    res.json({ text: generatedText });

  } catch (error) {
    console.error("Server Error in /api/generate:", error);
    res.status(500).json({ error: 'Failed to generate content due to a server error.' });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});