import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const MangaContext = createContext();

export const MangaProvider = ({ children }) => {
    const [mangaData, setMangaData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialFetchDone, setInitialFetchDone] = useState(false); // Track if the first 1500 are fetched

    const originalLanguage = 'ko';

    const fetchAllMangaData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if data already exists in localStorage
            const storedData = localStorage.getItem('mangaData');
            if (storedData) {
                setMangaData(JSON.parse(storedData));
                setInitialFetchDone(true); // Mark initial fetch as done
                setLoading(false);
                return;
            }

            let allManga = [];
            let offset = 0;
            const limit = 100; // Fetch in batches
            const maxInitialFetch = 100; // Limit to the first 1500 mangas

            while (allManga.length < maxInitialFetch) {
                const response = await axios.get(
                    `https://mangareader-backend.onrender.com/api/manga/manga?originalLanguage[]=${originalLanguage}&limit=${limit}&offset=${offset}`
                );

                const data = response.data.data;
                if (data.length === 0) break; // No more data to fetch

                allManga = [...allManga, ...data];
                offset += limit;

                // Stop if we've reached 1500
                if (allManga.length >= maxInitialFetch) {
                    allManga = allManga.slice(0, maxInitialFetch); // Trim to exactly 1500
                    break;
                }
            }

            // Process fetched data
            const allMangaWithDetails = await Promise.all(
                allManga.map(async (manhwa) => {
                    const relationships = manhwa.relationships;

                    // Fetch cover art
                    const coverRelationship = relationships.find((rel) => rel.type === 'cover_art');
                    let coverFileName = null;
                    if (coverRelationship) {
                        try {
                            const coverResponse = await axios.get(
                                `https://mangareader-backend.onrender.com/api/manga/cover/${coverRelationship.id}`
                            );
                            coverFileName = coverResponse.data.data.attributes.fileName;
                        } catch (coverError) {
                            console.error(`Error fetching cover for ${manhwa.id}:`, coverError);
                        }
                    }

                    const authors = relationships
                        .filter((rel) => rel.type === 'author')
                        .map((author) => author.attributes?.name)
                        .join(', ') || 'Unknown Author';

                    const artists = relationships
                        .filter((rel) => rel.type === 'artist')
                        .map((artist) => artist.attributes?.name)
                        .join(', ') || 'Unknown Artist';

                    return {
                        ...manhwa,
                        coverFileName,
                        authors,
                        artists,
                    };
                })
            );

            // Sort by latest update
            allMangaWithDetails.sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt));

            // Save to state and localStorage
            setMangaData(allMangaWithDetails);
            localStorage.setItem('mangaData', JSON.stringify(allMangaWithDetails));
            setInitialFetchDone(true); // Mark initial fetch as done
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdditionalManga = async (offset, limit = 10) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://mangareader-backend.onrender.com/api/manga/manga?originalLanguage[]=${originalLanguage}&limit=${limit}&offset=${offset}`
            );
            const data = response.data.data;

            // Append new data
            setMangaData((prev) => [...prev, ...data]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllMangaData();
    }, []);

    return (
        <MangaContext.Provider
            value={{
                mangaData,
                loading,
                error,
                fetchAdditionalManga, // Expose additional fetch for paginated loading
                initialFetchDone, // Indicate if the first fetch is complete
            }}
        >
            {children}
        </MangaContext.Provider>
    );
};
