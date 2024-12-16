import { useRoutes } from 'react-router-dom'
import './App.css'
import Home from './components/home/Home'
import MangaDetails from './components/mangaDetails/MangaDetails'
import MangaDetailsChapter from './components/mangaDetails/mangaDetailsChapter'
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
  ]

  const routesElement = useRoutes(routerArray)

  return (
    <>
      <div className="">
        <div className="">
          <div className="">
            {routesElement}
          </div>
        </div>
      </div>
    </>
  )
}

export default App