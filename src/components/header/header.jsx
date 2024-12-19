import { Link } from 'react-router-dom'
import Search from './search'

const Header = () => {
  return (
    <nav className='flex justify-between items-center p-4 bg-gray-800 text-white px-6'>
        <Link to='/' className='text-2xl font-bold'>Manga Reader</Link>
        <Search />
        <ul>
            <li><a href="/">Home</a></li>
        </ul>
    </nav>
  )
}

export default Header