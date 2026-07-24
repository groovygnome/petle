import { useState, useEffect } from 'react'
import './App.css'
import arianaJSON from './assets/ariana.json'

function App() {
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState(-1);
  const [answer, setAnswer] = useState({});
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    const getPetle = async () => {
      let today = new Date();
      let date = today.getFullYear() + '-'
        + String(today.getMonth() + 1).padStart(2, '0') + '-'
        + String(today.getDate()).padStart(2, '0');

      let res = await fetch(`/api/dailies/${date}`);
      let todayAnswer = await res.json();

      if (todayAnswer.length === 0) {
        let answerCode = calculateAnswer(arianaJSON);
        let encoded = encodeURIComponent(answerCode);
        let res = await fetch(`/api/dailies/${date}/${encoded}`, { method: 'POST' });
        todayAnswer = await res.json();
      }
      setAnswer(getTrackInfo(todayAnswer[0].answer, arianaJSON));
    }

    getPetle();
  }, []);

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
    let matchedFeatures = 0;
    trackInfo.features.forEach((featureGuess) => {
      answer.features.forEach((featureAnswer) => {
        if (featureGuess === featureAnswer) matchedFeatures++;
      });
    });
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
        <div className={`attempt-features ${matchedFeatures === answer.features.length
          ? 'correct'
          : matchedFeatures >= 1
            ? 'almost'
            : 'incorrect'}`}>
          {trackInfo.features.map((feature, index) => <p key={index}>{feature}</p>)}
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
        <form className='guessInput'>
          <label htmlFor='filter'>filter to an album:</label>
          <select onChange={(e) => setFilter(e.target.value)}>
            <option key={-1} value={-1}></option>
            {arianaJSON.map((album) => <option key={album.releaseOrder} value={album.releaseOrder}>{album.title}</option>)}
          </select>
          <label htmlFor='guess'>guess a song:</label>
          <select onChange={guessSong} placeholder={`guess ${attempts.length}/8 - type any ari song...`} >
            <option key={-1} value={-1}></option>
            {selectArray}
          </select>
        </form>
        <div className='attempts'>
          {attempts}
        </div>
        <button onClick={async () => await fetch('/api/dailies/delete', { method: 'DELETE' })}>delete all db entries</button>
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
  return { trackKey: albumInd + '#' + trackInd, albumNum: albumInd - 1, trackNum: trackInd - 1, img: album.cover, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * album.tracks.length);
  //let track = album.tracks[trackInd];
  //return { trackKey: (albumInd + 1) + '#' + (trackInd + 1), albumNum: albumInd + 1, trackNum: trackInd + 1, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength }
  return (albumInd + 1) + '#' + (trackInd + 1);
}

export default App
