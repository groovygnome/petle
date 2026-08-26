import { useState, useEffect, useRef } from 'react'
import arianaJSON from '../assets/ariana.json'
import Attempt from '../components/Attempt.jsx'
import AutoComplete from '../components/AutoComplete.jsx'
import AlbumList from '../components/AlbumList.jsx'
import logo from '../assets/petlelogo.png'
import Hint from '../components/Hint.jsx'
import { Link } from 'react-router-dom';

function Infinite() {
  const [complete, setComplete] = useState(false);
  const [attempts, setAttempts] = useState(() => Array.from({ length: 8 }, (_, index) => ({ id: index, empty: true })));
  const [filter, setFilter] = useState(-1);
  const [filterShow, setFilterShow] = useState(false);
  const [answer, setAnswer] = useState({});
  const [acDivs, setacDivs] = useState([]);
  const deezerRef = useRef(null);
  const lyricRef = useRef(null);
  const currGuesses = useRef(-1);
  const arianArray = useRef(structuredClone(arianaJSON));


  useEffect(() => {
    if (complete) return;
    const getPetle = async () => {
      let todayAnswer = calculateAnswer(arianaJSON);
      let answerInfo = getTrackInfo(todayAnswer, arianaJSON);
      setAnswer(answerInfo);

      const result = await fetch(`/deezer/${answerInfo.deezerId}`);
      const data = await result.json();
      deezerRef.current = new Audio(data.preview);

      const lyricRes = await fetch(`/lyrica/Ariana%20Grande/${answerInfo.trackTitle}`);
      const lyricData = await lyricRes.json();
      let lyricInd = Math.floor(Math.random() * (lyricData.length - 2)) + 1;
      lyricRef.current = [lyricData[lyricInd - 1], lyricData[lyricInd], lyricData[lyricInd + 1]];
    }

    getPetle();
  }, [complete]);


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

  function guessSong(song) {
    if (song === -1) return;
    currGuesses.current += 1;
    let i = currGuesses.current;
    let trackInfo = getTrackInfo(song, arianaJSON);
    setAttempts(prev => {
      const copy = prev.slice();
      copy[i] = { id: i, empty: false, trackInfo: trackInfo };
      return copy;
    });

    if (trackInfo.trackKey === answer.trackKey || i >= 7) setComplete(true);
  }

  function closeAllLists() {
    setacDivs([]);
    setFilterShow(false);
  }

  function reset() {
    setComplete(false);
    setAttempts(prev => {
      const copy = prev.slice();
      copy.forEach((attempt) => {
        //un-animate
      })
      return copy;
    });
    setAttempts((() => Array.from({ length: 8 }, (_, index) => ({ id: index, empty: true }))));
    currGuesses.current = -1;
    arianArray.current = structuredClone(arianaJSON);
    deezerRef.current = null;
    lyricRef.current = null;
  }

  return (
    <div id='app' onClick={closeAllLists}>
      <img id='logo' src={logo} />
      {(complete && currGuesses.current < 8) && <button onClick={reset}>win, restart</button>}
      {(complete && currGuesses.current >= 8) && <button onClick={reset}>lose, restart</button>}
      <div className='guessInput'>
        <AlbumList arr={arianaJSON} click={setFilter} closeAllLists={closeAllLists} disabled={(complete || currGuesses.current >= 7)} show={filterShow} setShow={setFilterShow} />
        <AutoComplete arr={selectArray} acDivs={acDivs} setacDivs={setacDivs} closeAllLists={closeAllLists} guessSong={guessSong}
          attLength={currGuesses.current + 1} disabled={(complete || currGuesses.current >= 7)} />
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
        <Hint guessAmt={2 - currGuesses.current} type='coverArt' coverArt={answer.img} />
        <Hint guessAmt={4 - currGuesses.current} type='lyric' ref={lyricRef} />
        <Hint guessAmt={6 - currGuesses.current} type='audio' ref={deezerRef} />
      </div>
      <button onClick={() => { setComplete(!complete); }}>complete</button>
      <Link to='/coverArt'>guess the cover</Link>
      <Link to='/'>home</Link>
    </div >
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
  let albumInd = Math.floor(Math.random() * (disc.length));
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * (album.tracks.length));
  return (albumInd) + '#' + (trackInd);
}


export default Infinite;
