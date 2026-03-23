import { useState, useRef, useEffect, useCallback } from 'react'
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

const AUTOSAVE_INTERVAL = 10000 // 10 seconds
const LOCALSTORAGE_KEY = 'cms_draft_backup_'

const CAT_META = {
  photo:  { badge:'ecb-photo',  label:'📷 Photography' },
  food:   { badge:'ecb-food',   label:'🍜 Food'         },
  travel: { badge:'ecb-travel', label:'🌍 Travel'       },
  life:   { badge:'ecb-life',   label:'🧠 Life Tips'    },
  code:   { badge:'ecb-code',   label:'⌨️ Code'         },
}

export default function Editor({ cat, editId, onBack, onSaved }) {
  const { post, loading: postLoading } = usePostById(editId)
  const { createPost, updatePost, publishPost, deletePost } = usePostMutations()
  
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
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  
  const editIdRef = useRef(editId)
  const blocksRef = useRef(blocks)
  const thumbnailRef = useRef(thumbnail)
  const autoSaveTimerRef = useRef(null)
  const hasChangesRef = useRef(false)
  
  blocksRef.current = blocks
  thumbnailRef.current = thumbnail

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
      setLastSaved(post.updated_at || post.created_at)
      editIdRef.current = editId // Set the ref when editing existing post
    } else if (!editId && blocks.length === 0) {
      // New post - use template
      const template = TEMPLATES[cat]?.() || []
      setBlocks(template.map(b => ({ ...b, id: uid() })))
      
      // Try to restore from localStorage backup
      const backupKey = LOCALSTORAGE_KEY + cat
      const backup = localStorage.getItem(backupKey)
      if (backup) {
        try {
          const parsed = JSON.parse(backup)
          if (parsed.blocks && parsed.timestamp > Date.now() - 86400000) { // 24 hours
            setBlocks(parsed.blocks)
            setThumbnail(parsed.thumbnail || '')
            showToast('📦 Restored from backup')
          }
        } catch (e) {
          console.error('Failed to restore backup:', e)
        }
      }
    }
  }, [editId, post, cat])

  // Auto-save function
  const autoSaveDraft = useCallback(async () => {
    if (autoSaving || saving || blocksRef.current.length === 0) return
    
    setAutoSaving(true)
    try {
      // Serialize blocks - get current data from DOM
      const serialized = blocksRef.current.map(b => {
        const data = b._serialize?.() || b.data
        return { ...b, data }
      })
      
      const titleBlock = serialized.find(b => b.type === 'h1')
      const titleText = titleBlock?.data?.text || 'Untitled'
      
      const sanitizedBlocks = sanitizeBlocks(serialized)
      
      const postData = {
        title: titleText,
        category: cat,
        blocks: sanitizedBlocks,
        thumbnail: thumbnailRef.current || null,
        status: 'draft',
      }
      
      // Save to localStorage as backup BEFORE database save
      const backupKey = LOCALSTORAGE_KEY + cat
      localStorage.setItem(backupKey, JSON.stringify({
        blocks: blocksRef.current,
        thumbnail: thumbnailRef.current,
        timestamp: Date.now()
      }))
      
      // Save to database - update if exists, create if new
      if (editIdRef.current) {
        // Update existing draft
        await updatePost(editIdRef.current, postData)
      } else {
        // Create new draft and store its ID
        const newPost = await createPost(postData)
        editIdRef.current = newPost.id
      }
      
      // Clear localStorage backup after successful database save
      localStorage.removeItem(backupKey)
      
      setLastSaved(new Date().toISOString())
      hasChangesRef.current = false
    } catch (error) {
      console.error('Auto-save failed:', error)
      showToast('⚠️ Auto-save failed - data backed up locally')
    } finally {
      setAutoSaving(false)
    }
  }, [cat, createPost, updatePost, showToast])

  // Auto-save effect
  useEffect(() => {
    // Don't auto-save if blocks are empty (initial load)
    if (blocks.length === 0) return
    
    // Mark as changed when blocks or thumbnail change
    hasChangesRef.current = true
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      if (hasChangesRef.current && !saving && !autoSaving && blocks.length > 0) {
        autoSaveDraft()
      }
    }, AUTOSAVE_INTERVAL)
    
    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [blocks, thumbnail, autoSaveDraft, saving, autoSaving])

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
          // Clear localStorage backup when published
          localStorage.removeItem(LOCALSTORAGE_KEY + cat)
        }
      } else {
        // Create new post
        const newPost = await createPost(postData)
        editIdRef.current = newPost.id
        if (status === 'published') {
          await publishPost(newPost.id)
          // Clear localStorage backup when published
          localStorage.removeItem(LOCALSTORAGE_KEY + cat)
        }
      }

      setLastSaved(new Date().toISOString())
      hasChangesRef.current = false
      showToast(status === 'published' ? '🚀 Post published!' : '💾 Draft saved')
      onSaved?.()
    } catch (error) {
      console.error('Failed to save post:', error)
      showToast('❌ Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteDraft() {
    if (!editIdRef.current) {
      // No draft saved yet, just clear localStorage and go back
      localStorage.removeItem(LOCALSTORAGE_KEY + cat)
      onBack()
      return
    }
    
    if (!confirm('Delete this draft? This cannot be undone.')) return
    
    setSaving(true)
    try {
      await deletePost(editIdRef.current)
      localStorage.removeItem(LOCALSTORAGE_KEY + cat)
      showToast('🗑️ Draft deleted')
      setTimeout(() => onBack(), 500)
    } catch (error) {
      console.error('Failed to delete draft:', error)
      showToast('❌ Failed to delete draft')
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
        <span className="ed-hint">
          / to add block &nbsp;·&nbsp; drag ⠿ to reorder
          {autoSaving && <span style={{color:'var(--purple)',marginLeft:'12px'}}>💾 Auto-saving...</span>}
          {lastSaved && !autoSaving && (
            <span style={{color:'var(--text-dim)',marginLeft:'12px',fontSize:'10px'}}>
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </span>
        <div className="ed-actions">
          {post?.status === 'draft' && (
            <button
              className="btn-delete-draft"
              onClick={handleDeleteDraft}
              disabled={saving}
              style={{
                background:'none',
                border:'1px solid var(--card-border)',
                borderRadius:'8px',
                padding:'10px 18px',
                fontFamily:'JetBrains Mono,monospace',
                fontSize:'10px',
                letterSpacing:'2px',
                textTransform:'uppercase',
                color:'var(--orange)',
                cursor:'pointer',
                transition:'all .2s',
                marginRight:'8px'
              }}
            >
              🗑️ Delete Draft
            </button>
          )}
          <button className="btn-draft" onClick={()=>savePost('draft')} disabled={saving || autoSaving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn-pub" onClick={()=>savePost('published')} disabled={saving || autoSaving}>
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
