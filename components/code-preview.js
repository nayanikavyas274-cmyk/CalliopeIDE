"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

import { useTheme } from "@/components/theme-provider"

export function CodePreview() {
    const [currentLine, setCurrentLine] = useState(0)
    const [isTyping, setIsTyping] = useState(false)
    const [typedText, setTypedText] = useState("")
    const typingIntervalRef = useRef()
    const cursorRef = useRef(null)
    const { theme } = useTheme()

    const code = [
        "pub struct TokenContract {",
        "    admin: Address,",
        "    total_supply: u128,",
        "    balances: Map<Address, u128>,",
        "}",
        "",
        "#[contractimpl]",
        "impl TokenContract {",
        "    pub fn initialize(env: Env, admin: Address, total_supply: u128) -> Self {",
        "        let mut balances = Map::new(&env);",
        "        balances.set(admin.clone(), total_supply);",
        "",
        "        Self {",
        "            admin,",
        "            total_supply,",
        "            balances,",
        "        }",
        "    }",
        "}",
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLine((prev) => (prev + 1) % code.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [code.length])

    useEffect(() => {
        if (currentLine === 20 || currentLine === 24 || currentLine === 25) {
            setIsTyping(true)
            setTypedText("")

            const textToType = code[currentLine]
            let charIndex = 0

            typingIntervalRef.current = setInterval(() => {
                if (charIndex < textToType.length) {
                    setTypedText(textToType.substring(0, charIndex + 1))
                    charIndex++
                } else {
                    clearInterval(typingIntervalRef.current)
                    setIsTyping(false)
                }
            }, 50)
        }

        return () => {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current)
            }
        }
    }, [currentLine, code])

    useEffect(() => {
        if (cursorRef.current && currentLine === 25) {
            const lineElement = document.getElementById(`code-line-${currentLine}`)
            if (lineElement) {
                const rect = lineElement.getBoundingClientRect()
                cursorRef.current.style.top = `${rect.top + 2}px`
                cursorRef.current.style.left = `${rect.left + typedText.length * 7.8}px`
            }
        }
    }, [currentLine, typedText])

    return (
        <div data-testid="code-preview-surface" className="theme-editor-surface rounded-lg border p-4 h-full font-mono text-sm overflow-hidden relative">
            <div className="flex items-center gap-2 mb-3">
                <div className="size-3 rounded-full bg-red-500"></div>
                <div className="size-3 rounded-full bg-yellow-500"></div>
                <div className="size-3 rounded-full bg-green-500"></div>
                <span className="theme-muted-text text-xs ml-2">token_contract.rs</span>
            </div>

            <div className="space-y-0.5 relative">
                {code.map((line, index) => (
                    <motion.div
                        id={`code-line-${index}`}
                        key={index}
                        initial={{ opacity: 0.5 }}
                        animate={{
                            opacity: index === currentLine ? 1 : 0.5,
                            color: index === currentLine ? (theme === "dark" ? "#ffffff" : "#111827") : (theme === "dark" ? "#b5b5b5" : "#4b5563"),
                            backgroundColor: index === currentLine ? (theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.06)") : "transparent",
                        }}
                        transition={{ duration: 0.3 }}
                        className="whitespace-pre rounded px-1"
                    >
                        <span className="theme-code-line-number mr-4 select-none">{index + 1}</span>
                        {isTyping && index === currentLine ? typedText : line}
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        ref={cursorRef}
                        className="absolute h-5 w-[2px] bg-foreground"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                    />
                )}
            </div>
        </div>
    )
}
