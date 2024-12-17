import axios from 'axios';
import { useState } from 'react'

const Search = () => {
    const [title, setTitle] = useState('');
    const [mangaList, setMangaList] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/manga', {
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
                    <li key={manga.id}>{manga.attributes.title.en || 'Untitled'}</li>
                ))}
            </ul>
        </div>
    );
}

export default Search