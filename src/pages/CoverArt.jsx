import { useState, useEffect, useRef } from 'react'
import '../styles/Petle.css'
import arianaJSON from '../assets/ariana.json'
import Attempt from '../components/Attempt.jsx'
import Filter from '../components/Filter.jsx'
import logo from '../assets/petlelogo.png'

function CoverArt() {
  let today = new Date().toISOString().slice(0, 10);
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const [attempts, setAttempts] = useState(() => new Array(5).fill(<Attempt empty={true} type={'album'} />));
  const [filterShow, setFilterShow] = useState(false);
  const [answer, setAnswer] = useState({});
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
    localStorage.setItem('lastCompleted', '1993-6-26');
    localStorage.setItem('currDate', today);
    localStorage.setItem('complete', false);
    localStorage.setItem('guesses', JSON.stringify([]));
  }

  useEffect(() => {
    const getPetle = async () => {


      let res = await fetch(`/api/covers/${today}`);
      let todayAnswer = await res.json();

      if (!todayAnswer) {
        todayAnswer = calculateAnswer(arianaJSON);
        let encoded = encodeURIComponent(todayAnswer);
        await fetch(`/api/covers/${today}/${encoded}`, { method: 'POST' });
      }
      setAnswer(getCoverInfo(todayAnswer, arianaJSON));

    }

    getPetle();
  }, []);

  useEffect(() => {

    let savedDate = localStorage.getItem('currDate');

    if (savedDate === today) {
      let prevGuesses = JSON.parse(localStorage.getItem('guesses')).slice();
      prevGuesses.forEach(guess => {
        guessAlbum(guess, false);
      });
    } else {
      localStorage.setItem('guesses', JSON.stringify([]));
      localStorage.setItem('complete', false);
      localStorage.setItem('currDate', today);
    }

  }, [answer]);

  let arianArray = arianaJSON;
  attempts.forEach((attempt, index) => {
    if (index <= currGuesses.current) {
      arianArray[attempt.props.albumNum].title = 'guessed';
    }
  });

  function guessAlbum(album, add = true) {
    if (album === -1) return;
    currGuesses.current += 1;
    let i = currGuesses.current;
    let coverInfo = getCoverInfo(album, arianaJSON);
    setAttempts(prev => {
      const copy = prev.slice();
      copy[i] = <Attempt key={i} trackInfo={coverInfo} answer={answer} type={'album'} />;
      return copy;
    });
    if (add) {
      let prevGuesses = JSON.parse(localStorage.getItem('guesses'));
      prevGuesses.push(cover);
      localStorage.setItem('guesses', JSON.stringify(prevGuesses));
    }

    if (coverInfo.albumNum === answer[0]) {
      if ((today - new Date(localStorage.getItem('lastCompleted')).toISOString().slice(0, 10)) < ONE_DAY_MS * 2) localStorage.setItem('streak', Number(localStorage.getItem('streak')) + 1);
      else localStorage.setItem('streak', 1);
      localStorage.setItem(i, Number(localStorage.getItem(i)) + 1);
      localStorage.setItem('lastCompleted', today);
      localStorage.setItem('complete', true);
    } else if (i >= 5) {
      localStorage.setItem('X', Number(localStorage.getItem('X')) + 1);
      localStorage.setItem('complete', true);
    }
  }

  function closeAllLists() {
    setFilterShow(false);
  }

  console.log(answer);

  return (
    <div id='app' onClick={closeAllLists}>
      <img id='logo' src={logo} />
      <img id='coverToGuess' src={answer.img} />
      {(localStorage.getItem('complete') === 'true' && currGuesses.current < 5) && <p>congrats u won</p>}
      {(localStorage.getItem('complete') === 'true' && currGuesses.current >= 5) && <p>shoot u lost</p>}
      <div className='guessInput'>
        <Filter arr={arianaJSON} setFilter={guessAlbum} closeAllLists={closeAllLists} disabled={(localStorage.getItem('complete') === 'true' || currGuesses.current >= 5)}
          show={filterShow} setShow={setFilterShow} />
      </div>
      <div className='attempts'>
        {attempts}
      </div>
      <button onClick={async () => await fetch('/api/covers/delete', { method: 'DELETE' })}>delete all db entries</button>
    </div>
  )
}

function getCoverInfo(key, disc) {
  let coverKey = key.split('#');
  let albumInd = Number(coverKey[0]);
  let album = disc[albumInd];
  let coverInd = Number(coverKey[1]);
  let cover = album.covers[coverInd];
  return {
    albumNum: albumInd, img: cover
  }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let coverInd = Math.floor(Math.random() * album.covers.length);
  return (albumInd) + '#' + (coverInd);
}


export default CoverArt;
