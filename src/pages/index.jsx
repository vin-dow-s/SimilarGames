import { useEffect, useState } from "react"
import Head from "next/head"
import Image from "next/image"
import { Skeleton } from "@nextui-org/react"
import "../app/styles/globals.css"

export default function Home() {
    const [gameTitle, setGameTitle] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [gameSuggestions, setGameSuggestions] = useState([])
    const [selectedGame, setSelectedGame] = useState(null)
    const [similarGames, setSimilarGames] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingSimilarGames, setLoadingSimilarGames] = useState(false)

    //Function to fetch IGDB games suggestions dynamically based on input title (each 700ms)
    useEffect(() => {
        if (gameTitle) {
            setLoading(true)
            const fetchGamesSuggestions = async () => {
                const endpoint = `/api/fetchGamesSuggestions?title=${encodeURIComponent(
                    gameTitle
                )}`

                try {
                    const response = await fetch(endpoint)
                    const data = await response.json()
                    setGameSuggestions(data)
                    setLoading(false)
                } catch (error) {
                    console.error("Error fetching game suggestions:", error)
                    setLoading(false)
                }
            }

            const timeoutId = setTimeout(() => {
                fetchGamesSuggestions()
            }, 700)

            return () => clearTimeout(timeoutId)
        } else {
            setGameSuggestions([])
            setLoading(false)
        }
    }, [gameTitle])

    //Function to handle game selection from suggestions
    const handleSelectGame = (suggestion) => {
        setGameTitle(suggestion.volumeInfo.title)
        setSelectedGame(suggestion)
        setShowSuggestions(false)
        handleFetchSimilarGames(suggestion)
        setLoadingSimilarGames(true)
    }

    //Function to get 3 similar books titles THEN fetch their data from Google Books
    const handleFetchSimilarGames = async (selectedGame) => {
        setLoading(true)
        setLoadingSimilarGames(true)

        try {
            const gameDescription = selectedGame.volumeInfo.description

            //Fetch titles of similar books based on the description of the selected book
            const similarGamesRes = await fetch(
                "/api/getThreeSimilarGamesTitles",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: gameDescription }),
                }
            )
            const { titles: similarGamesTitles } = await similarGamesRes.json()

            //Fetch books data from Google Books API
            const gamesDataRes = await fetch("/api/fetchIGDB", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titles: similarGamesTitles }),
            })
            const gamesData = await gamesDataRes.json()

            const limitedGamesData = gamesData.items.slice(0, 3)

            setSimilarGames(limitedGamesData)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
            setLoadingSimilarGames(false)
        }
    }

    return (
        <>
            <Head>
                <title>Find Similar Videogames</title>
                <meta
                    name="description"
                    content="Search for a videogame and get similar suggestions based on its description."
                />
            </Head>
            <div
                className={`relative flex flex-col items-center ${
                    loadingSimilarGames || similarGames.length > 0
                        ? "justify-center"
                        : "lg:justify-start lg:pt-44 justify-start"
                } min-h-dvh py-8 px-4 sm:px-6 lg:px-8`}
            >
                <h1 className="text-4xl lg:text-5xl font-bold lobster-two-regular mt-12">
                    Find Similar Videogames
                </h1>
                <form className="mt-6 w-full max-w-lg mb-12">
                    <div className="relative flex items-center w-full max-w-lg">
                        <input
                            type="text"
                            value={gameTitle}
                            onChange={(e) => {
                                setGameTitle(e.target.value)
                                setShowSuggestions(true)
                                setLoading(true)
                            }}
                            placeholder="Enter the title of a game..."
                            required
                            className="flex-1 px-6 py-3  border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                            onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 100)
                            }}
                            onFocus={() => {
                                setShowSuggestions(true)
                            }}
                        />

                        {showSuggestions && gameSuggestions.length > 0 && (
                            <ul className="absolute w-full left-0 top-14 z-10 border border-gray-300 bg-white rounded-md shadow-lg">
                                {gameSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="flex h-16 [&:not(:last-child)]:border-b-2 justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                                        onMouseDown={() =>
                                            handleSelectGame(suggestion)
                                        }
                                    >
                                        <div className="flex-1 truncate">
                                            <span
                                                className="block truncate"
                                                style={{
                                                    maxWidth: "90%",
                                                }}
                                            >
                                                {suggestion.volumeInfo.title}
                                            </span>
                                        </div>
                                        {suggestion.volumeInfo.imageLinks
                                            ?.thumbnail && (
                                            <Image
                                                src={suggestion.volumeInfo.imageLinks.thumbnail.replace(
                                                    "http:",
                                                    "https:"
                                                )}
                                                alt={`Cover of the game ${suggestion.volumeInfo.title}`}
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                style={{
                                                    width: "32px",
                                                    height: "auto",
                                                }}
                                                className="rounded"
                                            />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            onClick={(event) => {
                                event.preventDefault()
                                selectedGame &&
                                    (setGameTitle(
                                        selectedGame.volumeInfo.title
                                    ),
                                    handleFetchSimilarGames(selectedGame))
                            }}
                            type="submit"
                            disabled={loading}
                            className="relative flex justify-center items-center w-16 h-12 text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50"
                        >
                            {loading ? (
                                <div className="dot-flashing"></div>
                            ) : (
                                <Image
                                    src="/refresh-line.svg"
                                    alt="Refresh Icon"
                                    width={24}
                                    height={24}
                                />
                            )}
                        </button>
                    </div>
                </form>

                {loadingSimilarGames ? (
                    <div className="mt-8 mb-20 w-full max-w-6xl">
                        <ul className="list-none flex flex-wrap -mx-2">
                            {Array.from({ length: 3 }, (_, index) => (
                                <li
                                    key={index}
                                    className="w-full md:w-1/3 lg:w-1/3 xl:w-1/3  max-sm:mb-16 p-2 flex flex-col items-center"
                                >
                                    <Skeleton className="w-32 h-48 rounded mb-4 bg-gray-600 animate-pulse" />
                                    <Skeleton className="w-40 text-center h-6 rounded mt-2 mb-2  bg-gray-600 animate-pulse" />
                                    <Skeleton className="w-12 h-3 rounded mb-6  bg-gray-600 animate-pulse" />
                                    <div
                                        className="flex flex-col items-start"
                                        style={{ marginBottom: "4px" }}
                                    >
                                        <Skeleton className="w-80 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-72 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-64 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-80 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-72 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-72 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-48 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-64 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                        <Skeleton className="w-64 h-3 rounded mb-1 bg-gray-600 animate-pulse" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    similarGames.length > 0 && (
                        <div className="mt-8 mb-20 w-full max-w-6xl">
                            <ul className="list-none flex flex-wrap -mx-2">
                                {similarGames.map(
                                    (book, index) =>
                                        book && (
                                            <li
                                                key={index}
                                                className="w-full md:w-1/3 lg:w-1/3 xl:w-1/3  max-sm:mb-16 p-2 flex flex-col items-center"
                                            >
                                                {book.volumeInfo.imageLinks
                                                    ?.thumbnail && (
                                                    <a
                                                        href={
                                                            book.volumeInfo
                                                                .infoLink
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <div className="relative w-32 h-48 rounded cursor-pointer">
                                                            <Image
                                                                src={book.volumeInfo.imageLinks.thumbnail.replace(
                                                                    "http:",
                                                                    "https:"
                                                                )}
                                                                alt={`Cover of the game ${book.volumeInfo.title}`}
                                                                sizes="100vw"
                                                                width={0}
                                                                height={0}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                }}
                                                                className="rounded opacity-100 hover:opacity-50 transition-opacity duration-200 ease-in-out"
                                                            />
                                                        </div>
                                                    </a>
                                                )}
                                                <div className="content-center text-center">
                                                    <h3 className="text-xl font-semibold mt-4">
                                                        {book.volumeInfo
                                                            .title &&
                                                        book.volumeInfo.title
                                                            .length > 30
                                                            ? book.volumeInfo.title.substring(
                                                                  0,
                                                                  30
                                                              ) + "..."
                                                            : book.volumeInfo
                                                                  .title}
                                                    </h3>

                                                    <p className="text-gray-300 text-sm">
                                                        {
                                                            book.volumeInfo
                                                                .authors[0]
                                                        }
                                                    </p>
                                                    <p className="text-gray-400 text-sm pt-4 text-left">
                                                        {book.volumeInfo.description?.substring(
                                                            0,
                                                            400
                                                        )}
                                                        ...
                                                    </p>
                                                </div>
                                            </li>
                                        )
                                )}
                            </ul>
                        </div>
                    )
                )}
                <div className="absolute bottom-0 mb-2 text-sm">
                    © 2024 by{" "}
                    <a href="https://vindows.dev" className="italic">
                        Vindows
                    </a>
                    .
                </div>
            </div>
        </>
    )
}
