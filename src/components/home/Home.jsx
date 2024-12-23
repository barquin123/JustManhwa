import React, { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../providers/mangaProvider';
import { Link } from 'react-router-dom';

const Home = () => {
    const { mangaData, loading, error, fetchAdditionalManga, initialFetchDone } = useContext(MangaContext);
    const itemsPerPage = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = Array.isArray(mangaData)
        ? mangaData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    const handleNextPage = () => {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        window.scrollTo(0, 0);

        // Check if we need more manga data
        if (newPage * itemsPerPage > mangaData.length && initialFetchDone) {
            fetchAdditionalManga(mangaData.length, 10); // Fetch 10 more mangas
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
            window.scrollTo(0, 0);
        }
    };

    useEffect(() => {
        // Ensure we always have enough data to display the next page
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
                        <p>{manhwa.attributes?.description?.en || 'No description available.'}</p>
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
