import Search from './search'

const Header = () => {
  return (
    <nav>
        <h1>Manhwa Reader</h1>
        <Search />
        <ul>
            <li><a href="/">Home</a></li>
        </ul>
    </nav>
  )
}

export default Header