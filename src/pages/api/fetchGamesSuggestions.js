// pages/api/fetchGamesSuggestions.js

export default async function handler(req, res) {
    const accessToken = process.env.IGDB_ACCESS_TOKEN

    if (req.method === "GET") {
        const { title } = req.query

        try {
            const response = await fetch(`https://api.igdb.com/v4/games`, {
                method: "POST",
                headers: {
                    "Client-ID": process.env.IGDB_API_CLIENT_KEY,
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "text/plain",
                },
                body: `search "${title}"; fields name, cover.url, genres.name, platforms.name, summary; limit 5;`,
            })

            const games = await response.json()
            res.status(200).json(games)
        } catch (error) {
            console.error("Error fetching game suggestions:", error)
            res.status(500).json({ error: "Error fetching game suggestions" })
        }
    } else {
        res.setHeader("Allow", ["GET"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
