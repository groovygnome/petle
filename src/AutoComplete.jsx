function AutoComplete({ arr, acDivs, setacDivs, closeAllLists, guessSong, attLength, correct }) {

  function autoComplete(e) {
    let val = e.target.value;
    closeAllLists();
    if (!val) return false;

    let autoCompleteDivs = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][0].substring(0, val.length).toUpperCase() == val.toUpperCase() && arr[i][0] != 'guessed') {
        autoCompleteDivs.push((
          <div key={arr[i][1]} onClick={() => { e.target.value = ''; guessSong(arr[i][1]); closeAllLists(); }}>
            <strong>{arr[i][0].substring(0, val.length)}</strong>
            {arr[i][0].substring(val.length)}
            <input type='hidden' value={arr[i][1]} />
          </div>
        ));
      }
    }
    setacDivs(autoCompleteDivs);
  }

  const placeholder = `guess ${attLength}/8 - type any ari song...`

  return (
    <div className='autocomplete'>
      <input onChange={autoComplete} id='myInput' type='text' name='myGuess'
        placeholder={placeholder} disabled={(correct || attLength >= 8)} size={placeholder.length} />
      <div id='autocomplete-list' className='autocomplete-items'>
        {acDivs}
      </div>
    </div>
  )

}

export default AutoComplete;
