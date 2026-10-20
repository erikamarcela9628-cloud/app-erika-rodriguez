'use client'

import React from 'react'

interface DraftAutoSaveBannerProps {
  hasDraft: boolean
  draftTimestamp: string | null
  onRestore: () => void
  onDiscard: () => void
  isOnline: boolean
  isSavedLocally?: boolean
  lastSavedTime?: string | null
}

export default function DraftAutoSaveBanner({
  hasDraft,
  draftTimestamp,
  onRestore,
  onDiscard,
  isOnline,
  isSavedLocally,
  lastSavedTime,
}: DraftAutoSaveBannerProps) {
  return (
    <div className="space-y-3 mb-6">
      {/* Banner de Estado Offline */}
      {!isOnline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3 animate-pulse">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728 0m0 0l2.829-2.829m-2.829 2.829L3 21m2.828-12.536a5 5 0 017.072 0m0 0l-2.828 2.828" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">Estás trabajando sin conexión</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              No te preocupes: todo lo que escribas se está guardando automáticamente en este dispositivo. Cuando regrese el internet podrás guardar en el servidor sin perder una sola palabra.
            </p>
          </div>
        </div>
      )}

      {/* Banner de Borrador Encontrado */}
      {hasDraft && (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-100 text-[#0e787a] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-teal-900">
                Se encontró un borrador previo no guardado
              </h4>
              <p className="text-xs text-teal-700">
                Guardado automáticamente el: <span className="font-medium">{draftTimestamp || 'recientemente'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onDiscard}
              className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={onRestore}
              className="text-xs font-semibold px-3.5 py-1.5 bg-[#0e787a] text-white hover:bg-[#224252] rounded-lg shadow-sm transition-colors"
            >
              Restaurar borrador
            </button>
          </div>
        </div>
      )}

      {/* Indicador sutil de Autoguardado local */}
      {isSavedLocally && !hasDraft && (
        <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Copia local segura actualizada {lastSavedTime ? `a las ${lastSavedTime}` : ''}</span>
        </div>
      )}
    </div>
  )
}
