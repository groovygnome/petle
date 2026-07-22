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


  let selectArray = [''];
  for (let albumKey in arianArray) {
    let album = arianArray[albumKey]
    for (let trackKey in album.tracks) {
      let track = album.tracks[trackKey];
      selectArray.push(<option key={album.releaseOrder + '#' + track.trackOrder} value={album.releaseOrder + '#' + track.trackOrder}>{track.trackTitle}</option>);
    }
  }

  function guessSong(e) {
    if (e.target.value === -1) return;
    let trackInfo = getTrackInfo(e.target.value, arianaJSON);
    let newAttempt = (
      <div className='attempt' key={attempts.length + 1}>
        <p className={trackInfo.trackTitle === answer.trackTitle ? 'correct' : 'incorrect'}>{trackInfo.trackTitle}</p>
        <div className={`attempt-album ${trackInfo.albumNum === answer.albumNum
          ? 'correct'
          : trackInfo.albumNum > answer.albumNum
            ? Math.abs(trackInfo.albumNum - answer.albumNum) <= 2
              ? 'almost greaterthan'
              : 'greaterthan incorrect'
            : Math.abs(trackInfo.albumNum - answer.albumNum) <= 2
              ? 'almost lessthan'
              : 'lessthan incorrect'} `}>
          <img src={trackInfo.img} className={trackInfo.albumNum === answer.albumNum ? 'correct' : 'incorrect'} />
          <p>{trackInfo.albumNum === answer.albumNum
            ? '='
            : trackInfo.albumNum > answer.albumNum
              ? '↓'
              : '↑'}
          </p>
        </div>
        <div className={`attempt-track ${trackInfo.trackNum === answer.trackNum
          ? 'correct'
          : trackInfo.trackNum > answer.trackNum
            ? Math.abs(trackInfo.trackNum - answer.trackNum) <= 2
              ? 'almost greaterthan'
              : 'greaterthan incorrect'
            : Math.abs(trackInfo.trackNum - answer.trackNum) <= 2
              ? 'almost lessthan'
              : 'lessthan incorrect'} `}>
          <p>{trackInfo.trackNum + 1}</p>
          <p>{trackInfo.trackNum === answer.trackNum
            ? '='
            : trackInfo.trackNum > answer.trackNum
              ? '↓'
              : '↑'}
          </p>
        </div>
        <div className={`attempt-track ${trackInfo.trackLength === answer.trackLength
          ? 'correct'
          : trackInfo.trackLength > answer.trackLength
            ? Math.abs(trackInfo.trackLength - answer.trackLength) <= 30
              ? 'almost greaterthan'
              : 'greaterthan incorrect'
            : Math.abs(trackInfo.trackLength - answer.trackLength) <= 30
              ? 'almost lessthan'
              : 'lessthan incorrect'} `}>
          <p>{`${Math.floor(trackInfo.trackLength / 60)} : ${trackInfo.trackLength % 60}`}</p>
          <p>{trackInfo.trackLength === answer.trackLength
            ? '='
            : trackInfo.trackLength > answer.trackLength
              ? '↓'
              : '↑'}
          </p>
        </div>
        <div className={`attempt-features`}>
          {trackInfo.features}
        </div>

      </div>
    )
    console.log(newAttempt);
    setAttempts([...attempts, newAttempt]);

    if (trackInfo.trackKey === answer.trackKey) {
      setCorrect(true);
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
            <option key={-1} value={-1}></option>
            {selectArray}
          </select>
        </form>
        <div className='attempts'>
          {attempts}
        </div>
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
  let album = disc[albumInd - 1];
  let trackInd = Number(key[1]);
  let track = album.tracks[trackInd - 1];
  return { trackKey: albumInd + '#' + trackInd, albumNum: albumInd, trackNum: trackInd, img: album.cover, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * album.tracks.length);
  let track = album.tracks[trackInd];
  return { trackKey: (albumInd + 1) + '#' + (trackInd + 1), albumNum: albumInd + 1, trackNum: trackInd + 1, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength }
}

export default App
