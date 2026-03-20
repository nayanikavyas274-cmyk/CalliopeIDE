"use client"

import { motion } from "framer-motion"

export function LogoCloud() {
  const logos = [
    { name: "Stellar", width: 120 },
    { name: "Blockchain Co", width: 140 },
    { name: "CryptoFirm", width: 130 },
    { name: "DeFi Labs", width: 120 },
    { name: "TokenTech", width: 130 },
    { name: "Web3 Ventures", width: 150 },
  ]

  return (
    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
      {logos.map((logo, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-4 rounded-lg theme-cta-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          <div
            className="theme-panel h-8 rounded-md flex items-center justify-center px-4 border group-hover:border-border transition-all duration-300"
            style={{ width: logo.width }}
          >
            <div className="theme-muted-text font-medium group-hover:text-foreground/70 transition-colors duration-300">
              {logo.name}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
