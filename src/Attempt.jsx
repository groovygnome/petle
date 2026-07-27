function Attempt({ trackInfo, answer }) {

  let matchedFeatures = 0;
  trackInfo.features.forEach((featureGuess) => {
    answer.features.forEach((featureAnswer) => {
      if (featureGuess === featureAnswer) matchedFeatures++;
    });
  });

  return (
    <div className='attempt'>
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
        <p>{`${Math.floor(trackInfo.trackLength / 60)} : ${String(trackInfo.trackLength % 60).padStart(2, '0')}`}</p>
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
}

export default Attempt;
