import { useRoutes } from 'react-router-dom'
import './App.css'
import Home from './components/home/Home'
import MangaDetails from './components/mangaDetails/MangaDetails'
import MangaDetailsChapter from './components/mangaDetails/mangaDetailsChapter'
import Header from './components/header/header'
import Search from './components/header/search'
function App() {

  const routerArray = [
    {
      path: '*',
      element: <Home />,
    },
    {
      path: '/home',
      element: <Home />,
    },
    {
        path: '/details/:id',
        element: <MangaDetails />,
      },
      {
        path: '/chapter/:id',
        element: <MangaDetailsChapter />,
      },
      {
        path: '/search',
        element: <Search />,
      },
  ]

  const routesElement = useRoutes(routerArray)

  return (
    <>
      <div className="">
            <Header />
            {routesElement}
      </div>
    </>
  )
}

export default App