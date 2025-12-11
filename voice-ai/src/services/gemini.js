import axios from "axios";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export async function askGemini(message) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;

    const body = {
        contents: [
            {
                parts: [{ text: message }]
            }
        ]
    };

    const res = await axios.post(url, body);
    return res.data.candidates[0].content.parts[0].text;
}
