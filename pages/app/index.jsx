"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
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
    LogOut,
    User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

// ─── Auth helpers (same localStorage keys as useAuth.js) ─────────────────────
function getToken()   { return typeof window !== "undefined" ? localStorage.getItem("access_token")  : null }
function getRefresh() { return typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null }
function clearTokens() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}

async function refreshAccessToken() {
    const refresh = getRefresh()
    if (!refresh) return null
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refresh }),
        })
        if (!res.ok) return null
        const data = await res.json()
        if (data.access_token) {
            localStorage.setItem("access_token", data.access_token)
            return data.access_token
        }
    } catch { /* network error */ }
    return null
}

async function fetchCurrentUser(token) {
    try {
        let res = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) {
            const newToken = await refreshAccessToken()
            if (!newToken) return null
            res = await fetch(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${newToken}` },
            })
        }
        if (!res.ok) return null
        const data = await res.json()
        return data.user ?? null
    } catch {
        return null
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function IDEApp() {
    const router = useRouter()

    // Auth state
    const [user, setUser]           = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [chatOpen, setChatOpen]       = useState(true)
    const [message, setMessage]         = useState("")
    const [isMobile, setIsMobile]       = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    // ── Auth guard on mount ───────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            const token = getToken()
            if (!token) {
                router.replace("/login")
                return
            }
            const userData = await fetchCurrentUser(token)
            if (!userData) {
                clearTokens()
                router.replace("/login")
                return
            }
            setUser(userData)
            setAuthLoading(false)
        }
        init()
    }, [router])

    // ── Logout ────────────────────────────────────────────────────────────────
    async function logout() {
        const token = getToken()
        if (token) {
            try {
                await fetch(`${BACKEND_URL}/api/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                })
            } catch { /* best-effort */ }
        }
        clearTokens()
        router.push("/login")
    }

    // ── Responsive helpers ───────────────────────────────────────────────────
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) { setSidebarOpen(false); setChatOpen(false) }
            else if (window.innerWidth >= 1024) { setSidebarOpen(true); setChatOpen(true) }
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // ── Loading / auth guard screen ──────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0D1117]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Authenticating…</span>
                </div>
            </div>
        )
    }

    // ── Variants ─────────────────────────────────────────────────────────────
    const sidebarVariants = { open: { x: 0, opacity: 1 }, closed: { x: "-100%", opacity: 0 } }
    const chatVariants    = { open: { x: 0, opacity: 1 }, closed: { x: "100%",  opacity: 0 } }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-[#0D1117] text-white overflow-hidden">

            {/* Mobile Backdrop */}
            {isMobile && (sidebarOpen || chatOpen) && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => { setSidebarOpen(false); setChatOpen(false) }}
                />
            )}

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <AnimatePresence>
                {(sidebarOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? "closed" : "open"}
                        animate="open" exit="closed"
                        variants={sidebarVariants}
                        transition={{ duration: 0.3 }}
                        className={`
                            ${isMobile ? "fixed left-0 top-0 h-full z-40 w-80 max-w-[80vw]" : "relative"}
                            ${!isMobile && !sidebarOpen ? "w-0" : ""}
                            ${!isMobile && sidebarOpen  ? "w-64 lg:w-80" : ""}
                            bg-[#161B22] border-r border-gray-700 flex flex-col
                        `}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-lg font-semibold">Explorer</h2>
                            <Button variant="ghost" size="sm"
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 h-auto text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {[
                                    { label: "src/",         icon: <FolderOpen className="w-4 h-4 text-blue-400" />, indent: false },
                                    { label: "contract.rs",  icon: <span className="text-xs">📄</span>, indent: true },
                                    { label: "lib.rs",       icon: <span className="text-xs">📄</span>, indent: true },
                                    { label: "tests/",       icon: <FolderOpen className="w-4 h-4 text-blue-400" />, indent: false },
                                    { label: "Cargo.toml",   icon: <span className="text-xs">📄</span>, indent: false },
                                ].map(({ label, icon, indent }) => (
                                    <div key={label}
                                        className={`flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer ${indent ? "ml-4" : ""}`}>
                                        {icon}
                                        <span className="text-sm">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-700">
                            <Button variant="ghost" size="sm"
                                className="w-full justify-start text-gray-400 hover:text-white">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Toolbar */}
                <div className="h-12 bg-[#161B22] border-b border-gray-700 flex items-center px-4 gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1 h-auto text-gray-400 hover:text-white">
                            <Menu className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-400">contract.rs</span>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm"
                            className="hidden sm:flex p-1 h-auto text-gray-400 hover:text-white">
                            <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button variant="ghost" size="sm"
                            className="hidden sm:flex p-1 h-auto text-gray-400 hover:text-white">
                            <Play className="w-4 h-4 mr-1" /> Run
                        </Button>
                        <Button variant="ghost" size="sm"
                            onClick={() => setChatOpen(!chatOpen)}
                            className="p-1 h-auto text-gray-400 hover:text-white">
                            <MessageSquare className="w-4 h-4" />
                        </Button>

                        {/* ── User avatar + dropdown ─────────────────────── */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(o => !o)}
                                className="flex items-center gap-2 ml-2 focus:outline-none"
                                aria-label="User menu"
                            >
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="w-7 h-7 rounded-full border border-gray-600 object-cover"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                                        {user?.username?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-10 w-52 bg-[#1e2a38] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                                    >
                                        {/* User info */}
                                        <div className="px-4 py-3 border-b border-gray-700">
                                            <p className="text-sm font-medium truncate">{user?.full_name || user?.username}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                            {user?.oauth_provider && (
                                                <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 capitalize">
                                                    via {user.oauth_provider}
                                                </span>
                                            )}
                                        </div>

                                        {/* Profile */}
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                            onClick={() => { setUserMenuOpen(false) /* TODO: navigate to profile */ }}
                                        >
                                            <User className="w-4 h-4" /> Profile
                                        </button>

                                        {/* Logout */}
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                                            onClick={() => { setUserMenuOpen(false); logout() }}
                                        >
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Editor + Chat */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Code Editor */}
                    <div className={`flex-1 flex flex-col min-w-0 ${!isMobile && chatOpen ? "lg:flex-1" : "flex-1"}`}>
                        <div className="flex-1 bg-[#0D1117] p-4 overflow-auto">
                            <div className="font-mono text-sm space-y-1">
                                {Array.from({ length: 15 }, (_, i) => (
                                    <div key={i + 1} className="text-gray-500">{i + 1}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <AnimatePresence>
                        {(chatOpen || !isMobile) && (
                            <motion.div
                                initial={isMobile ? "closed" : "open"}
                                animate="open" exit="closed"
                                variants={chatVariants}
                                transition={{ duration: 0.3 }}
                                className={`
                                    ${isMobile ? "fixed right-0 top-0 h-full z-40 w-80 max-w-[80vw]" : "relative"}
                                    ${!isMobile && !chatOpen ? "w-0" : ""}
                                    ${!isMobile && chatOpen  ? "w-80 lg:w-96" : ""}
                                    bg-[#161B22] border-l border-gray-700 flex flex-col
                                `}
                            >
                                <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4">
                                    <h3 className="text-sm font-semibold">AI Assistant</h3>
                                    <Button variant="ghost" size="sm"
                                        onClick={() => setChatOpen(false)}
                                        className="p-1 h-auto text-gray-400 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="bg-[#0D1117] p-3 rounded-lg">
                                        <p className="text-sm">
                                            Hello{user ? `, ${user.full_name || user.username}` : ""}! I'm your AI assistant for Soroban smart contract development. How can I help you today?
                                        </p>
                                    </div>
                                    <div className="bg-blue-600 p-3 rounded-lg ml-8">
                                        <p className="text-sm">Can you help me write a token contract?</p>
                                    </div>
                                    <div className="bg-[#0D1117] p-3 rounded-lg">
                                        <p className="text-sm">Absolutely! I'll help you create a basic Soroban token contract. Let me start with the basic structure…</p>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Ask about your code..."
                                            className="flex-1 bg-[#0D1117] border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
                                            onKeyPress={e => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault()
                                                    setMessage("")
                                                }
                                            }}
                                        />
                                        <Button variant="ghost" size="sm"
                                            className="p-2 h-[40px] w-[40px] text-gray-400 hover:text-white"
                                            onClick={() => setMessage("")}>
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