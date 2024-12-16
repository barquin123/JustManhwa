import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.mangadex.org', // Base URL for the MangaDex API
  headers: {
    'User-Agent': 'MangaReader-Cream/1.0 (https://mangareader-cream.netlify.app/)', // Your app's name and deployed URL
  },
});

export default axiosInstance;