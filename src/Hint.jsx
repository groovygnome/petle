import { useState } from 'react';
import play from './assets/play.svg';

function Hint({ guessAmt, coverArt, audio, deezerRef }) {
  const [hint, setHint] = useState(false);

  function handlePlay(e) {
    let audio = deezerRef.current;
    if (audio.currentTime < 20 || audio.ended) audio.currentTime = 20;
    if (deezerRef.current.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }


  if (!audio) {
    return (
      <div id='coverHint' className={'hint ' + (guessAmt > 0 ? 'unavailable' : hint ? 'used' : 'available')}>
        {guessAmt > 0 ?
          <p>cover art hint in {guessAmt} guess{guessAmt > 1 && 'es'}</p>
          : hint ?
            <img src={coverArt} />
            : <p onClick={() => setHint(true)}>hint available!</p>}
      </div>
    )
  } else {
    return (
      <div id='heardleHint' className={'hint ' + (guessAmt > 0 ? 'unavailable' : hint ? 'used' : 'available')}>
        {guessAmt > 0 ?
          <p>audio hint in {guessAmt} guess{guessAmt > 1 && 'es'}</p>
          : hint ?
            <img className='audio-control' onClick={handlePlay} src={play} />
            : <p onClick={() => { setHint(true) }}>hint available!</p>}
      </div>
    )
  }
}

export default Hint
