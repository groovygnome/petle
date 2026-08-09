import { useState, useEffect } from 'react'
import './App.css'
import arianaJSON from './assets/ariana.json'
import Attempt from './Attempt.jsx'
import AutoComplete from './AutoComplete.jsx'
import Filter from './Filter.jsx'
import logo from './assets/petlelogo.png'

function App() {
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState(-1);
  const [filterShow, setFilterShow] = useState(false);
  const [showcHint, setShowcHint] = useState(false);
  const [showaHint, setShowaHint] = useState(false);
  const [deezer, setDeezer] = useState({});
  const [answer, setAnswer] = useState({});
  const [correct, setCorrect] = useState(false);
  const [acDivs, setacDivs] = useState([]);

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

      setDeezer(data.preview);
    }

    getPetle();
  }, []);

  console.log(answer);

  let arianArray = arianaJSON;
  attempts.forEach((attempt) => {
    let key = attempt.props.trackInfo.trackKey.split('#');
    let album = Number(key[0] - 1);
    let track = Number(key[1] - 1);
    arianArray[album].tracks[track].trackTitle = 'guessed';
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
    let trackInfo = getTrackInfo(song, arianaJSON);
    setAttempts([...attempts, (<Attempt key={attempts + 1} trackInfo={trackInfo} answer={answer} />)]);

    if (trackInfo.trackKey === answer.trackKey) {
      setCorrect(true);
    }
  }

  function closeAllLists() {
    setacDivs([]);
    setFilterShow(false);
  }


  if (correct) {
    localStorage.setItem('streak', Number(localStorage.getItem('streak')) + 1);
    localStorage.setItem(attempts.length, Number(localStorage.getItem(attempts.length)) + 1);
  }
  if (!correct && attempts.length >= 8) {
    localStorage.setItem('X', Number(localStorage.getItem('X')) + 1);
  }

  let audio = new Audio(deezer);

  return (
    <div id='app' onClick={closeAllLists}>
      <img id='logo' src={logo} />
      {correct && <p>congrats u won</p>}
      {(!correct && attempts.length >= 8) && <p>shoot u lost</p>}
      <div className='guessInput'>
        <Filter arr={arianaJSON} setFilter={setFilter} closeAllLists={closeAllLists} disabled={(correct || attempts.length >= 8)}
          show={filterShow} setShow={setFilterShow} />
        <AutoComplete arr={selectArray} acDivs={acDivs} setacDivs={setacDivs} closeAllLists={closeAllLists} guessSong={guessSong}
          attLength={attempts.length} disabled={(correct || attempts.length >= 8)} />
      </div>
      <div className='attempts'>
        {attempts}
      </div>
      <div id='hints'>
        <div id='coverHint' className={'hint ' + (3 - attempts.length > 0 ? 'unavailable' : showcHint ? 'used' : 'available')}>
          {3 - attempts.length > 0 ?
            <p>cover art hint in {3 - attempts.length} guess{3 - attempts.length > 1 && 'es'}</p>
            : showcHint ?
              <img src={answer.img} />
              : <p onClick={() => setShowcHint(true)}>hint available!</p>}
        </div>
        <div id='heardleHint' className={'hint ' + (5 - attempts.length > 0 ? 'unavailable' : showaHint ? 'used' : 'available')}>
          {5 - attempts.length > 0 ?
            <p>audio hint in {5 - attempts.length} guess{5 - attempts.length > 1 && 'es'}</p>
            : showaHint ?
              audio.play()
              : <p onClick={() => setShowaHint(true)}>hint available!</p>}
        </div>
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
