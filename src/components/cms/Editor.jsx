import { useState, useRef, useEffect } from 'react'
import { usePostById } from '../../hooks/usePosts.js'
import { usePostMutations } from '../../hooks/usePosts.js'
import { BDEFS } from '../../data/blockDefs.js'
import { TEMPLATES } from '../../data/templates.js'
import { validatePost, sanitizeBlocks } from '../../utils/validation.js'
import BlockRow, { AddRow } from './BlockRow.jsx'
import BlockPicker from './BlockPicker.jsx'
import ImagePopover from './ImagePopover.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const CAT_META = {
  photo:  { badge:'ecb-photo',  label:'📷 Photography' },
  food:   { badge:'ecb-food',   label:'🍜 Food'         },
  travel: { badge:'ecb-travel', label:'🌍 Travel'       },
  life:   { badge:'ecb-life',   label:'🧠 Life Tips'    },
  code:   { badge:'ecb-code',   label:'⌨️ Code'         },
}

export default function Editor({ cat, editId, onBack, onSaved }) {
  const { post, loading: postLoading } = usePostById(editId)
  const { createPost, updatePost, publishPost } = usePostMutations()
  
  const [blocks, setBlocks] = useState([])
  const [thumbnail, setThumbnail] = useState('')
  
  // Wrapper for setThumbnail - just update thumbnail, don't force re-render
  const handleSetThumbnail = (newThumbnail) => {
    setThumbnail(newThumbnail)
  }
  const [customDate, setCustomDate] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerAnchor, setPickerAnchor] = useState(null)
  const [pickerAfter, setPickerAfter] = useState(-1)
  const [imgOpen, setImgOpen] = useState(false)
  const [imgAnchor, setImgAnchor] = useState(null)
  const [imgCb, setImgCb] = useState(null)
  const [toast, setToast] = useState('')
  const [toastVis, setToastVis] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const editIdRef = useRef(editId)
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks

  // Initialize blocks and thumbnail when post loads or for new posts
  useEffect(() => {
    if (editId && post && post.blocks) {
      // Editing existing post - ensure blocks have IDs
      const loadedBlocks = post.blocks.map(b => ({
        ...b,
        id: b.id || uid()
      }))
      setBlocks(loadedBlocks)
      setThumbnail(post.thumbnail || '')
    } else if (!editId && blocks.length === 0) {
      // New post - use template
      const template = TEMPLATES[cat]?.() || []
      setBlocks(template.map(b => ({ ...b, id: uid() })))
    }
  }, [editId, post, cat])

  // drag-drop
  const dragSrcId = useRef(null)

  function showToast(msg) {
    setToast(msg); setToastVis(true)
    setTimeout(()=>setToastVis(false),2400)
  }

  function serializeAll() {
    return blocksRef.current.map(b => ({ ...b, data: b._serialize?.() || b.data }))
  }

  async function savePost(status) {
    if (saving) return
    
    setSaving(true)
    try {
      const serialized = serializeAll()
      const titleBlock = serialized.find(b => b.type === 'h1')
      const titleText = titleBlock?.data?.text || 'Untitled'
      
      // Sanitize blocks to prevent XSS
      const sanitizedBlocks = sanitizeBlocks(serialized)
      
      const postData = {
        title: titleText,
        category: cat,
        blocks: sanitizedBlocks,
        thumbnail: thumbnail || null,
        status: status === 'published' ? 'published' : 'draft',
      }

      // Validate post data
      const validation = validatePost(postData)
      if (!validation.valid) {
        const errorMessages = Object.values(validation.errors).flat().join(', ')
        showToast(`❌ Validation failed: ${errorMessages}`)
        setSaving(false)
        return
      }

      if (editIdRef.current) {
        // Update existing post
        await updatePost(editIdRef.current, postData)
        if (status === 'published') {
          await publishPost(editIdRef.current)
        }
      } else {
        // Create new post
        const newPost = await createPost(postData)
        editIdRef.current = newPost.id
        if (status === 'published') {
          await publishPost(newPost.id)
        }
      }

      showToast(status === 'published' ? '🚀 Post published!' : '💾 Draft saved')
      onSaved?.()
    } catch (error) {
      console.error('Failed to save post:', error)
      showToast('❌ Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function insertBlock(type, afterIdx) {
    const def = BDEFS[type]; if (!def) return
    const newBlock = { id:uid(), type, data:def.def() }
    setBlocks(prev => {
      const next=[...prev]
      next.splice(afterIdx+1, 0, newBlock)
      return next
    })
  }

  function deleteBlock(idx) {
    setBlocks(prev=>prev.filter((_,i)=>i!==idx))
  }

  function openPicker(afterIdx, e) {
    const rect = e?.currentTarget?.getBoundingClientRect?.()
    setPickerAfter(afterIdx); setPickerAnchor(rect||null); setPickerOpen(true)
  }

  function openImgPop(callback, e) {
    const rect = e?.currentTarget?.getBoundingClientRect?.()
    setImgCb(()=>callback); setImgAnchor(rect||null); setImgOpen(true)
  }

  // Drag handlers
  function makeDragHandlers(idx, id) {
    return {
      onDragStart(e) {
        dragSrcId.current = id
        e.dataTransfer.setData('text/plain', id)
        e.dataTransfer.effectAllowed='move'
        setTimeout(()=>e.currentTarget.classList.add('dragging'),0)
      },
      onDragEnd(e) {
        e.currentTarget.classList.remove('dragging')
        document.querySelectorAll('.block-row').forEach(r=>r.classList.remove('drag-over-top','drag-over-bottom'))
        dragSrcId.current=null
      },
      onDragOver(e) {
        if (!dragSrcId.current) return; e.preventDefault()
        const rect=e.currentTarget.getBoundingClientRect()
        const mid=rect.top+rect.height/2
        document.querySelectorAll('.block-row').forEach(r=>r.classList.remove('drag-over-top','drag-over-bottom'))
        e.currentTarget.classList.add(e.clientY<mid?'drag-over-top':'drag-over-bottom')
      },
      onDragLeave(e) { e.currentTarget.classList.remove('drag-over-top','drag-over-bottom') },
      onDrop(e) {
        e.preventDefault()
        const srcId=dragSrcId.current; if(!srcId||srcId===id) return
        document.querySelectorAll('.block-row').forEach(r=>r.classList.remove('drag-over-top','drag-over-bottom'))
        setBlocks(prev=>{
          const srcIdx=prev.findIndex(b=>b.id===srcId)
          const tgtIdx=prev.findIndex(b=>b.id===id)
          if (srcIdx===-1||tgtIdx===-1) return prev
          const rect=e.currentTarget.getBoundingClientRect()
          const insertAfter=e.clientY>=(rect.top+rect.height/2)
          const next=[...prev]
          const [moved]=next.splice(srcIdx,1)
          const newTgt=next.findIndex(b=>b.id===id)
          next.splice(insertAfter?newTgt+1:newTgt,0,moved)
          return next
        })
      },
    }
  }

  const meta = CAT_META[cat]||{badge:'',label:cat}

  // Show loading spinner while fetching post
  if (postLoading && editId) {
    return (
      <div id="p-editor" style={{display:'flex',alignItems:'center',justifyContent:'center',flex:1}}>
        <LoadingSpinner size="large" message="Loading post..." />
      </div>
    )
  }

  return (
    <div id="p-editor" style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="ed-header">
        <button className="ed-back" onClick={onBack} disabled={saving}>← Back</button>
        <div className={`ed-badge ${meta.badge}`}>{meta.label}</div>
        <span className="ed-hint">/ to add block &nbsp;·&nbsp; drag ⠿ to reorder</span>
        <div className="ed-actions">
          <button className="btn-draft" onClick={()=>savePost('draft')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn-pub" onClick={()=>savePost('published')} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish →'}
          </button>
        </div>
      </div>

      <div className="ed-canvas">
        <div className="ed-inner">
          <AddRow onAdd={e=>openPicker(-1,e)}/>
          {blocks.map((block,idx)=>(
            <BlockRow
              key={block.id}
              block={block}
              idx={idx}
              onDelete={()=>deleteBlock(idx)}
              onAddAfter={e=>openPicker(idx,e)}
              openImgPop={(cb)=>openImgPop(cb)}
              dragHandlers={makeDragHandlers(idx, block.id)}
              thumbnail={thumbnail}
              setThumbnail={handleSetThumbnail}
            />
          ))}
        </div>
      </div>

      <BlockPicker
        open={pickerOpen}
        anchorRect={pickerAnchor}
        onSelect={type=>insertBlock(type, pickerAfter)}
        onClose={()=>setPickerOpen(false)}
      />
      <ImagePopover
        open={imgOpen}
        anchorRect={imgAnchor}
        onInsert={src=>imgCb&&imgCb(src)}
        onClose={()=>setImgOpen(false)}
      />
      <div id="toast" className={toastVis?'show':''}>{toast}</div>
    </div>
  )
}
