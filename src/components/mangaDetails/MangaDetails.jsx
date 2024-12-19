import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const MangaDetails = () => {
    const { id } = useParams();
    const [mangaDetails, setMangaDetails] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiLimit = 100; // API fetch limit
    const transLang = 'en'; // Translated language

    // Fetch manga details and chapters from the API
    useEffect(() => {
        const fetchMangaDetails = async () => {
            try {
                setLoading(true);
                const mangaResponse = await axios.get(`https://mangareader-backend.onrender.com/api/manga/manga/${id}`);
                setMangaDetails(mangaResponse.data.data);

                // Store manga details in localStorage
                localStorage.setItem('mangaDetails', JSON.stringify(mangaResponse.data.data));

            } catch (err) {
                setError(`Failed to load manga details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        // Fetch all chapters
        const fetchAllChapters = async () => {
            let offset = 0;
            let fetchedChapters = [];
            try {
                setLoading(true);

                // Keep fetching until all chapters are retrieved
                while (true) {
                    const response = await axios.get(
                        `https://mangareader-backend.onrender.com/api/manga/chapter?manga=${id}&translatedLanguage[]=${transLang}&limit=${apiLimit}&offset=${offset}`
                    );
                    const newChapters = response.data.data;
                    fetchedChapters = [...fetchedChapters, ...newChapters];

                    // Break the loop if fewer than `apiLimit` chapters are fetched
                    if (newChapters.length < apiLimit) break;

                    offset += apiLimit; // Update the offset for the next batch
                }

                // Sort chapters by `chapter` in descending order
                fetchedChapters.sort((a, b) => {
                    const chapterA = parseFloat(a.attributes?.chapter || 0);
                    const chapterB = parseFloat(b.attributes?.chapter || 0);
                    return chapterB - chapterA;
                });

                setChapters(fetchedChapters);
            } catch (err) {
                setError(`Failed to load chapters: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        // First, check if manga details exist in localStorage
        const savedMangaDetails = localStorage.getItem('mangaDetails');
        const savedChapters = localStorage.getItem('chapters');

        if (savedMangaDetails && savedChapters && !id) {
            // If manga details are found in localStorage and no ID is in the URL, use the stored data
            setMangaDetails(JSON.parse(savedMangaDetails));
            setChapters(JSON.parse(savedChapters));
        } else {
            // Otherwise, fetch details from the API
            if (id) {
                fetchMangaDetails();
                fetchAllChapters();
            }
        }

    }, [id]); // Re-fetch when `id` changes

    // Store manga details and chapters to localStorage when they are fetched
    useEffect(() => {
        if (mangaDetails && chapters.length > 0) {
            localStorage.setItem('mangaDetails', JSON.stringify(mangaDetails));
            localStorage.setItem('chapters', JSON.stringify(chapters));
        }
    }, [mangaDetails, chapters]);

    if (loading && chapters.length === 0) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='max-w-5xl m-auto'>
            <h1>{mangaDetails?.attributes?.title?.en || 'Untitled Manga'}</h1>
            <p>{mangaDetails?.attributes?.description?.en || 'No description available.'}</p>
            <h2>Chapters</h2>
            <ul className='overflow-auto max-h-80'>
                {loading && <p>Loading chapters...</p>}
                {chapters.map((chapter) => (
                    <li key={chapter.id} className='text-white'>
                        <Link to={`/chapter/${chapter.id}`} className="text-blue-500 underline">
                            Chapter {chapter.attributes?.chapter || 'Unknown'}: {chapter.attributes?.title || ''}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MangaDetails;
