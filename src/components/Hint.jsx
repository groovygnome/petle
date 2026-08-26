import { useState } from 'react';
import play from '../assets/play.svg';

function Hint({ guessAmt, coverArt, type, ref }) {
  const [hint, setHint] = useState(false);

  function handlePlay(e) {
    let audio = ref.current;
    if (audio.currentTime < 20 || audio.ended) audio.currentTime = 20;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }


  if (type === 'coverArt') {
    return (
      <div id='coverHint' className={'hint ' + (guessAmt > 0 ? 'unavailable' : hint ? 'used' : 'available')} onClick={() => { if (guessAmt <= 0) setHint(true) }}>
        {guessAmt > 0 ?
          <p>album hint in {guessAmt} guess{guessAmt > 1 && 'es'}</p>
          : hint ?
            <img src={coverArt} />
            : <p>album hint available!</p>}
      </div>
    )
  } else if (type === 'audio') {
    return (
      <div id='heardleHint' className={'hint ' + (guessAmt > 0 ? 'unavailable' : hint ? 'used' : 'available')} onClick={() => { if (guessAmt <= 0) setHint(true); }}>
        {guessAmt > 0 ?
          <p>audio hint in {guessAmt} guess{guessAmt > 1 && 'es'}</p>
          : hint ?
            <img className='audio-control' onClick={handlePlay} src={play} />
            : <p>audio hint available!</p>}
      </div>
    )
  } else if (type === 'lyric') {
    return (
      <div id='lyricHint' className={'hint ' + (guessAmt > 0 ? 'unavailable' : hint ? 'used' : 'available')} onClick={() => { if (guessAmt <= 0) setHint(true); }}>
        {guessAmt > 0 ?
          <p>lyric hint in {guessAmt} guess{guessAmt > 1 && 'es'}</p>
          : hint ?
            ref.current.map((lyric, ind) => (<p key={ind}>{lyric}</p>))
            : <p>lyric hint available!</p>}
      </div>
    )
  }
}

export default Hint
