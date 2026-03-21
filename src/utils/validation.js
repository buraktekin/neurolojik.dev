/**
 * Input Validation and Sanitization Utilities
 * Provides validation and sanitization for user inputs
 */
import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

/**
 * Sanitize plain text (removes all HTML)
 */
export function sanitizeText(text) {
  if (!text) return ''
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate post title
 */
export function validateTitle(title) {
  const errors = []
  
  if (!title || title.trim().length === 0) {
    errors.push('Title is required')
  } else if (title.length < 3) {
    errors.push('Title must be at least 3 characters')
  } else if (title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: sanitizeText(title),
  }
}

/**
 * Validate post category
 */
export function validateCategory(category) {
  const validCategories = ['photo', 'food', 'travel', 'life', 'code']
  const errors = []
  
  if (!category) {
    errors.push('Category is required')
  } else if (!validCategories.includes(category)) {
    errors.push('Invalid category')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: category,
  }
}

/**
 * Validate post status
 */
export function validateStatus(status) {
  const validStatuses = ['draft', 'published', 'hidden']
  const errors = []
  
  if (!status) {
    errors.push('Status is required')
  } else if (!validStatuses.includes(status)) {
    errors.push('Invalid status')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: status,
  }
}

/**
 * Validate image URL
 */
export function validateImageUrl(url) {
  const errors = []
  
  if (!url) {
    errors.push('Image URL is required')
  } else if (!isValidUrl(url)) {
    errors.push('Invalid URL format')
  } else {
    // Check if it's an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
    const isUnsplash = url.includes('unsplash.com')
    const isImgur = url.includes('imgur.com')
    const isCloudinary = url.includes('cloudinary.com')
    
    if (!hasImageExtension && !isUnsplash && !isImgur && !isCloudinary) {
      errors.push('URL must be an image (jpg, png, gif, webp, svg) or from a supported service')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: sanitizeText(url),
  }
}

/**
 * Validate code block
 */
export function validateCode(code, language) {
  const errors = []
  
  if (!code || code.trim().length === 0) {
    errors.push('Code is required')
  } else if (code.length > 10000) {
    errors.push('Code must be less than 10,000 characters')
  }
  
  const validLanguages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown']
  
  if (language && !validLanguages.includes(language)) {
    errors.push('Invalid programming language')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: sanitizeText(code),
    language: language || 'javascript',
  }
}

/**
 * Validate text content
 */
export function validateText(text, minLength = 0, maxLength = 5000) {
  const errors = []
  
  if (!text || text.trim().length === 0) {
    if (minLength > 0) {
      errors.push('Text is required')
    }
  } else if (text.length < minLength) {
    errors.push(`Text must be at least ${minLength} characters`)
  } else if (text.length > maxLength) {
    errors.push(`Text must be less than ${maxLength} characters`)
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: sanitizeHtml(text),
  }
}

/**
 * Validate tags array
 */
export function validateTags(tags) {
  const errors = []
  
  if (!Array.isArray(tags)) {
    errors.push('Tags must be an array')
    return { valid: false, errors, sanitized: [] }
  }
  
  if (tags.length > 10) {
    errors.push('Maximum 10 tags allowed')
  }
  
  const sanitized = tags
    .map(tag => sanitizeText(tag).trim())
    .filter(tag => tag.length > 0 && tag.length <= 30)
    .slice(0, 10) // Limit to 10 tags
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  }
}

/**
 * Validate entire post data
 */
export function validatePost(postData) {
  const errors = {}
  let isValid = true
  
  // Validate title
  const titleValidation = validateTitle(postData.title)
  if (!titleValidation.valid) {
    errors.title = titleValidation.errors
    isValid = false
  }
  
  // Validate category
  const categoryValidation = validateCategory(postData.category)
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.errors
    isValid = false
  }
  
  // Validate status
  if (postData.status) {
    const statusValidation = validateStatus(postData.status)
    if (!statusValidation.valid) {
      errors.status = statusValidation.errors
      isValid = false
    }
  }
  
  // Validate blocks
  if (!postData.blocks || !Array.isArray(postData.blocks)) {
    errors.blocks = ['Blocks must be an array']
    isValid = false
  } else if (postData.blocks.length === 0) {
    errors.blocks = ['Post must have at least one block']
    isValid = false
  } else if (postData.blocks.length > 100) {
    errors.blocks = ['Post cannot have more than 100 blocks']
    isValid = false
  }
  
  // Validate tags
  if (postData.tags) {
    const tagsValidation = validateTags(postData.tags)
    if (!tagsValidation.valid) {
      errors.tags = tagsValidation.errors
      isValid = false
    }
  }
  
  return {
    valid: isValid,
    errors,
  }
}

/**
 * Sanitize block data based on block type
 */
export function sanitizeBlock(block) {
  if (!block || !block.type || !block.data) {
    return null
  }
  
  const sanitized = { ...block }
  
  switch (block.type) {
    case 'h1':
    case 'h2':
    case 'h3':
      sanitized.data.text = sanitizeText(block.data.text)
      break
      
    case 'p':
    case 'quote':
      sanitized.data.text = sanitizeHtml(block.data.text)
      break
      
    case 'code':
      const codeValidation = validateCode(block.data.code, block.data.lang)
      sanitized.data.code = codeValidation.sanitized
      sanitized.data.lang = codeValidation.language
      break
      
    case 'img':
      const imgValidation = validateImageUrl(block.data.src)
      if (imgValidation.valid) {
        sanitized.data.src = imgValidation.sanitized
        sanitized.data.alt = sanitizeText(block.data.alt || '')
        sanitized.data.caption = sanitizeText(block.data.caption || '')
      } else {
        return null // Invalid image block
      }
      break
      
    case 'location':
    case 'dish':
    case 'meal':
      sanitized.data.name = sanitizeText(block.data.name)
      if (block.data.tags) {
        const tagsValidation = validateTags(block.data.tags)
        sanitized.data.tags = tagsValidation.sanitized
      }
      break
      
    default:
      // For other block types, sanitize all text fields
      Object.keys(sanitized.data).forEach(key => {
        if (typeof sanitized.data[key] === 'string') {
          sanitized.data[key] = sanitizeText(sanitized.data[key])
        }
      })
  }
  
  return sanitized
}

/**
 * Sanitize all blocks in a post
 */
export function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return []
  
  return blocks
    .map(block => sanitizeBlock(block))
    .filter(block => block !== null)
}

