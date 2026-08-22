import './styles/Petle.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Petle from './pages/Petle';
import CoverArt from './pages/CoverArt';
//import Infinite from './pages/Infinte';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={<Petle />}
          />
          <Route
            path="/coverArt"
            element={<CoverArt />}
          />
          { /**<Route
            path="/infinite"
            element={<Infinite />}
          />
**/}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
