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
    const [preferredScanlationGroupId, setPreferredScanlationGroupId] = useState(null);
    const transLang = 'en'; // Translated language

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

                // Extract scanlation group id for the current chapter
                const currentScanlationGroupId = chapterData.relationships.find(
                    (rel) => rel.type === 'scanlation_group'
                )?.id;

                if (currentScanlationGroupId) {
                    setPreferredScanlationGroupId(currentScanlationGroupId); // Set the preferred scanlation group id
                }

                // Fetch previous and next chapters
                const prevChapterResponse = await axios.get(`https://mangareader-backend.onrender.com/api/manga/chapter?manga=${mangaId}&chapter=${Number(currentChapter) - 1}&translatedLanguage[]=${transLang}`);
                const nextChapterResponse = await axios.get(`https://mangareader-backend.onrender.com/api/manga/chapter?manga=${mangaId}&chapter=${Number(currentChapter) + 1}&translatedLanguage[]=${transLang}`);

                // Check and find the preferred scanlation group in previous and next chapters
                const prevChapterData = prevChapterResponse?.data?.data.find(
                    (chapter) => {
                        const scanlationGroupId = chapter.relationships.find(
                            (rel) => rel.type === 'scanlation_group'
                        )?.id;
                        return scanlationGroupId === preferredScanlationGroupId; // Match with preferred scanlation group id
                    }
                );

                const nextChapterData = nextChapterResponse?.data?.data.find(
                    (chapter) => {
                        const scanlationGroupId = chapter.relationships.find(
                            (rel) => rel.type === 'scanlation_group'
                        )?.id;
                        return scanlationGroupId === preferredScanlationGroupId; // Match with preferred scanlation group id
                    }
                );

                // If no preferred scanlation group, fallback to any available chapter
                setPrevChapter(prevChapterData ? prevChapterData.id : prevChapterResponse?.data?.data[0]?.id);
                setNextChapter(nextChapterData ? nextChapterData.id : nextChapterResponse?.data?.data[0]?.id);

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
    }, [id, preferredScanlationGroupId]);

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
