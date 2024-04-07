// pages/api/fetchIGDB.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const { titles } = req.body
    const accessToken = process.env.IGDB_ACCESS_TOKEN

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
        return res.status(400).json({ error: "No titles received" })
    }

    const games = await Promise.all(
        titles.map(async (title) => {
            try {
                const body = `search "${title}"; fields name, cover.url, genres.name, platforms.name, summary; limit 1;`
                const response = await fetch(`https://api.igdb.com/v4/games`, {
                    method: "POST",
                    headers: {
                        "Client-ID": process.env.IGDB_API_CLIENT_KEY,
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "text/plain",
                    },
                    body: body,
                })
                const data = await response.json()
                if (data && data.length > 0) {
                    return data[0]
                }
            } catch (error) {
                console.error(`Error fetching game: ${title}`, error)
                return null
            }
        })
    )

    res.status(200).json({ games: games.filter((game) => game != null) })
}
