import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (searchQuery) => {
        const cacheKey = `search_${searchQuery}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            console.log('Using cached data');
            setResults(JSON.parse(cachedData));
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `https://mangareader-backend.onrender.com/api/manga/manga?title=${encodeURIComponent(searchQuery)}`
            );

            const manhwaDataWithCovers = await Promise.all(
                response.data.data.filter((item) => item.attributes?.originalLanguage === 'ko').map(async (item) => {
                    const coverRelationship = item.relationships.find((rel) => rel.type === 'cover_art');
                    let coverFileName = null;

                    if (coverRelationship) {
                        try {
                            const coverResponse = await axios.get(
                                `https://mangareader-backend.onrender.com/api/manga/cover/${coverRelationship.id}`
                            );
                            coverFileName = coverResponse.data.data.attributes.fileName;
                        } catch (coverError) {
                            console.error(`Error fetching cover for ${item.id}:`, coverError);
                        }
                    }

                    return {
                        ...item,
                        coverFileName,
                    };
                })
            );

            localStorage.setItem(cacheKey, JSON.stringify(manhwaDataWithCovers));
            setResults(manhwaDataWithCovers);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            fetchData(query.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="max-w-screen-lg m-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for manhwa..."
                    className="border px-4 py-2 rounded w-full"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Search
                </button>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <ul className="flex flex-wrap gap-4 justify-evenly">
                {results.map((item) => (
                    <Link to={`/details/${item.id}`} key={item.id}>
                        <li key={item.id} className="min-h-96 mb-5 max-w-[384px]">
                            {item.coverFileName ? (
                                <img
                                    className="max-w-96 m-auto"
                                    src={`https://mangareader-backend.onrender.com/api/proxy-image/${item.id}/${item.coverFileName}`}
                                    alt={`${item.attributes?.title?.en} cover`}
                                />
                            ) : (
                                <p>No cover available</p>
                            )}
                            <h2 className="font-bold text-xl">
                                {item.attributes?.title?.en || 'Untitled'}
                            </h2>
                        </li>
                    </Link>
                    
                ))}
            </ul>
        </div>
    );
};

export default Search;
