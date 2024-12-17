import axios from 'axios';
import { useState } from 'react';

const Search = () => {
    const [title, setTitle] = useState('');
    const [mangaList, setMangaList] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://mangareader-backend.onrender.com/api/manga/manga?title=${title}`, {
                params: { title, limit: 10, offset: 0 },
            });
            setMangaList(response.data.data);
        } catch (error) {
            console.error('Error fetching manga:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Search Manga</h1>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Search manga title"
            />
            <button onClick={handleSearch}>Search</button>

            {loading && <p>Loading...</p>}
            <ul>
                {mangaList.map((manga) => (
                    <li key={manga.id}>
                        <h3>{manga.attributes.title.en || 'Untitled'}</h3>
                        {manga.relationships.some(rel => rel.type === 'cover_art') ? (
                            <img
                                src={`http://localhost:5000/api/proxy-image/${manga.id}/${
                                    manga.relationships.find(rel => rel.type === 'cover_art').attributes.fileName
                                }`}
                                alt={manga.attributes.title.en}
                                style={{ width: '100px' }}
                            />
                        ) : (
                            <p>No Cover Image</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Search;
