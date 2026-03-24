'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserTier } from '@/types/index'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string
}

export default function AIChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string>()
  const [remainingQueries, setRemainingQueries] = useState(5)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const queryLimit = user?.tier === UserTier.GUARDIAN ? 5 : user?.tier === UserTier.SENTINEL ? 25 : 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = [
    { label: "What's my risk?", prompt: "What is my current risk exposure based on my open positions?" },
    { label: 'Should I trade?', prompt: 'Based on my trading pattern today, should I open new positions?' },
    { label: 'Am I overexposed?', prompt: 'Analyze my portfolio: am I taking too much risk right now?' },
    {
      label: 'Review my day',
      prompt:
        'Give me a summary of my trading behavior today - what went well and what could improve?',
    },
  ]

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    // Check if user is free tier
    if (user?.tier === UserTier.FREE) {
      setError('This feature requires an upgrade. Choose Guardian or Sentinel plan.')
      return
    }

    // Check query limit
    if (remainingQueries <= 0) {
      setError(`Daily limit reached (${queryLimit} queries). Return tomorrow or upgrade.`)
      return
    }

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Add user message to UI immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      id: `user_${Date.now()}`,
    }
    setMessages((prev) => [...prev, newUserMessage])

    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          setError(errorData.message || 'Query limit reached')
        } else {
          setError(errorData.error || 'Failed to send message')
        }
        setMessages((prev) => prev.slice(0, -1)) // Remove user message on error
        setLoading(false)
        return
      }

      // Get remaining queries from header
      const remaining = response.headers.get('X-Remaining-Queries')
      if (remaining !== null) {
        setRemainingQueries(parseInt(remaining))
      }

      // Read streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        id: `assistant_${Date.now()}`,
      }

      setMessages((prev) => [...prev, assistantMessage])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk

        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...assistantMessage, content: fullResponse },
        ])
      }

      // Generate conversation ID if not set
      if (!conversationId) {
        setConversationId(`conv_${Date.now()}`)
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">VenusAI Risk Coach</h1>
            <p className="text-sm text-slate-600 mt-1">Get personalized guidance on risk management and emotional discipline</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {remainingQueries}/{queryLimit} queries today
            </p>
            <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  remainingQueries > queryLimit * 0.5
                    ? 'bg-emerald-500'
                    : remainingQueries > queryLimit * 0.25
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${(remainingQueries / queryLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🧠</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Ask VenusAI about your trading</h2>
              <p className="text-slate-600">Get risk analysis, emotional pattern insights, and trading discipline coaching</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-8">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-sm font-medium text-slate-900 text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Pro Feature Notice */}
            {user?.tier === UserTier.FREE && (
              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md">
                <p className="text-sm text-amber-900 font-medium mb-2">💎 Pro Feature</p>
                <p className="text-sm text-amber-800 mb-3">Upgrade to Guardian or Sentinel to unlock VenusAI</p>
                <a
                  href="/dashboard/settings"
                  className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  View Plans
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-md lg:max-w-lg px-4 py-3 rounded-lg',
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 border border-slate-200 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 px-6 py-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        {!messages.length && user?.tier !== UserTier.FREE ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={loading || remainingQueries === 0}
                className="p-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={
              user?.tier === UserTier.FREE
                ? 'Upgrade to use VenusAI...'
                : remainingQueries === 0
                  ? 'Daily limit reached. Return tomorrow...'
                  : 'Ask about your risk, emotions, or trading patterns...'
            }
            disabled={loading || user?.tier === UserTier.FREE || remainingQueries === 0}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || user?.tier === UserTier.FREE || remainingQueries === 0}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          💡 Tip: Ask about specific trades, your emotional state, or risk management challenges. VenusAI never recommends trades.
        </p>
      </div>
    </div>
  )
}
