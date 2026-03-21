import { useState, useRef, useEffect } from 'react'

export default function ImagePopover({ open, anchorRect, onInsert, onClose }) {
  const [tab,     setTab]     = useState('upload')
  const [src,     setSrc]     = useState('')
  const [urlVal,  setUrlVal]  = useState('')
  const [dragging,setDragging]= useState(false)
  const fileRef = useRef(null)

  useEffect(() => { if (!open) { setSrc(''); setUrlVal('') } }, [open])

  if (!open) return null

  const top  = Math.min((anchorRect?.bottom||200)+8, window.innerHeight-360)
  const left = Math.min((anchorRect?.left||100), window.innerWidth-320)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setSrc(e.target.result)
    reader.readAsDataURL(file)
  }

  function onInsertClick() {
    const finalSrc = tab==='upload' ? src : urlVal.trim()
    if (!finalSrc) return
    onInsert(finalSrc); onClose()
  }

  return (
    <>
      <div style={{position:'fixed',inset:0,zIndex:599}} onClick={onClose}/>
      <div id="img-pop" className="open" style={{top,left,zIndex:600,position:'fixed'}}>
        <div className="ip-title">// insert image</div>
        <div className="ip-tabs">
          {['upload','url'].map(t=>(
            <button key={t} className={`ip-tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t==='upload'?'Upload':'URL'}</button>
          ))}
        </div>

        {tab==='upload' && (
          <div id="ipp-upload" className="ip-panel active">
            <div
              className={`ip-drop${dragging?' drag':''}`}
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}
              onClick={()=>fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
              <div className="ip-drop-icon">📁</div>
              <p>Click or drag image</p>
            </div>
            {src && <img className="ip-preview" src={src} alt="" style={{display:'block'}}/>}
          </div>
        )}

        {tab==='url' && (
          <div id="ipp-url" className="ip-panel active">
            <input className="ip-url" value={urlVal} onChange={e=>setUrlVal(e.target.value)} placeholder="https://…" type="url"/>
          </div>
        )}

        <button className="ip-ok"     onClick={onInsertClick}>Insert →</button>
        <button className="ip-cancel" onClick={onClose}>Cancel</button>
      </div>
    </>
  )
}
