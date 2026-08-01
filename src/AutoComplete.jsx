function AutoComplete({ arr, acDivs, setacDivs, closeAllLists, guessSong, attLength, correct, filter }) {

  function autoComplete(e) {
    let val = e.target.value;
    closeAllLists();
    if (!val) return false;

    let autoCompleteDivs = [];
    if (!filter) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][0].substring(0, val.length).toUpperCase() == val.toUpperCase() && arr[i][0] != 'guessed') {
          autoCompleteDivs.push((
            <div key={arr[i][1]} onClick={() => { e.target.value = ''; guessSong(arr[i][1]); closeAllLists(); }}>
              {arr[i][0]}
              <input type='hidden' value={arr[i][1]} />
            </div>
          ));
        }
      }
      setacDivs(autoCompleteDivs);
    } else {

      autoCompleteDivs.push(<div onClick={(() => { setacDivs(-1); closeAllLists(); })}
        className='dropdown-choice' key={-1} value={-1}><img src='' /><p>all albums</p><p></p></div >)
      arr.forEach((album) => (
        autoCompleteDivs.push(
          <div onClick={() => { setacDivs(album.releaseOrder); closeAllLists(); }} className='dropdown-choice' key={album.releaseOrder} value={album.releaseOrder}>
            <img src={album.cover} />
            <p>{album.title}</p>
            <p>{album.year}</p>
          </div>
        )))
    }
  }

  const placeholder = filter ? `filter to an album` : `guess ${attLength}/8 - type any ari song...`

  return (
    <div className='autocomplete'>
      <input onChange={autoComplete} id='myInput' type='text' name='myGuess'
        placeholder={placeholder} disabled={(correct || attLength >= 8)} size={placeholder.length} />
      <div id='autocomplete-list' className='autocomplete-items'>
        {filter ? setacDivs : acDivs}
      </div>
    </div>
  )

}

export default AutoComplete;
