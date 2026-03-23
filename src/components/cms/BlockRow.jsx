import { useEffect, useRef, useState } from 'react'
import { BDEFS } from '../../data/blockDefs.js'

export default function BlockRow({ block, idx, onDelete, onAddAfter, openImgPop, dragHandlers, thumbnail, setThumbnail }) {
  const contentRef = useRef(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!contentRef.current || mountedRef.current) return
    mountedRef.current = true
    const def = BDEFS[block.type]
    if (!def) return
    const el = def.render(block.data, openImgPop, thumbnail, setThumbnail)
    contentRef.current.appendChild(el)
  }, [])

  // expose serialize via block object
  block._serialize = () => {
    const def = BDEFS[block.type]
    if (def && contentRef.current) {
      try { return def.ser(contentRef.current) } catch { return block.data }
    }
    return block.data
  }

  return (
    <>
      <div
        className="block-row"
        data-block-id={block.id}
        data-idx={idx}
        onMouseEnter={e => { e.currentTarget.querySelector('.block-handle')?.style && (e.currentTarget.querySelector('.block-handle').style.opacity='1'); e.currentTarget.querySelector('.block-del')?.style && (e.currentTarget.querySelector('.block-del').style.opacity='1') }}
        onMouseLeave={e => { e.currentTarget.querySelector('.block-handle')?.style && (e.currentTarget.querySelector('.block-handle').style.opacity='0'); e.currentTarget.querySelector('.block-del')?.style && (e.currentTarget.querySelector('.block-del').style.opacity='0') }}
      >
        <div
          className="block-handle"
          title="Drag to reorder"
          style={{opacity:0,transition:'opacity .15s',cursor:'grab'}}
          draggable
          {...dragHandlers}
        >
          <svg width="10" height="14" viewBox="0 0 10 14"><circle cx="3" cy="2.5" r="1.5" fill="currentColor"/><circle cx="7" cy="2.5" r="1.5" fill="currentColor"/><circle cx="3" cy="7" r="1.5" fill="currentColor"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="3" cy="11.5" r="1.5" fill="currentColor"/><circle cx="7" cy="11.5" r="1.5" fill="currentColor"/></svg>
        </div>
        <div className="block-content" ref={contentRef}/>
        <button className="block-del" title="Delete" style={{opacity:0,transition:'opacity .15s'}} onClick={onDelete}>×</button>
      </div>
      <AddRow onAdd={onAddAfter}/>
    </>
  )
}

export function AddRow({ onAdd }) {
  const [hover, setHover] = useState(false)
  return (
    <div className="add-row" style={{opacity: hover?1:0}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div className="add-line"/>
      <button className="add-btn" title="Add block" onClick={e=>{e.stopPropagation();onAdd(e)}}>+</button>
    </div>
  )
}
