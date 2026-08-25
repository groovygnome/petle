import { useState, useEffect, useRef } from 'react'
import '../styles/CoverArt.css'
import arianaJSON from '../assets/ariana.json'
import Attempt from '../components/Attempt.jsx'
import AlbumList from '../components/AlbumList.jsx'
import logo from '../assets/petlelogo.png'
import { Link } from 'react-router-dom';

function CoverArt() {
  let today = new Date().toISOString().slice(0, 10);
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const [attempts, setAttempts] = useState(() => new Array(5).fill(<Attempt empty={true} type={'album'} />));
  const [filterShow, setFilterShow] = useState(false);
  const [answer, setAnswer] = useState({});
  const currGuesses = useRef(-1);
  const arianArray = useRef(structuredClone(arianaJSON));

  if (localStorage.length === 0) {
    localStorage.setItem('coverstreak', 0);
    localStorage.setItem('cover1', 0);
    localStorage.setItem('cover2', 0);
    localStorage.setItem('cover3', 0);
    localStorage.setItem('cover4', 0);
    localStorage.setItem('cover5', 0);
    localStorage.setItem('coverX', 0);
    localStorage.setItem('coverlastCompleted', '1993-6-26');
    localStorage.setItem('covercurrDate', today);
    localStorage.setItem('covercomplete', false);
    localStorage.setItem('coverguesses', JSON.stringify([]));
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
    if (!answer?.albumNum) return;
    let savedDate = localStorage.getItem('covercurrDate');

    if (savedDate === today) {
      let prevGuesses = JSON.parse(localStorage.getItem('coverguesses')).slice();
      prevGuesses.forEach(guess => {
        guessAlbum(guess, false);
      });
    } else {
      localStorage.setItem('coverguesses', JSON.stringify([]));
      localStorage.setItem('covercomplete', false);
      localStorage.setItem('covercurrDate', today);
    }
  }, [answer]);

  attempts.forEach((attempt, index) => {
    if (index <= currGuesses.current) {
      arianArray.current[attempt.props.trackInfo.albumNum].guessed = true;
    }
  });

  function guessAlbum(album, add = true) {
    if (album === -1) return;
    currGuesses.current += 1;
    let i = currGuesses.current;
    let coverInfo = getCoverInfo(album + '#0', arianaJSON);
    setAttempts(prev => {
      const copy = prev.slice();
      copy[i] = <Attempt key={i} trackInfo={coverInfo} answer={answer} type={'album'} />;
      return copy;
    });
    if (add) {
      let prevGuesses = JSON.parse(localStorage.getItem('coverguesses'));
      prevGuesses.push(album);
      localStorage.setItem('coverguesses', JSON.stringify(prevGuesses));
    }

    if (coverInfo.albumNum === answer.albumNum) {
      if ((today - new Date(localStorage.getItem('coverlastCompleted')).toISOString().slice(0, 10)) < ONE_DAY_MS * 2) localStorage.setItem('coverstreak', Number(localStorage.getItem('coverstreak')) + 1);
      else localStorage.setItem('coverstreak', 1);
      localStorage.setItem('cover' + i, Number(localStorage.getItem('cover' + i)) + 1);
      localStorage.setItem('coverlastCompleted', today);
      localStorage.setItem('covercomplete', true);
    } else if (i >= 5) {
      localStorage.setItem('coverX', Number(localStorage.getItem('X')) + 1);
      localStorage.setItem('covercomplete', true);
    }
  }

  function closeAllLists() {
    setFilterShow(false);
  }


  return (
    <div id='app' onClick={closeAllLists}>
      <img id='logo' src={logo} />
      {(localStorage.getItem('covercomplete') === 'true' && currGuesses.current < 4) && <p>congrats u won</p>}
      {(localStorage.getItem('covercomplete') === 'true' && currGuesses.current >= 4) && <p>shoot u lost</p>}
      <img id='coverToGuess' className={localStorage.getItem('covercomplete') === 'true' ? '' : 'guess' + currGuesses.current} src={answer.img} />
      <div className='guessInput'>
        <AlbumList arr={arianaJSON} click={guessAlbum} closeAllLists={closeAllLists} disabled={(localStorage.getItem('covercomplete') === 'true' || currGuesses.current >= 4)}
          show={filterShow} setShow={setFilterShow} filter={false} />
      </div>
      <div className='coverAttempts'>
        {attempts}
      </div>
      <button onClick={async () => await fetch('/api/covers/delete', { method: 'DELETE' })}>delete all db entries</button>
      <Link to='/'>homepage</Link>
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
    albumNum: albumInd, img: cover, title: album.title, year: album.year
  }
}

function calculateAnswer(disc) {
  let albumInd = Math.floor(Math.random() * disc.length);
  let album = disc[albumInd];
  let coverInd = Math.floor(Math.random() * album.covers.length);
  return (albumInd) + '#' + (coverInd);
}


export default CoverArt;
