import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MangaDetailsChapter = () => {
    const { id } = useParams(); // The chapter ID from the URL
    const navigate = useNavigate();
    const [chapterDetails, setChapterDetails] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextChapter, setNextChapter] = useState(null);
    const [prevChapter, setPrevChapter] = useState(null);
    const transLang = 'en'; // Translated language
    // const offset = 0; // Offset for fetching all chapters
    useEffect(() => {
        const fetchChapterDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch chapter details (first request)
                const chapterResponse = await axios.get(`https://mangareader-backend.onrender.com/api/manga/chapter/${id}`);
                const chapterData = chapterResponse.data.data;
                const currentChapter = chapterData.attributes.chapter;
                const mangaId = chapterData.relationships.find(rel => rel.type === 'manga')?.id;
                const prevChapter = await axios.get(`https://mangareader-backend.onrender.com/api/manga/chapter?manga=${mangaId}&chapter=${Number(currentChapter) - 1}&translatedLanguage[]=${transLang}`);
                const nextChapter = await axios.get(`https://mangareader-backend.onrender.com/api/manga/chapter?manga=${mangaId}&chapter=${Number(currentChapter) + 1}&translatedLanguage[]=${transLang}`);
                // Check for next and previous chapters
                const nextChapterId = nextChapter?.data?.data[0]?.id
                const prevChapterId = prevChapter?.data?.data[0]?.id
                // const next = nextChapter?.data?.data[0]?.id;
               
                setNextChapter(nextChapterId);
                setPrevChapter(prevChapterId);

                

                // Fetch server info (second request)
                const serverResponse = await axios.get(`https://mangareader-backend.onrender.com/api/manga/at-home/server/${id}`);

                if (!serverResponse || !serverResponse.data) {
                    setError('No server data returned.');
                    return;
                }

                const serverData = serverResponse.data;

                if (!serverData.baseUrl || !serverData.chapter || !serverData.chapter.hash || !serverData.chapter.data) {
                    setError('Server data is incomplete.');
                    return;
                }

                const { baseUrl, chapter } = serverData;
                const { hash, data: imageFiles } = chapter;

                if (!imageFiles || imageFiles.length === 0) {
                    setError('No images available for this chapter.');
                    return;
                }

                // Construct the full image URLs
                const imageUrls = imageFiles.map((file) => `${baseUrl}/data/${hash}/${file}`);
                setImages(imageUrls);
                setChapterDetails(chapterData);

            } catch (err) {
                setError(`Failed to load chapter images: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchChapterDetails();
    }, [id]);

    const handleNavigation = (chapterId) => {
        if (chapterId) navigate(`/chapter/${chapterId}`);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="max-w-3xl m-auto">
            <h1 className="text-2xl font-bold mb-4">Chapter: {chapterDetails?.attributes?.title || 'Untitled'}</h1>

            <div className="flex justify-between mb-4">
                <button
                    disabled={prevChapter == null}
                    onClick={() => handleNavigation(prevChapter)}
                    className={`px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400`}
                >
                    Previous Chapter
                </button>
                <button
                    disabled={nextChapter == null}
                    onClick={() => handleNavigation(nextChapter)}
                    className={`px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400`}
                >
                    Next Chapter
                </button>
            </div>

            <div className="grid">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Page ${index + 1}`}
                        className="w-full object-contain"
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4">
                <button
                    disabled={prevChapter == null}
                    onClick={() => handleNavigation(prevChapter)}
                    className={`px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400`}
                >
                    Previous Chapter
                </button>
                <button
                    disabled={nextChapter == null}
                    onClick={() => handleNavigation(nextChapter)}
                    className={`px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400`}
                >
                    Next Chapter
                </button>
            </div>
        </div>
    );
};

export default MangaDetailsChapter;
