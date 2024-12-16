import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const MangaDetails = () => {
    const { id } = useParams();
    const [mangaDetails, setMangaDetails] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const chaptersPerPage = 10;

    useEffect(() => {
        const fetchMangaDetails = async () => {
            try {
                setLoading(true);
                const mangaResponse = await axios.get(`https://api.mangadex.org/manga/${id}`);
                const chaptersResponse = await axios.get(`https://api.mangadex.org/chapter?manga=${id}&limit=100`);
                setMangaDetails(mangaResponse.data.data);
                setChapters(chaptersResponse.data.data);
            } catch (err) {
                setError(`Failed to load manga details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchMangaDetails();
    }, [id]);

    const paginatedChapters = chapters.slice(
        (currentPage - 1) * chaptersPerPage,
        currentPage * chaptersPerPage
    );

    const handleNextPage = () => currentPage * chaptersPerPage < chapters.length && setCurrentPage((prev) => prev + 1);
    const handlePreviousPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>{mangaDetails?.attributes?.title?.en || 'Untitled Manga'}</h1>
            <p>{mangaDetails?.attributes?.description?.en || 'No description available.'}</p>
            <h2>Chapters</h2>
            <ul>
                {paginatedChapters.map((chapter) => (
                    <li key={chapter.id}>
                        <Link to={`/chapter/${chapter.id}`} className="text-blue-500 underline">
                            Chapter {chapter.attributes?.chapter || 'Unknown'}: {chapter.attributes?.title || 'No Title'}
                        </Link>
                    </li>
                ))}
            </ul>
            <div>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span> Page {currentPage} of {Math.ceil(chapters.length / chaptersPerPage)} </span>
                <button onClick={handleNextPage} disabled={currentPage * chaptersPerPage >= chapters.length}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default MangaDetails;
