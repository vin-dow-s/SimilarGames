// pages/api/fetchIGDB.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const { titles } = req.body

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
        return res.status(400).json({ error: "No titles received" })
    }

    const fetchedGames = await Promise.all(
        titles.map(async (title) => {
            const API_URL = `${encodeURIComponent(title)}&key=${
                process.env.IGDB_API_KEY
            }`
            try {
                const response = await fetch(API_URL)
                const data = await response.json()
                if (data.items && data.items.length > 0) {
                    const game = data.items[0]
                    return game
                }
            } catch (error) {
                console.error(`Error fetching game: ${title}`, error)
                return null
            }
        })
    )

    const games = fetchedGames.filter((game) => game !== null)

    res.status(200).json({ items: games })
}
