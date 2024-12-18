import Search from './search'

const Header = () => {
  return (
    <nav className='flex justify-between items-center p-4 bg-gray-800 text-white px-6'>
        <h1>Manhwa Reader</h1>
        <Search />
        <ul>
            <li><a href="/">Home</a></li>
        </ul>
    </nav>
  )
}

export default Header