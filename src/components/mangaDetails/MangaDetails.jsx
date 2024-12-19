import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const MangaDetails = () => {
    const { id } = useParams();
    const [mangaDetails, setMangaDetails] = useState(null);
    const [coverImage, setCoverImage] = useState(null); // State to store cover image URL
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiLimit = 100; // API fetch limit
    const transLang = 'en'; // Translated language

    useEffect(() => {
        const fetchMangaDetails = async () => {
            try {
                setLoading(true);
                const mangaResponse = await axios.get(`https://mangareader-backend.onrender.com/api/manga/manga/${id}`);

                setMangaDetails(mangaResponse.data.data);

                // Fetch the cover image
                const coverRelationship = mangaResponse.data.data.relationships.find((rel) => rel.type === 'cover_art');
                if (coverRelationship) {
                    const coverResponse = await axios.get(
                        `https://mangareader-backend.onrender.com/api/manga/cover/${coverRelationship.id}`
                    );
                    const fileName = coverResponse.data.data.attributes.fileName;
                    const coverUrl = `https://uploads.mangadex.org/covers/${id}/${fileName}`;
                    setCoverImage(coverUrl); // Set the cover image URL
                }

                // Store manga details in localStorage
                localStorage.setItem('mangaDetails', JSON.stringify(mangaResponse.data.data));
            } catch (err) {
                setError(`Failed to load manga details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        const fetchAllChapters = async () => {
            let offset = 0;
            let fetchedChapters = [];
            try {
                setLoading(true);

                while (true) {
                    const response = await axios.get(
                        `https://mangareader-backend.onrender.com/api/manga/chapter?manga=${id}&translatedLanguage[]=${transLang}&limit=${apiLimit}&offset=${offset}`
                    );
                    const newChapters = response.data.data;
                    fetchedChapters = [...fetchedChapters, ...newChapters];

                    if (newChapters.length < apiLimit) break;

                    offset += apiLimit;
                }

                fetchedChapters.sort((a, b) => {
                    const chapterA = parseFloat(a.attributes?.chapter || 0);
                    const chapterB = parseFloat(b.attributes?.chapter || 0);
                    return chapterB - chapterA;
                });

                // Filter out repeating chapters based on the `chapter` value and exclude chapters with page = 0
                const uniqueChapters = Array.from(
                    new Map(
                        fetchedChapters
                            .filter((chapter) => chapter.attributes?.pages > 0) // Exclude chapters with pages = 0
                            .map((chapter) => [chapter.attributes?.chapter, chapter]) // Map by chapter value to remove duplicates
                    ).values()
                );

                setChapters(uniqueChapters);
            } catch (err) {
                setError(`Failed to load chapters: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        const savedMangaDetails = localStorage.getItem('mangaDetails');
        const savedChapters = localStorage.getItem('chapters');

        if (savedMangaDetails && savedChapters && !id) {
            setMangaDetails(JSON.parse(savedMangaDetails));
            setChapters(JSON.parse(savedChapters));
        } else {
            if (id) {
                fetchMangaDetails();
                fetchAllChapters();
            }
        }
    }, [id]);

    useEffect(() => {
        if (mangaDetails && chapters.length > 0) {
            localStorage.setItem('mangaDetails', JSON.stringify(mangaDetails));
            localStorage.setItem('chapters', JSON.stringify(chapters));
        }
    }, [mangaDetails, chapters]);

    if (loading && chapters.length === 0) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="max-w-5xl m-auto pt-8">
            <div className="flex gap-x-5">
                {coverImage && (
                    <img
                        src={coverImage}
                        alt={`${mangaDetails?.attributes?.title?.en || 'Manga'} cover`}
                        className="max-w-60 object-cover mb-4"
                    />
                )}
                <div>
                    <h1 className="font-bold text-4xl">{mangaDetails?.attributes?.title?.en || 'Untitled Manga'}</h1>
                    <p>{mangaDetails?.attributes?.description?.en || 'No description available.'}</p>
                </div>
            </div>
            <h2 className="font-bold text-xl">Chapters</h2>
            <ul className="overflow-auto max-h-80 w-fit no-scrollbar">
                {loading && <p>Loading chapters...</p>}
                {chapters.map((chapter) => (
                    <li key={chapter.id} className="text-white">
                        <Link to={`/chapter/${chapter.id}`} className="text-white">
                            Chapter {chapter.attributes?.chapter || 'Unknown'}: {chapter.attributes?.title || ''}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MangaDetails;
