import { useState, useEffect, useRef } from 'react'
import './App.css'
import arianaJSON from './assets/ariana.json'
import Attempt from './Attempt.jsx'
import AutoComplete from './AutoComplete.jsx'
import Filter from './Filter.jsx'
import logo from './assets/petlelogo.png'
import Hint from './Hint.jsx'

function App() {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const [attempts, setAttempts] = useState(() => new Array(8).fill(<Attempt empty={true} />));
  const [filter, setFilter] = useState(-1);
  const [filterShow, setFilterShow] = useState(false);
  const [answer, setAnswer] = useState({});
  const [acDivs, setacDivs] = useState([]);
  const deezerRef = useRef(null);
  const currGuesses = useRef(-1);

  if (localStorage.length === 0) {
    localStorage.setItem('streak', 0);
    localStorage.setItem(1, 0);
    localStorage.setItem(2, 0);
    localStorage.setItem(3, 0);
    localStorage.setItem(4, 0);
    localStorage.setItem(5, 0);
    localStorage.setItem(6, 0);
    localStorage.setItem(7, 0);
    localStorage.setItem(8, 0);
    localStorage.setItem('X', 0);
    localStorage.setItem('lastCompleted', new Date('1993-6-26'));
    localStorage.setItem('complete', false);
  }

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
      let answerInfo = getTrackInfo(todayAnswer[0].answer, arianaJSON);
      setAnswer(answerInfo);

      const result = await fetch(`/api/track/${answerInfo.deezerId}`);
      const data = await result.json();

      deezerRef.current = new Audio(data.preview);
    }

    getPetle();
  }, []);

  let arianArray = arianaJSON;
  attempts.forEach((attempt, index) => {
    if (index <= currGuesses.current) {
      let key = attempt.props.trackInfo.trackKey.split('#');
      let album = Number(key[0] - 1);
      let track = Number(key[1] - 1);
      arianArray[album].tracks[track].trackTitle = 'guessed';
    }
  });
  if (filter != -1) {
    arianArray = arianArray.filter(album => album.releaseOrder == filter);
  }


  let selectArray = [];
  for (let albumKey in arianArray) {
    let album = arianArray[albumKey]
    for (let trackKey in album.tracks) {
      let track = album.tracks[trackKey];
      selectArray.push([track.trackTitle, (album.releaseOrder + '#' + track.trackOrder)]);
    }
  }

  function guessSong(song) {
    if (song === -1) return;
    currGuesses.current += 1;
    let i = currGuesses.current;
    let trackInfo = getTrackInfo(song, arianaJSON);
    setAttempts(prev => {
      const copy = prev.slice();
      copy[i] = <Attempt key={i} trackInfo={trackInfo} answer={answer} />;
      return copy;
    });

    if (trackInfo.trackKey === answer.trackKey) {
      let today = new Date();
      if ((today - new Date(localStorage.getItem('lastCompleted')).getTime()) < ONE_DAY_MS * 2) localStorage.setItem('streak', Number(localStorage.getItem('streak')) + 1);
      else localStorage.setItem('streak', 1);
      localStorage.setItem(i, Number(localStorage.getItem(i)) + 1);
      localStorage.setItem('lastCompleted', today);
      localStorage.setItem('complete', true);
    } else if (i >= 7) {
      localStorage.setItem('X', Number(localStorage.getItem('X')) + 1);
      localStorage.setItem('complete', true);
    }
  }

  function closeAllLists() {
    setacDivs([]);
    setFilterShow(false);
  }

  return (
    <div id='app' onClick={closeAllLists}>
      <img id='logo' src={logo} />
      {(localStorage.getItem('complete') === 'true' && attempts.length < 8) && <p>congrats u won</p>}
      {(localStorage.getItem('complete') === 'true' && attempts.length >= 8) && <p>shoot u lost</p>}
      <div className='guessInput'>
        <Filter arr={arianaJSON} setFilter={setFilter} closeAllLists={closeAllLists} disabled={(localStorage.getItem('complete') === 'true' || currGuesses.current >= 7)}
          show={filterShow} setShow={setFilterShow} />
        <AutoComplete arr={selectArray} acDivs={acDivs} setacDivs={setacDivs} closeAllLists={closeAllLists} guessSong={guessSong}
          attLength={currGuesses.current + 1} disabled={(localStorage.getItem('complete') === 'true' || currGuesses.current >= 7)} />
      </div>
      <div className='attempts'>
        {attempts}
      </div>
      <div id='hints'>
        <Hint guessAmt={3 - currGuesses.current} audio={false} coverArt={answer.img} />
        <Hint guessAmt={5 - currGuesses.current} audio={true} deezerRef={deezerRef} />
      </div>
      <button onClick={async () => await fetch('/api/dailies/delete', { method: 'DELETE' })}>delete all db entries</button>
    </div>
  )
}

function getTrackInfo(key, disc) {
  key = key.split('#');
  let albumInd = Number(key[0]);
  let album = disc[albumInd - 1];
  let trackInd = Number(key[1]);
  let track = album.tracks[trackInd - 1];
  let cover = album.covers[0];
  if (albumInd === 7 && trackInd >= 14) cover = album.covers[7];
  return { trackKey: albumInd + '#' + trackInd, albumNum: albumInd - 1, trackNum: trackInd - 1, img: cover, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength, deezerId: track.deezerId }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * album.tracks.length);
  return (albumInd) + '#' + (trackInd);
}


export default App;
