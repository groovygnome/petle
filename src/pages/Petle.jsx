import { useState, useEffect, useRef } from 'react'
import arianaJSON from '../assets/ariana.json'
import Attempt from '../components/Attempt.jsx'
import AutoComplete from '../components/AutoComplete.jsx'
import AlbumList from '../components/AlbumList.jsx'
import logo from '../assets/petlelogo.png'
import Hint from '../components/Hint.jsx'
import { Link } from 'react-router-dom';

function Petle() {
  let today = new Date().toISOString().slice(0, 10);
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const [attempts, setAttempts] = useState(() => Array.from({ length: 8 }, (_, index) => ({ id: index, empty: true })));
  const [filter, setFilter] = useState(-1);
  const [filterShow, setFilterShow] = useState(false);
  const [answer, setAnswer] = useState({});
  const [acDivs, setacDivs] = useState([]);
  const deezerRef = useRef(null);
  const currGuesses = useRef(-1);
  const arianArray = useRef(structuredClone(arianaJSON));

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
    localStorage.setItem('lastCompleted', '1993-6-26');
    localStorage.setItem('currDate', today);
    localStorage.setItem('complete', false);
    localStorage.setItem('guesses', JSON.stringify([]));
  }

  useEffect(() => {
    const getPetle = async () => {


      let res = await fetch(`/api/dailies/${today}`);
      let todayAnswer = await res.json();

      if (!todayAnswer) {
        todayAnswer = calculateAnswer(arianaJSON);
        let encoded = encodeURIComponent(todayAnswer);
        await fetch(`/api/dailies/${today}/${encoded}`, { method: 'POST' });
      }
      let answerInfo = getTrackInfo(todayAnswer, arianaJSON);
      setAnswer(answerInfo);

      const result = await fetch(`/deezer/${answerInfo.deezerId}`);
      const data = await result.json();
      deezerRef.current = new Audio(data.preview);
    }

    getPetle();
  }, []);

  useEffect(() => {
    if (!answer?.deezerId) return;

    let savedDate = localStorage.getItem('currDate');

    if (savedDate === today) {
      let prevGuesses = JSON.parse(localStorage.getItem('guesses')).slice();
      prevGuesses.forEach(guess => {
        guessSong(guess, false);
      });
    } else {
      localStorage.setItem('guesses', JSON.stringify([]));
      localStorage.setItem('complete', false);
      localStorage.setItem('currDate', today);
    }

  }, [answer]);

  attempts.forEach((attempt, index) => {
    if (index <= currGuesses.current) {
      let key = attempt.trackInfo.trackKey.split('#');
      let album = Number(key[0]);
      let track = Number(key[1]);
      arianArray.current[album].tracks[track].guessed = true;
    }
  });


  let selectArray = [];
  for (let albumKey in arianArray.current) {
    if (filter != -1 && albumKey != filter) continue;
    let album = arianArray.current[albumKey];
    for (let trackKey in album.tracks) {
      let track = album.tracks[trackKey];
      selectArray.push([track.trackTitle, (albumKey + '#' + trackKey), track.guessed]);
    }
  }

  function guessSong(song, add = true) {
    if (song === -1) return;
    currGuesses.current += 1;
    let i = currGuesses.current;
    let trackInfo = getTrackInfo(song, arianaJSON);
    setAttempts(prev => {
      const copy = prev.slice();
      copy[i] = { id: i, empty: false, trackInfo: trackInfo };
      return copy;
    });
    if (add) {
      let prevGuesses = JSON.parse(localStorage.getItem('guesses'));
      prevGuesses.push(song);
      localStorage.setItem('guesses', JSON.stringify(prevGuesses));
    }

    if (trackInfo.trackKey === answer.trackKey) {
      if ((today - new Date(localStorage.getItem('lastCompleted')).toISOString().slice(0, 10)) < ONE_DAY_MS * 2) localStorage.setItem('streak', Number(localStorage.getItem('streak')) + 1);
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
      {(localStorage.getItem('complete') === 'true' && currGuesses.current < 8) && <p>congrats u won</p>}
      {(localStorage.getItem('complete') === 'true' && currGuesses.current >= 8) && <p>shoot u lost</p>}
      <div className='guessInput'>
        <AlbumList arr={arianaJSON} click={setFilter} closeAllLists={closeAllLists} disabled={(localStorage.getItem('complete') === 'true' || currGuesses.current >= 7)}
          show={filterShow} setShow={setFilterShow} />
        <AutoComplete arr={selectArray} acDivs={acDivs} setacDivs={setacDivs} closeAllLists={closeAllLists} guessSong={guessSong}
          attLength={currGuesses.current + 1} disabled={(localStorage.getItem('complete') === 'true' || currGuesses.current >= 7)} />
      </div>
      <div className='attempts'>
        {attempts.map(attempt => (
          <Attempt
            key={attempt.id}
            empty={attempt.empty}
            trackInfo={attempt.trackInfo}
            answer={answer} />))
        }
      </div>
      <div id='hints'>
        <Hint guessAmt={3 - currGuesses.current} audio={false} coverArt={answer.img} />
        <Hint guessAmt={5 - currGuesses.current} audio={true} deezerRef={deezerRef} />
      </div>
      <button onClick={async () => await fetch('/api/dailies/delete', { method: 'DELETE' })}>delete all db entries</button>
      <Link to='/coverArt'>guess the cover</Link>
      <Link to='/infinite'>infinite petle</Link>
    </div>
  )
}

function getTrackInfo(key, disc) {
  key = key.split('#');
  let albumInd = Number(key[0]);
  let album = disc[albumInd];
  let trackInd = Number(key[1]);
  let track = album.tracks[trackInd];
  let cover = album.covers[0];
  if (albumInd === 7 && trackInd >= 14) cover = album.covers[7];
  return { trackKey: albumInd + '#' + trackInd, albumInd: albumInd, trackInd: trackInd, img: cover, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength, deezerId: track.deezerId }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * album.tracks.length);
  return (albumInd) + '#' + (trackInd);
}


export default Petle;
