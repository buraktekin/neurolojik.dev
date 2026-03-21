/**
 * Unique animated placeholder for posts without thumbnails
 * Creates a neural network-inspired visualization based on post category
 */
export default function PostPlaceholder({ category }) {
  const categoryThemes = {
    photo: {
      primary: '#00d4ff',
      secondary: '#a855f7',
      icon: '📷',
      pattern: 'camera'
    },
    food: {
      primary: '#ff5e2c',
      secondary: '#ffd166',
      icon: '🍜',
      pattern: 'food'
    },
    travel: {
      primary: '#a855f7',
      secondary: '#00d4ff',
      icon: '🌍',
      pattern: 'travel'
    },
    life: {
      primary: '#00f5a0',
      secondary: '#00d4ff',
      icon: '🧠',
      pattern: 'life'
    },
    code: {
      primary: '#00d4ff',
      secondary: '#a855f7',
      icon: '⌨️',
      pattern: 'code'
    }
  }

  const theme = categoryThemes[category] || categoryThemes.code

  return (
    <div className="post-placeholder-wrapper">
      <svg 
        className="post-placeholder-svg" 
        viewBox="0 0 400 250" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`grad-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: theme.primary, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: theme.secondary, stopOpacity: 0.4 }} />
          </linearGradient>
          
          <radialGradient id={`radial-${category}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: theme.primary, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: theme.secondary, stopOpacity: 0.1 }} />
          </radialGradient>

          {/* Animated glow filter */}
          <filter id={`glow-${category}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="#03030c"/>
        
        {/* Neural network pattern */}
        <g className="neural-pattern" opacity="0.4">
          {/* Nodes */}
          <circle cx="80" cy="60" r="4" fill={theme.primary} className="pulse-node" style={{ animationDelay: '0s' }}/>
          <circle cx="150" cy="80" r="3" fill={theme.secondary} className="pulse-node" style={{ animationDelay: '0.3s' }}/>
          <circle cx="220" cy="50" r="4" fill={theme.primary} className="pulse-node" style={{ animationDelay: '0.6s' }}/>
          <circle cx="320" cy="90" r="3" fill={theme.secondary} className="pulse-node" style={{ animationDelay: '0.9s' }}/>
          
          <circle cx="100" cy="150" r="3" fill={theme.secondary} className="pulse-node" style={{ animationDelay: '0.2s' }}/>
          <circle cx="180" cy="170" r="4" fill={theme.primary} className="pulse-node" style={{ animationDelay: '0.5s' }}/>
          <circle cx="280" cy="160" r="3" fill={theme.secondary} className="pulse-node" style={{ animationDelay: '0.8s' }}/>
          
          <circle cx="120" cy="210" r="4" fill={theme.primary} className="pulse-node" style={{ animationDelay: '0.4s' }}/>
          <circle cx="240" cy="200" r="3" fill={theme.secondary} className="pulse-node" style={{ animationDelay: '0.7s' }}/>
          
          {/* Connections */}
          <line x1="80" y1="60" x2="150" y2="80" stroke={theme.primary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          <line x1="150" y1="80" x2="220" y2="50" stroke={theme.secondary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          <line x1="220" y1="50" x2="320" y2="90" stroke={theme.primary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          
          <line x1="80" y1="60" x2="100" y2="150" stroke={theme.secondary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          <line x1="150" y1="80" x2="180" y2="170" stroke={theme.primary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          <line x1="220" y1="50" x2="280" y2="160" stroke={theme.secondary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          
          <line x1="100" y1="150" x2="120" y2="210" stroke={theme.primary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          <line x1="180" y1="170" x2="240" y2="200" stroke={theme.secondary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
          <line x1="280" y1="160" x2="240" y2="200" stroke={theme.primary} strokeWidth="1" opacity="0.3" className="pulse-line"/>
        </g>

        {/* Center glow */}
        <circle 
          cx="200" 
          cy="125" 
          r="60" 
          fill={`url(#radial-${category})`}
          className="center-glow"
        />

        {/* Category icon */}
        <text 
          x="200" 
          y="140" 
          fontSize="48" 
          textAnchor="middle" 
          className="category-icon"
          filter={`url(#glow-${category})`}
        >
          {theme.icon}
        </text>
      </svg>

      <style>{`
        .post-placeholder-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .post-placeholder-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .pulse-node {
          animation: pulse 2s ease-in-out infinite;
        }

        .pulse-line {
          animation: pulse-line 3s ease-in-out infinite;
        }

        .center-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .category-icon {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; r: 3; }
          50% { opacity: 1; r: 5; }
        }

        @keyframes pulse-line {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

// Made with Bob
