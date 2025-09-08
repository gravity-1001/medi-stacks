import React from 'react'
import { motion } from 'framer-motion'

interface MedicalLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const MedicalLogo: React.FC<MedicalLogoProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const LogoSVG = () => (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${className} medical-logo`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* DNA Helix Background */}
      <motion.path
        d="M20 10 Q30 25 40 40 Q50 55 60 70 Q70 85 80 90"
        stroke="url(#dnaGradient1)"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d="M80 10 Q70 25 60 40 Q50 55 40 70 Q30 85 20 90"
        stroke="url(#dnaGradient2)"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Central Medical Cross */}
      <motion.g
        animate={animated ? { rotate: 360 } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        {/* Cross Vertical */}
        <rect
          x="45"
          y="30"
          width="10"
          height="40"
          rx="5"
          fill="url(#crossGradient)"
          className="drop-shadow-lg"
        />
        {/* Cross Horizontal */}
        <rect
          x="30"
          y="45"
          width="40"
          height="10"
          rx="5"
          fill="url(#crossGradient)"
          className="drop-shadow-lg"
        />
      </motion.g>

      {/* Floating Medical Particles */}
      <motion.circle
        cx="25"
        cy="25"
        r="3"
        fill="#96E072"
        animate={animated ? {
          y: [0, -5, 0],
          opacity: [0.5, 1, 0.5]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="75"
        cy="25"
        r="2"
        fill="#0B7A75"
        animate={animated ? {
          y: [0, -3, 0],
          opacity: [0.7, 1, 0.7]
        } : {}}
        transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
      />
      <motion.circle
        cx="25"
        cy="75"
        r="2.5"
        fill="#5ABF4A"
        animate={animated ? {
          y: [0, -4, 0],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={{ duration: 1.8, delay: 1, repeat: Infinity }}
      />
      <motion.circle
        cx="75"
        cy="75"
        r="3"
        fill="#D4DCFF"
        animate={animated ? {
          y: [0, -6, 0],
          opacity: [0.4, 1, 0.4]
        } : {}}
        transition={{ duration: 2.2, delay: 0.3, repeat: Infinity }}
      />

      {/* Heartbeat Line */}
      <motion.path
        d="M10 50 L20 50 L25 40 L30 60 L35 30 L40 70 L45 50 L90 50"
        stroke="url(#heartbeatGradient)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="2,2"
        animate={animated ? {
          strokeDashoffset: [0, -20]
        } : {}}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4DCFF" />
          <stop offset="50%" stopColor="#96E072" />
          <stop offset="100%" stopColor="#0B7A75" />
        </linearGradient>
        <linearGradient id="dnaGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5ABF4A" />
          <stop offset="50%" stopColor="#0B7A75" />
          <stop offset="100%" stopColor="#96E072" />
        </linearGradient>
        <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5ABF4A" />
          <stop offset="50%" stopColor="#96E072" />
          <stop offset="100%" stopColor="#0B7A75" />
        </linearGradient>
        <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4DCFF" />
          <stop offset="25%" stopColor="#96E072" />
          <stop offset="50%" stopColor="#5ABF4A" />
          <stop offset="75%" stopColor="#0B7A75" />
          <stop offset="100%" stopColor="#D4DCFF" />
        </linearGradient>
      </defs>
    </svg>
  )

  return animated ? (
    <motion.div
      className="inline-block"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        filter: [
          "drop-shadow(0 0 10px rgba(150, 224, 114, 0.8))",
          "drop-shadow(0 0 20px rgba(11, 122, 117, 0.6))",
          "drop-shadow(0 0 10px rgba(150, 224, 114, 0.8))"
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <LogoSVG />
    </motion.div>
  ) : (
    <LogoSVG />
  )
}

export default MedicalLogo
