"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Menu, 
    X, 
    FolderOpen, 
    Settings, 
    Play, 
    Save,
    MessageSquare,
    Send,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample code lines for the editor preview
const CODE_LINES = [
    { num: 1,  code: "" },
    { num: 2,  code: "use soroban_sdk::{contract, contractimpl, Env, Symbol};" },
    { num: 3,  code: "" },
    { num: 4,  code: "#[contract]" },
    { num: 5,  code: "pub struct TokenContract;" },
    { num: 6,  code: "" },
    { num: 7,  code: "#[contractimpl]" },
    { num: 8,  code: "impl TokenContract {" },
    { num: 9,  code: "    pub fn initialize(env: Env, admin: Address) {" },
    { num: 10, code: "        env.storage().instance().set(&Symbol::short(\"admin\"), &admin);" },
    { num: 11, code: "    }" },
    { num: 12, code: "" },
    { num: 13, code: "    pub fn mint(env: Env, to: Address, amount: i128) {" },
    { num: 14, code: "        // mint logic here" },
    { num: 15, code: "    }" },
    { num: 16, code: "}" },
]

export default function IDEApp() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [chatOpen, setChatOpen] = useState(true)
    const [message, setMessage] = useState("")
    const [isMobile, setIsMobile] = useState(false)
    const chatMessagesRef = useRef(null)

    // Detect mobile and auto-collapse panels accordingly
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) {
                setSidebarOpen(false)
                setChatOpen(false)
            } else if (window.innerWidth >= 1024) {
                setSidebarOpen(true)
                setChatOpen(true)
            }
        }
        
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const sidebarVariants = {
        open:   { x: 0,      opacity: 1 },
        closed: { x: "-100%", opacity: 0 },
    }

    const chatVariants = {
        open:   { x: 0,     opacity: 1 },
        closed: { x: "100%", opacity: 0 },
    }

    const closeAllOverlays = () => {
        setSidebarOpen(false)
        setChatOpen(false)
    }

    return (
        <div className="flex h-[100dvh] bg-[#0D1117] text-white overflow-hidden">
            {/* ── Mobile Backdrop ── */}
            <AnimatePresence>
                {isMobile && (sidebarOpen || chatOpen) && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-30 md:hidden touch-none"
                        onClick={closeAllOverlays}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* ── Sidebar ── */}
            <AnimatePresence>
                {(sidebarOpen || !isMobile) && (
                    <motion.aside
                        key="sidebar"
                        initial={isMobile ? "closed" : false}
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        aria-label="File Explorer"
                        className={[
                            "bg-[#161B22] border-r border-gray-700 flex flex-col shrink-0",
                            isMobile
                                ? "fixed left-0 top-0 h-full z-40 w-72 max-w-[80vw] shadow-2xl"
                                : sidebarOpen
                                    ? "relative w-64 lg:w-72"
                                    : "relative w-0 overflow-hidden",
                        ].join(" ")}
                    >
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 min-h-[48px]">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300 truncate">
                                Explorer
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Close sidebar"
                                className="ml-2 shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* File Explorer */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                            {[
                                { icon: <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />, label: "src/",        indent: false },
                                { icon: <span className="w-4 text-center text-xs shrink-0">📄</span>, label: "contract.rs", indent: true },
                                { icon: <span className="w-4 text-center text-xs shrink-0">📄</span>, label: "lib.rs",      indent: true },
                                { icon: <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />, label: "tests/",      indent: false },
                                { icon: <span className="w-4 text-center text-xs shrink-0">📄</span>, label: "Cargo.toml", indent: false },
                            ].map(({ icon, label, indent }) => (
                                <div
                                    key={label}
                                    className={[
                                        "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700 cursor-pointer transition-colors",
                                        indent ? "ml-4" : "",
                                    ].join(" ")}
                                >
                                    {icon}
                                    <span className="text-sm truncate">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-3 border-t border-gray-700">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-gray-400 hover:text-white h-9 px-2"
                            >
                                <Settings className="w-4 h-4 shrink-0" />
                                <span className="truncate">Settings</span>
                            </Button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Toolbar */}
                <div className="h-12 bg-[#161B22] border-b border-gray-700 flex items-center px-3 gap-2 shrink-0">
                    {/* Left: sidebar toggle + filename */}
                    <div className="flex items-center gap-2 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                            className="h-8 w-8 p-0 shrink-0 text-gray-400 hover:text-white"
                        >
                            {sidebarOpen && !isMobile
                                ? <ChevronLeft className="w-4 h-4" />
                                : <Menu className="w-4 h-4" />
                            }
                        </Button>
                        <span className="text-sm text-gray-400 truncate">contract.rs</span>
                    </div>

                    <div className="flex-1" />

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex items-center gap-1 h-8 px-2 text-gray-400 hover:text-white"
                        >
                            <Save className="w-4 h-4" />
                            <span className="text-xs">Save</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex items-center gap-1 h-8 px-2 text-gray-400 hover:text-white"
                        >
                            <Play className="w-4 h-4" />
                            <span className="text-xs">Run</span>
                        </Button>
                        {/* Mobile-only icon-only Save / Run */}
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Save"
                            className="sm:hidden h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                            <Save className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Run"
                            className="sm:hidden h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                            <Play className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setChatOpen(!chatOpen)}
                            aria-label={chatOpen ? "Close chat" : "Open chat"}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Editor + Chat Container */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* ── Code Editor ── */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex-1 bg-[#0D1117] overflow-auto">
                            {/* Line numbers + code in a side-by-side grid so numbers never clip */}
                            <div className="inline-grid min-w-full" style={{ gridTemplateColumns: "auto 1fr" }}>
                                {/* Gutter (line numbers) */}
                                <div
                                    className="select-none text-right pr-4 pl-4 py-4 text-gray-500 font-mono text-sm leading-6 border-r border-gray-800 bg-[#0D1117] sticky left-0"
                                    aria-hidden="true"
                                >
                                    {CODE_LINES.map(({ num }) => (
                                        <div key={num} className="leading-6">{num}</div>
                                    ))}
                                </div>
                                {/* Code content */}
                                <div className="py-4 pl-4 pr-8 font-mono text-sm leading-6 text-gray-200 whitespace-pre overflow-x-auto">
                                    {CODE_LINES.map(({ num, code }) => (
                                        <div key={num} className="leading-6">{code || "\u00A0"}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Chat Panel ── */}
                    <AnimatePresence>
                        {(chatOpen || !isMobile) && (
                            <motion.div
                                key="chat"
                                initial={isMobile ? "closed" : false}
                                animate="open"
                                exit="closed"
                                variants={chatVariants}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                aria-label="AI Chat"
                                className={[
                                    "bg-[#161B22] border-l border-gray-700 flex flex-col shrink-0",
                                    isMobile
                                        ? "fixed right-0 top-0 h-full z-40 w-80 max-w-[88vw] shadow-2xl"
                                        : chatOpen
                                            ? "relative w-80 lg:w-96"
                                            : "relative w-0 overflow-hidden",
                                ].join(" ")}
                            >
                                {/* Chat Header */}
                                <div className="flex items-center justify-between px-4 border-b border-gray-700 min-h-[48px] shrink-0">
                                    <h3 className="text-sm font-semibold truncate">AI Assistant</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setChatOpen(false)}
                                        aria-label="Close chat"
                                        className="ml-2 shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Chat Messages */}
                                <div
                                    ref={chatMessagesRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
                                >
                                    <div className="bg-[#0D1117] p-3 rounded-lg max-w-[90%]">
                                        <p className="text-sm leading-relaxed">
                                            Hello! I&apos;m your AI assistant for Soroban smart contract development. How can I help you today?
                                        </p>
                                    </div>

                                    <div className="bg-blue-600 p-3 rounded-lg ml-auto max-w-[85%]">
                                        <p className="text-sm leading-relaxed">Can you help me write a token contract?</p>
                                    </div>

                                    <div className="bg-[#0D1117] p-3 rounded-lg max-w-[90%]">
                                        <p className="text-sm leading-relaxed">
                                            Absolutely! I&apos;ll help you create a basic Soroban token contract. Let me start with the basic structure&hellip;
                                        </p>
                                    </div>
                                </div>

                                {/* Chat Input — pinned to bottom, safe on mobile keyboards */}
                                <div className="p-3 border-t border-gray-700 shrink-0 pb-[env(safe-area-inset-bottom,12px)]">
                                    <div className="flex items-end gap-2">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Ask about your code…"
                                            aria-label="Chat message input"
                                            className="flex-1 min-w-0 bg-[#0D1117] border border-gray-600 rounded-lg px-3 py-2 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] placeholder-gray-500"
                                            style={{ fontSize: "16px" }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault()
                                                    setMessage("")
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Send message"
                                            className="shrink-0 h-10 w-10 p-0 text-gray-400 hover:text-white"
                                            onClick={() => setMessage("")}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}