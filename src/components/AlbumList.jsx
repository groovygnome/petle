import music from '../assets/music.svg'
import gap from '../assets/gap.png'
import dropdown from '../assets/dropdown.svg'
import { useState } from 'react'

function AlbumList({ arr, click, closeAllLists, disabled, show, setShow, filter = true }) {

  let title = filter ? `filter by album...` : `guess an album...`;
  const [display, setDisplay] = useState({ img: gap, title: title });

  let albumDivs = [];
  if (filter) albumDivs.push(<div onClick={(() => { click(-1); closeAllLists(); setDisplay({ img: gap, title: `filter by album...` }) })}
    className='album-choice allalbums' key={-1} value={-1}><img src={music} /><p>all albums</p><p></p></div >)
  arr.forEach((album, index) => {
    if (!album.guessed || filter) {
      albumDivs.push(
        <div onClick={() => { click(index); setDisplay({ img: album.covers[0], title: album.title }) }} className='album-choice' key={index} value={index}>
          <img src={album.covers[0]} />
          <p>{album.title}</p>
          <p>{album.year}</p>
        </div>
      )
    }
  })

  return (
    <div className='albumList'>
      <div onClick={((e) => { if (!disabled) { e.stopPropagation(); setShow(s => !s); } })} id='album-display' type='text' name='albumList'>
        <img src={display.img} />
        <p>{display.title}</p>
        <img id='dropdown' src={dropdown} />
      </div>
      <div id='album-list' className='albumlist-items'>
        {show && albumDivs}
      </div>
    </div >
  )
}

export default AlbumList;
