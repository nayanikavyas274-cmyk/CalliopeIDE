"use client"

import { motion } from "framer-motion"

export function HeroImage() {
    return (
        <div className="theme-panel relative rounded-lg overflow-hidden border shadow-2xl">
            <div className="theme-cta-overlay absolute inset-0"></div>

            <div className="theme-panel-strong border-b p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="size-3 rounded-full bg-red-500"></div>
                        <div className="size-3 rounded-full bg-yellow-500"></div>
                        <div className="size-3 rounded-full bg-[#9FEF00]"></div>
                    </div>
                    <div className="theme-muted-text text-xs ml-2">Calliope IDE - token_contract.rs</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-background/70 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="size-3 border-t border-foreground/70 rounded-full"
                        ></motion.div>
                    </div>
                    <div className="theme-muted-text text-xs">Connected to Testnet</div>
                </div>
            </div>

            <div className="flex h-[500px]">
                <div data-testid="sidebar-surface" className="theme-sidebar-surface w-48 border-r p-2 hidden md:block">
                    <div className="theme-muted-text text-xs font-medium mb-2 px-2">EXPLORER</div>
                    <div className="space-y-1">
                        {[
                            { name: "src", isFolder: true, isOpen: true },
                            { name: "token_contract.rs", isFolder: false, indent: 1 },
                            { name: "lib.rs", isFolder: false, indent: 1 },
                            { name: "tests", isFolder: true, isOpen: false },
                            { name: "target", isFolder: true, isOpen: false },
                            { name: "Cargo.toml", isFolder: false },
                            { name: "README.md", isFolder: false },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`flex items-center text-xs ${item.isFolder ? "text-foreground/80" : "theme-muted-text"
                                    } hover:bg-accent hover:text-accent-foreground rounded px-2 py-1 cursor-pointer transition-colors duration-200`}
                                style={{ paddingLeft: item.indent ? `${item.indent * 1.5}rem` : undefined }}
                            >
                                <div className="mr-2">{item.isFolder ? (item.isOpen ? "📂" : "📁") : "📄"}</div>
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div data-testid="editor-surface" className="theme-editor-surface flex-1 overflow-hidden">
                    <div className="flex h-full">
                        <div className="flex-1 p-4 font-mono text-sm overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                className="space-y-0.5"
                            >
                                {[
                                    { line: "pub struct TokenContract {", color: "theme-accent-text" },
                                    { line: "    admin: Address,", color: "text-foreground" },
                                    { line: "    total_supply: u128,", color: "text-foreground" },
                                    { line: "    balances: Map<Address, u128>,", color: "text-foreground" },
                                    { line: "}", color: "theme-accent-text" },
                                    { line: "", color: "text-foreground" },
                                    { line: "#[contractimpl]", color: "text-blue-400" },
                                    { line: "impl TokenContract {", color: "theme-accent-text" },
                                    {
                                        line: "    pub fn initialize(env: Env, admin: Address, total_supply: u128) -> Self {",
                                        color: "theme-accent-text",
                                    },
                                    { line: "        let mut balances = Map::new(&env);", color: "text-foreground" },
                                    { line: "        balances.set(admin.clone(), total_supply);", color: "text-foreground" },
                                    { line: "", color: "text-foreground" },
                                    { line: "        Self {", color: "text-foreground" },
                                    { line: "            admin,", color: "text-foreground" },
                                    { line: "            total_supply,", color: "text-foreground" },
                                    { line: "            balances,", color: "text-foreground" },
                                    { line: "        }", color: "text-foreground" },
                                    { line: "    }", color: "theme-accent-text" },
                                ].map((item, i) => (
                                    <div key={i} className={`${item.color}`}>
                                        <span className="theme-code-line-number mr-4 select-none">{i + 1}</span>
                                        {item.line}
                                    </div>
                                ))}

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                                    className="absolute h-5 w-2 bg-foreground mt-0.5 ml-[270px]"
                                ></motion.div>
                            </motion.div>
                        </div>

                        <div data-testid="chat-panel-surface" className="theme-chat-surface w-64 border-l p-3 hidden lg:block">
                            <div className="theme-muted-text text-xs font-medium mb-2">PROBLEMS</div>
                            <div className="text-xs text-emerald-600 dark:text-green-400">No problems detected</div>

                            <div className="theme-muted-text text-xs font-medium mt-4 mb-2">OUTLINE</div>
                            <div className="space-y-1 text-xs">
                                <div className="text-foreground">TokenContract</div>
                                <div className="theme-muted-text pl-3">admin: Address</div>
                                <div className="theme-muted-text pl-3">total_supply: u128</div>
                                <div className="theme-muted-text pl-3">balances: Map</div>
                                <div className="text-foreground/80">initialize()</div>
                                <div className="text-foreground/80">transfer()</div>
                                <div className="text-foreground/80">balance_of()</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="theme-chat-surface border-t p-3 h-12 flex items-center" data-testid="terminal-surface">
                <div className="flex items-center gap-3">
                    <div className="theme-muted-text text-xs">Terminal</div>
                    <div className="text-xs text-emerald-600 dark:text-green-400">✓ Build successful</div>
                    <div className="text-xs text-emerald-600 dark:text-green-400">✓ Tests passed</div>
                </div>
            </div>
        </div>
    )
}
