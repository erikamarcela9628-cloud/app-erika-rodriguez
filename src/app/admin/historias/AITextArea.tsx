'use client'

import { useState } from 'react'
import { generateTextAction } from './ai-actions'

interface AITextAreaProps {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  rows?: number
  seccion: string
}

export default function AITextArea({ name, label, defaultValue = '', placeholder, rows = 3, seccion }: AITextAreaProps) {
  const [value, setValue] = useState(defaultValue)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState('')

  const handleAI = async () => {
    if (!value.trim()) return

    setIsOptimizing(true)
    setError('')
    try {
      const result = await generateTextAction(value)
      setValue(result)
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-slate-800">{label}</label>
        <button
          type="button"
          onClick={handleAI}
          disabled={isOptimizing || !value.trim()}
          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          {isOptimizing ? 'Optimizando texto...' : '✨ Redactar Clínico con IA'}
        </button>
      </div>
      {error && <div className="text-xs text-red-600 mb-1">{error}</div>}
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
        placeholder={placeholder}
      ></textarea>
    </div>
  )
}
