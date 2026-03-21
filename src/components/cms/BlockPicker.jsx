import { useState, useEffect, useRef } from 'react'
import { BDEFS, PICKER_CATS } from '../../data/blockDefs.js'

export default function BlockPicker({ open, anchorRect, onSelect, onClose }) {
  const [q, setQ] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (open) { setQ(''); setTimeout(()=>searchRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    function onKey(e) { if (e.key==='Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const top  = Math.min((anchorRect?.bottom||200)+8, window.innerHeight-420)
  const left = Math.min((anchorRect?.left||100), window.innerWidth-480)

  return (
    <>
      <div style={{position:'fixed',inset:0,zIndex:499}} onClick={onClose}/>
      <div id="block-picker" className="open" style={{top,left,zIndex:500,position:'fixed'}}>
        <input className="picker-search" ref={searchRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search blocks…"/>
        {PICKER_CATS.map(cat=>{
          const matches = cat.types.filter(t=>{ const d=BDEFS[t]; return d&&(!q||d.label.toLowerCase().includes(q.toLowerCase())||t.includes(q.toLowerCase())) })
          if (!matches.length) return null
          return (
            <div key={cat.label}>
              <div className="picker-section">{cat.label}</div>
              <div className="picker-grid">
                {matches.map(t=>{
                  const d=BDEFS[t]; if(!d) return null
                  return (
                    <div key={t} className="picker-item" onClick={()=>{ onSelect(t); onClose() }}>
                      <span className="pi-icon">{d.icon}</span>
                      <span className="pi-label">{d.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
