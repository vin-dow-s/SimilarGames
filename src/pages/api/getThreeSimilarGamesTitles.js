// pages/api/getThreeSimilarGamesTitles.js
import OpenAI from "openai"

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    const { description } = req.body

    const prompt = `Given the following videogame description, give me the titles of 3 similar (not the exact same one) videogames (similar in terms of style, universe or gameplay mechanics...), simply separated by a comma, nothing else. Description:\n\n${description}`

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-0125-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 64,
            top_p: 1.0,
            frequency_penalty: 0.5,
            presence_penalty: 0.0,
        })

        const messageContent = response.choices[0].message.content

        const titles = messageContent.trim().split(", ")
        res.status(200).json({ titles })
    } catch (error) {
        console.error("Error finding similar games:", error)
        res.status(500).json({ error: "Failed to find similar games" })
    }
}
