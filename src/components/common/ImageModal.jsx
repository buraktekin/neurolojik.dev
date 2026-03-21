import { useEffect } from 'react'

export default function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])
  
  if (!src) return null
  
  return (
    <div
      className="image-modal-overlay"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="image-modal-close" 
          onClick={onClose}
          aria-label="Close image viewer"
        >
          ✕
        </button>
        <img 
          src={src} 
          alt={alt || 'Full size image'} 
          className="image-modal-img"
        />
      </div>
    </div>
  )
}

// Made with Bob
