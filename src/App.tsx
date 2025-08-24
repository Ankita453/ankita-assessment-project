import type React from "react"
import { useState, useEffect, createContext, useContext, useRef } from "react"
import type { ReactNode, ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { Sun, Moon, CornerDownLeft, Loader, Server, MessageSquare, Copy, Check, Settings, Download } from "lucide-react"

interface Model {
  id: string
  name: string
  provider: string
}

interface ChatMessage {
  sender: "user" | "ai"
  content: string
  model?: string
  isError?: boolean
}

interface ThemeContextType {
  theme: "light" | "dark"
  toggleTheme: () => void
}

interface AppContextType {
  isLoading: boolean
  isResponding: boolean
  models: Model[]
  templates: string[]
  currentModel: string
  setCurrentModel: (modelId: string) => void
  temperature: number
  setTemperature: (temp: number) => void
  maxTokens: number
  setMaxTokens: (tokens: number) => void
  prompt: string
  setPrompt: (prompt: string) => void
  chatHistory: ChatMessage[]
  setChatHistory: (history: ChatMessage[]) => void
  handleSubmitPrompt: () => Promise<void>
}

const modelsData: Model[] = [
  { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash", provider: "Google (Simulated)" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic (Simulated)" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI (Simulated)" },
]

const templatesData: string[] = [
  "Explain the theory of relativity in simple terms.",
  "Write a short story about a robot who discovers music.",
  "Generate a Python script to organize files in a directory.",
  "What are the top 5 travel destinations for 2025?",
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark"
      if (savedTheme) {
        return savedTheme
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  })

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove("light", "dark")

    root.classList.add(theme)

    localStorage.setItem("theme", theme)

    document.body.style.backgroundColor = theme === "dark" ? "#111827" : "#f3f4f6"
    document.body.style.color = theme === "dark" ? "#f9fafb" : "#111827"
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isResponding, setIsResponding] = useState<boolean>(false)
  const [models, setModels] = useState<Model[]>([])
  const [templates, setTemplates] = useState<string[]>([])

  const [currentModel, setCurrentModel] = useState<string>(modelsData[0].id)
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(1024)
  const [prompt, setPrompt] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  useEffect(() => {
    setTimeout(() => {
      setModels(modelsData)
      setTemplates(templatesData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || isResponding) return

    const userMessage: ChatMessage = { sender: "user", content: prompt }
    const newChatHistory: ChatMessage[] = [...chatHistory, userMessage]
    setChatHistory(newChatHistory)
    setIsResponding(true)
    const currentPrompt = prompt
    setPrompt("")

    try {
      let aiTextResponse = ""
      const selectedModel = models.find((m) => m.id === currentModel)

      if (!selectedModel) {
        throw new Error("Selected model not found.")
      }

      if (currentModel === "gemini-2.5-flash-preview-05-20") {
        aiTextResponse = `This is a fast and concise simulated response from Gemini 2.5 Flash. You asked: "${currentPrompt}" It's designed for efficiency!`
      } else if (currentModel === "claude-3-opus") {
        aiTextResponse = `This is a highly articulate and insightful response from the simulated Claude 3 Opus. Your prompt was: "${currentPrompt}" Claude is designed for complex reasoning and nuanced understanding.`
      } else if (currentModel === "gpt-4-turbo") {
        aiTextResponse = `A comprehensive and powerful response from the simulated GPT-4 Turbo. You asked: "${currentPrompt}" GPT-4 Turbo excels at generating detailed and creative content.`
      } else {
        aiTextResponse = `This is a generic simulated response. The model "${selectedModel.name}" is not recognized for specific simulation. Your prompt was: "${currentPrompt}"`
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const aiResponse: ChatMessage = { sender: "ai", content: aiTextResponse, model: selectedModel.name }
      setChatHistory((prev) => [...prev, aiResponse])
    } catch (e: any) {
      console.error("Simulation failed:", e)
      const errorMessage: ChatMessage = {
        sender: "ai",
        content: `An error occurred during simulation: ${e.message}.`,
        model: "System",
        isError: true,
      }
      const simulatedFallback: ChatMessage = {
        sender: "ai",
        content: `This is a fallback simulated response. Your prompt was: "${currentPrompt}"`,
        model: "Simulator",
      }
      setChatHistory((prev) => [...prev, errorMessage, simulatedFallback])
    } finally {
      setIsResponding(false)
    }
  }

  const value: AppContextType = {
    isLoading,
    isResponding,
    models,
    templates,
    currentModel,
    setCurrentModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    prompt,
    setPrompt,
    chatHistory,
    setChatHistory,
    handleSubmitPrompt,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState<boolean>(false)
  const handleCopy = () => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand("copy")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
    document.body.removeChild(textArea)
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      aria-label="Copy text"
    >
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  )
}

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.sender === "user"
  const isError = message.isError
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 my-4 w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${isError ? "bg-red-500" : "bg-indigo-500"}`}
        >
          {isError ? "!" : "AI"}
        </div>
      )}
      <div
        className={`group relative max-w-full md:max-w-2xl p-4 rounded-2xl ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : isError
              ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-bl-none border border-red-300 dark:border-700"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && message.model && (
          <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">Responded using {message.model}</p>
        )}
        {!isUser && !isError && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          U
        </div>
      )}
    </motion.div>
  )
}

const SettingsPanel = () => {
  const {
    models,
    currentModel,
    setCurrentModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    templates,
    setPrompt,
  } = useAppContext()
  return (
    <div className="p-6 flex flex-col gap-6 bg-white dark:bg-gray-800 h-full">
      <div className="space-y-6">
        <Dropdown label="Model" value={currentModel} onChange={setCurrentModel} options={models} />
        <Slider label="Temperature" value={temperature} onChange={setTemperature} min={0} max={1} step={0.1} />
        <Slider label="Max Tokens" value={maxTokens} onChange={setMaxTokens} min={256} max={4096} step={64} />
      </div>
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare size={20} /> Prompt Templates
        </h2>
        <div className="space-y-2 max-h-58 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {templates.map((template, index) => (
            <motion.button
              key={index}
              onClick={() => setPrompt(template)}
              className="w-full text-left text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              whileHover={{ x: 5 }}
            >
              {template}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface DropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Model[]
}

const Dropdown = ({ label, value, onChange, options }: DropdownProps) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative">
      <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none`}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  </div>
)

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}

const Slider = ({ label, value, onChange, min, max, step }: SliderProps) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} ({value})
    </label>
    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number.parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  </div>
)

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Toggle theme"
      whileTap={{ scale: 0.9, rotate: 15 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
  onClick?: () => void
  className?: string
}

const Button = ({ children, onClick, className = "", ...props }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)

const LoadingSkeleton = () => (
  <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
    </div>
    <div className="flex-grow p-4 space-y-4">
      <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded w-3/4 ml-auto animate-pulse"></div>
      <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
    </div>
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
    </div>
  </div>
)

const AIPlayground = () => {
  const { isResponding, prompt, setPrompt, chatHistory, handleSubmitPrompt } = useAppContext()
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [chatHistory])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitPrompt()
    }
  }

  const handleDownloadChat = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(chatHistory, null, 2))}`
    const link = document.createElement("a")
    link.href = jsonString
    link.download = `chat-history-${new Date().toISOString()}.json`
    link.click()
  }

  return (
    <div
      className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans"
      style={{ overflow: "hidden" }}
    >
      <aside className="hidden lg:flex lg:flex-col w-full max-w-sm border-r border-gray-200 dark:border-gray-700">
        <SettingsPanel />
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">AI Playground</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadChat}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Download chat history"
              >
                <Download size={20} />
              </button>
              <ThemeToggle />
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Toggle settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="pt-4">
                  <SettingsPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <h2 className="text-2xl font-semibold">Start a conversation</h2>
              <p>Select a model and ask anything.</p>
            </div>
          ) : (
            <div>
              {chatHistory.map((msg, index) => (
                <ChatBubble key={index} message={msg} />
              ))}
              {isResponding && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 my-4 justify-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AI
                  </div>
                  <div className="max-w-xl p-4 rounded-2xl bg-white dark:bg-gray-700 rounded-bl-none flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </main>

        <footer className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500">
            <textarea
              value={prompt}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your prompt here..."
              disabled={isResponding}
              className="w-full h-full p-4 pr-20 text-base bg-transparent dark:text-gray-200 rounded-lg resize-none focus:outline-none placeholder-gray-400 dark:placeholder-500"
              rows={1}
            />
            <div className="absolute bottom-3 right-3">
              <Button onClick={handleSubmitPrompt} disabled={isResponding || !prompt.trim()}>
                {isResponding ? <Loader size={20} className="animate-spin" /> : <CornerDownLeft size={20} />}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  )
}

const AppContent = () => {
  const { isLoading } = useAppContext()
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="loader" exit={{ opacity: 0 }}>
          <LoadingSkeleton />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AIPlayground />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
