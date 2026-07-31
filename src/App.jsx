import { useState, useEffect } from 'react'
import './App.css'
import arianaJSON from './assets/ariana.json'
import Attempt from './Attempt.jsx';
import AutoComplete from './AutoComplete.jsx';

function App() {
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState(-1);
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
      setAnswer(getTrackInfo(todayAnswer[0].answer, arianaJSON));
    }

    getPetle();
  }, []);

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

  function autoComplete(e) {
    let val = e.target.value;
    closeAllLists();
    if (!val) return false;

    let autoCompleteDivs = [];
    for (let i = 0; i < selectArray.length; i++) {
      if (selectArray[i][0].substring(0, val.length).toUpperCase() == val.toUpperCase() && selectArray[i][0] != 'guessed') {
        autoCompleteDivs.push((
          <div key={selectArray[i][1]} onClick={() => { e.target.value = ''; guessSong(selectArray[i][1]); closeAllLists(); }}>
            <strong>{selectArray[i][0].substring(0, val.length)}</strong>
            {selectArray[i][0].substring(val.length)}
            <input type='hidden' value={selectArray[i][1]} />
          </div>
        ));
      }
    }
    setacDivs(autoCompleteDivs);
  }

  function closeAllLists() {
    setacDivs([]);
  }


  if (correct) {
    localStorage.setItem('streak', Number(localStorage.getItem('streak')) + 1);
    localStorage.setItem(attempts.length, Number(localStorage.getItem(attempts.length)) + 1);
  }
  if (!correct && attempts.length >= 8) {
    localStorage.setItem('X', Number(localStorage.getItem('X')) + 1);
  }

  return (
    <div onClick={closeAllLists}>
      {correct && <p>congrats u won</p>}
      {(!correct && attempts.length >= 8) && <p>shoot u lost</p>}
      <form autoComplete='off' className='guessInput'>
        <div className='dropdown'>
          <button className='dropbtn'>filter to one album</button>
          <div className='dropdown-content'>
            <div className='dropdown-choice' key={-1} value={-1}><img src='' /><p>all albums</p><p></p></div>
            {arianaJSON.map((album) => (
              <div className='dropdown-choice' key={album.releaseOrder} value={album.releaseOrder}>
                <img src={album.cover} />
                <p>{album.title}</p>
                <p>{album.year}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor='filter'>filter to an album:</label>
          <select onChange={(e) => setFilter(e.target.value)}
            disabled={(correct || attempts.length >= 8)}>
            <option key={-1} value={-1}></option>
            {arianaJSON.map((album) => <option key={album.releaseOrder} value={album.releaseOrder}>{album.title}</option>)}
          </select>
        </div>
        <AutoComplete arr={selectArray} acDivs={acDivs} setacDivs={setacDivs} closeAllLists={closeAllLists} guessSong={guessSong}
          attLength={attempts.length} correct={correct} />
      </form>
      <div className='attempts'>
        {attempts}
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
  let cover = album.cover;
  if (albumInd === 7 && trackInd >= 14) cover = album.altcover;
  return { trackKey: albumInd + '#' + trackInd, albumNum: albumInd - 1, trackNum: trackInd - 1, img: cover, trackTitle: track.trackTitle, features: track.trackFeatures, trackLength: track.trackLength }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let trackInd = Math.floor(Math.random() * album.tracks.length);
  return (albumInd + 1) + '#' + (trackInd + 1);
}


export default App;
