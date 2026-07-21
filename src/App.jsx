import { useState } from 'react'
import './App.css'
import arianaJSON from './assets/ariana.json'

function App() {
  const [attempts, setAttempts] = useState([]);
  const [guess, setGuess] = useState('');
  const [filter, setFilter] = useState(-1);
  const [answer, setAnswer] = useState(calculateAnswer(arianaJSON));
  const [correct, setCorrect] = useState(false);

  console.log(answer);

  let arianArray = arianaJSON;
  if (filter != -1) {
    arianArray = arianArray.filter(album => album.releaseOrder == filter);
  }


  let selectArray = [];
  for (let albumKey in arianArray) {
    let album = arianArray[albumKey]
    for (let trackKey in album.tracks) {
      let track = album.tracks[trackKey];
      selectArray.push(<option key={album.releaseOrder + '#' + track.trackOrder} value={album.releaseOrder + '#' + track.trackOrder}>{track.trackTitle}</option>);
    }
  }

  function guessSong(e) {
    let trackInfo = getTrackInfo(e.target.value, arianaJSON);
    setGuess(trackInfo);
    setAttempts(attempts + 1);

    if (trackInfo.trackKey === answer.trackKey) {
      setCorrect(true);
    } else {

    }
  }

  if (!correct && attempts.length < 8) {
    return (
      <>
        <form>
          <label htmlFor='filter'>Filter to an Album:</label>
          <select onChange={(e) => setFilter(e.target.value)}>
            <option key={-1} value={-1}></option>
            {arianaJSON.map((album) => <option key={album.releaseOrder} value={album.releaseOrder}>{album.title}</option>)}
          </select>
          <label htmlFor='guess'>Guess a song:</label>
          <select onChange={guessSong} placeholder={`Guess ${attempts.length}/8 - type any Ari song...`} >
            {selectArray}
          </select>
        </form >
      </>
    )
  } else if (correct) {
    return (
      <>
        <p>yay u won</p>
      </>
    )
  } else if (!correct && attempts.length >= 8) {
    return (
      <>
        <p>dang u lost</p>
      </>
    )
  }
}

function getTrackInfo(key, disc) {
  key = key.split('#');
  let albumInd = Number(key[0]);
  let album = disc[albumInd];
  let trackInd = Number(key[1]);
  let track = album.tracks[trackInd];
  return { trackKey: albumInd + '#' + trackInd, trackTitle: track.trackTitle, album: album.title, features: track.trackFeatures }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * album.tracks.length);
  let track = album.tracks[trackInd];
  return { trackKey: (albumInd + 1) + '#' + (trackInd + 1), trackTitle: track.trackTitle, album: album.title, features: track.trackFeatures }
}

export default App
