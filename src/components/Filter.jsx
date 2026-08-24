import music from '../assets/music.svg'
import gap from '../assets/gap.png'
import dropdown from '../assets/dropdown.svg'
import { useState } from 'react'

function Filter({ arr, setFilter, closeAllLists, disabled, show, setShow }) {

  const [filterDisplay, setFilterDisplay] = useState({ img: gap, title: `filter by album...` });

  let albumDivs = [];
  albumDivs.push(<div onClick={(() => { setFilter(-1); closeAllLists(); setFilterDisplay({ img: gap, title: `filter by album...` }) })}
    className='filter-choice allalbums' key={-1} value={-1}><img src={music} /><p>all albums</p><p></p></div >)
  arr.forEach((album, index) => {
    if (album.title != 'guessed') {
      albumDivs.push(
        <div onClick={() => { setFilter(index); setFilterDisplay({ img: album.covers[0], title: album.title }) }} className='filter-choice' key={index} value={index}>
          <img src={album.covers[0]} />
          <p>{album.title}</p>
          <p>{album.year}</p>
        </div>
      )
    }
  })

  return (
    <div className='filter'>
      <div onClick={((e) => { if (!disabled) { e.stopPropagation(); setShow(s => !s); } })} id='filter-display' type='text' name='myFilter'>
        <img src={filterDisplay.img} />
        <p>{filterDisplay.title}</p>
        <img id='dropdown' src={dropdown} />
      </div>
      <div id='filter-list' className='filter-items'>
        {show && albumDivs}
      </div>
    </div >
  )
}

export default Filter;
