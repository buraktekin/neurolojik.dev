/**
 * Compress and resize image for optimal storage and display
 * @param {File|string} input - File object or base64 string
 * @param {number} maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} quality - JPEG quality 0-1 (default: 0.85)
 * @returns {Promise<string>} - Compressed image as base64 data URL
 */
export async function compressImage(input, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to base64 with compression
      const compressed = canvas.toDataURL('image/jpeg', quality)
      resolve(compressed)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    
    // Load image
    if (input instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => { img.src = e.target.result }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(input)
    } else if (typeof input === 'string') {
      img.src = input
    } else {
      reject(new Error('Invalid input type'))
    }
  })
}

/**
 * Get optimized image dimensions
 * @param {string} src - Image source
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

// Made with Bob
