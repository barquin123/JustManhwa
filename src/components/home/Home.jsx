import { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../providers/mangaProvider';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
    const { mangaData, loading, error, fetchAdditionalManga, initialFetchDone } = useContext(MangaContext);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the initial page from the URL or local storage
    const getInitialPage = () => {
        const params = new URLSearchParams(location.search);
        return parseInt(params.get('page'), 10) || parseInt(localStorage.getItem('currentPage'), 10) || 1;
    };

    const [currentPage, setCurrentPage] = useState(getInitialPage);
    const [descriptionStates, setDescriptionStates] = useState({});

    const paginatedData = Array.isArray(mangaData)
        ? mangaData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    // Save the current page to localStorage and update the URL
    const updatePageState = (newPage) => {
        setCurrentPage(newPage);
        localStorage.setItem('currentPage', newPage);

        const params = new URLSearchParams(location.search);
        params.set('page', newPage);
        navigate({ search: params.toString() }, { replace: true });
    };

    const handleNextPage = () => {
        const newPage = currentPage + 1;
        updatePageState(newPage);
        window.scrollTo(0, 0);

        // Check if more manga data is needed
        if (newPage * itemsPerPage > mangaData.length && initialFetchDone) {
            fetchAdditionalManga(mangaData.length, 10);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            updatePageState(currentPage - 1);
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

    // Ensure page consistency when component mounts or dependencies change
    useEffect(() => {
        if (
            initialFetchDone &&
            paginatedData.length === 0 &&
            mangaData.length < currentPage * itemsPerPage
        ) {
            fetchAdditionalManga(mangaData.length, 10);
        }
    }, [currentPage, initialFetchDone, paginatedData.length, mangaData.length, fetchAdditionalManga]);

    return (
        <div className="max-w-screen-lg m-auto">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <ul className="flex flex-wrap gap-4 justify-evenly">
                {paginatedData.map((manhwa) => (
                    <li className="min-h-96 mb-5 max-w-[384px]" key={manhwa.id}>
                        <Link to={`/details/${manhwa.id}`}>
                            {manhwa.coverFileName ? (
                                <img
                                    className="max-w-96 m-auto"
                                    src={`https://mangareader-backend.onrender.com/api/proxy-image/${manhwa.id}/${manhwa.coverFileName}`}
                                    loading="lazy"
                                    alt={`${manhwa.attributes?.title?.en} cover`}
                                />
                            ) : (
                                <p>No cover available</p>
                            )}
                        </Link>
                        <h2 className="font-bold text-xl">{manhwa.attributes?.title?.en || 'Untitled'}</h2>
                        <p>
                            <strong>Description:</strong>{' '}
                            {descriptionStates[manhwa.id]
                                ? manhwa.attributes?.description?.en || 'No description available.'
                                : truncatedDescription(manhwa.attributes?.description?.en, 100)}
                        </p>
                        {manhwa.attributes?.description?.en &&
                            manhwa.attributes.description.en.length > 100 && (
                                <button
                                    onClick={() => toggleDescription(manhwa.id)}
                                    className="text-white underline"
                                >
                                    {descriptionStates[manhwa.id] ? 'See Less' : 'See More'}
                                </button>
                            )}
                        <p>
                            <strong>Author(s):</strong> {manhwa.authors}
                        </p>
                        <p>
                            <strong>Artist(s):</strong> {manhwa.artists}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="text-center mt-6">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 disabled:opacity-50"
                >
                    Previous
                </button>
                <span> Page {currentPage} </span>
                <button
                    onClick={handleNextPage}
                    disabled={paginatedData.length < itemsPerPage && !loading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md ml-2 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Home;
