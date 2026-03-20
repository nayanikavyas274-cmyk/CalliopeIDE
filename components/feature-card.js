"use client"

import { motion } from "framer-motion"

export function FeatureCard({ title, description, icon, children, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="group"
        >
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="theme-panel-strong theme-accent-text flex items-center justify-center size-10 rounded-lg group-hover:bg-accent transition-colors duration-300">
                        {icon}
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <p className="theme-muted-text">{description}</p>
            </div>

            <div className="relative group">
                <div className="absolute -inset-0.5 theme-cta-overlay rounded-lg blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative h-full">{children}</div>
            </div>
        </motion.div>
    )
}
