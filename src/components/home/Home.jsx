import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
    const itemsPerPage = 10;
    const originalLanguage = 'ko';
    const navigate = useNavigate();
    const location = useLocation();

    // Get initial page from URL or localStorage
    const getInitialPage = () => {
        const params = new URLSearchParams(location.search);
        return parseInt(params.get('page'), 10) || parseInt(localStorage.getItem('currentPage'), 10) || 1;
    };

    const [currentPage, setCurrentPage] = useState(getInitialPage);
    const [manhwaList, setManhwaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [descriptionStates, setDescriptionStates] = useState({});

    // Fetch manhwa data
    const fetchManhwaData = async (page) => {
        try {
            setLoading(true);
            setError(null);
    
            const offset = (page - 1) * itemsPerPage;
            const response = await axios.get(
                `https://mangareader-backend.onrender.com/api/manga/manga?originalLanguage[]=${originalLanguage}&limit=${itemsPerPage}&offset=${offset}`
            );
    
            const manhwaDataWithDetails = await Promise.all(
                response.data.data.map(async (manhwa) => {
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
    
                    // Fetch author and artist names
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
    
            // Sort by latest (assuming `attributes.updatedAt` exists)
            manhwaDataWithDetails.sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt));
    
            setManhwaList(manhwaDataWithDetails);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    

    // Update page on URL or state change
    useEffect(() => {
        localStorage.setItem('currentPage', currentPage);

        const params = new URLSearchParams(location.search);
        if (parseInt(params.get('page'), 10) !== currentPage) {
            params.set('page', currentPage);
            navigate({ search: params.toString() }, { replace: true });
        }

        fetchManhwaData(currentPage);
    }, [currentPage, navigate, location.search]);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
        window.scrollTo(0, 0);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
            window.scrollTo(0, 0);
        }
    };

    const toggleDescription = (id) => {
        setDescriptionStates((prevStates) => ({
            ...prevStates,
            [id]: !prevStates[id],
        }));
    };

    const truncatedDescription = (text, length = 100) => {
        if (!text) return '';
        return text.length > length ? text.slice(0, length) + '...' : text;
    };

    return (
        <div className='max-w-screen-lg m-auto'>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <ul className='flex flex-wrap gap-4 justify-evenly'>
                {manhwaList.map((manhwa) => (
                    <li className='min-h-96 mb-5 max-w-[384px]' key={manhwa.id}>
                        <Link to={`/details/${manhwa.id}`}>
                            {manhwa.coverFileName ? (
                                <img
                                    className='max-w-96 m-auto'
                                    src={`https://mangareader-backend.onrender.com/api/proxy-image/${manhwa.id}/${manhwa.coverFileName}`}
                                    loading="lazy"
                                    alt={`${manhwa.attributes?.title?.en} cover`}
                                />
                            ) : (
                                <p>No cover available</p>
                            )}
                        </Link>
                        <h2 className='font-bold text-xl'>{manhwa.attributes?.title?.en || 'Untitled'}</h2>
                        <p>
                            <strong>Description:</strong>{' '}
                            {descriptionStates[manhwa.id]
                                ? manhwa.attributes?.description?.en || 'No description available.'
                                : truncatedDescription(manhwa.attributes?.description?.en, 100)}
                        </p>
                        {manhwa.attributes?.description?.en &&
                            manhwa.attributes.description.en.length > 100 && (
                                <button onClick={() => toggleDescription(manhwa.id)}>
                                    {descriptionStates[manhwa.id] ? 'See Less' : 'See More'}
                                </button>
                            )}
                        <p><strong>Author(s):</strong> {manhwa.authors}</p>
                        <p><strong>Artist(s):</strong> {manhwa.artists}</p>
                    </li>
                ))}
            </ul>

            <div className='text-center mt-6'>
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className='px-4 py-2 bg-gray-500 text-white rounded-md mr-2 disabled:opacity-50'
                >
                    Previous
                </button>
                <span> Page {currentPage} </span>
                <button
                    onClick={handleNextPage}
                    className='px-4 py-2 bg-gray-500 text-white rounded-md ml-2 disabled:opacity-50'
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Home;
