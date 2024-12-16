import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MangaDetailsChapter = () => {
    const { id } = useParams(); // The chapter ID from the URL
    const [chapterDetails, setChapterDetails] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChapterDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch chapter details (first request)
                const chapterResponse = await axios.get(`/mangadex/chapter/${id}`);
                const chapterData = chapterResponse.data.data;

                // Fetch server info (second request)
                const serverResponse = await axios.get(`/mangadex/at-home/server/${id}`);

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="max-w-screen-lg m-auto">
            <h1 className="text-2xl font-bold mb-4">Chapter: {chapterDetails?.attributes?.title || 'Untitled'}</h1>
            <div className="grid gap-4">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Page ${index + 1}`}
                        className="w-full object-contain"
                    />
                ))}
            </div>
        </div>
    );
};

export default MangaDetailsChapter;
