import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [manhwaList, setManhwaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchManhwaData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://api.mangadex.org/manga');

                // Fetch cover images for each manhwa using their relationship ID
                const manhwaDataWithCover = await Promise.all(
                    response.data.data.map(async (manhwa) => {
                        const coverRelationship = manhwa.relationships.find(
                            (relationship) => relationship.type === 'cover_art'
                        );

                        // Check if a valid cover relationship is found
                        if (coverRelationship) {
                            const coverId = coverRelationship.id;
                            try {
                                // Fetch the cover image details based on the cover ID
                                const coverResponse = await axios.get(`https://api.mangadex.org/cover/${coverId}`);
                                const coverFileName = coverResponse.data.data.attributes.fileName;

                                // Attach the cover image filename to the manhwa data
                                return {
                                    ...manhwa,
                                    coverFileName,
                                };
                            } catch (coverError) {
                                console.error(`Error fetching cover image for ${manhwa.id}:`, coverError);
                                return {
                                    ...manhwa,
                                    coverFileName: null, // Return a fallback value if cover fetching fails
                                };
                            }
                        }
                        // If no cover image relationship exists, return the original manhwa data
                        return manhwa;
                    })
                );
                setManhwaList(manhwaDataWithCover);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchManhwaData();
    }, []);

    return (
        <div>
            <h1>Manhwa List</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <ul>
                {manhwaList.map((manhwa) => (
                    <li key={manhwa.id}>
                        <h2>{manhwa.attributes.title.en}</h2>
                        <p>{manhwa.attributes.description.en}</p>
                        {manhwa.coverFileName ? (
                            <img
                                src={`https://uploads.mangadex.org/covers/${manhwa.id}/${manhwa.coverFileName}`}
                                alt={`${manhwa.attributes.title.en} cover`}
                            />
                        ) : (
                            <p>No cover available</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
