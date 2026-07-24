'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import WhatsAppReminderButton from './WhatsAppReminderButton'
import { actualizarEstadoCita } from './actions'

interface CitasClientProps {
  citas: any[]
  pacientesConHistoria: Record<string, string> // paciente_id -> historia_id
}

export default function CitasClient({ citas, pacientesConHistoria }: CitasClientProps) {
  const [view, setView] = useState<'lista' | 'calendario'>('lista')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Filtrado general
  const filteredCitas = citas.filter(cita => {
    const term = searchTerm.toLowerCase()
    const pName = cita.pacientes?.nombre_completo?.toLowerCase() || ''
    // Buscar también por fecha formateada (ej. 15/05/2026)
    const dStr = new Date(cita.fecha_hora).toLocaleDateString()
    return pName.includes(term) || dStr.includes(term)
  })

  // ---- HELPER PARA CALENDARIO ----
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  
  const getDaysInMonth = () => {
    const days = []
    // Padding para los días de la semana anterior
    const startDay = startOfMonth.getDay() // 0 = Domingo
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    // Días del mes actual
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
    }
    return days
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  // Función para obtener color según estado
  const getColorClasses = (estado: string) => {
    switch(estado) {
      case 'Programada': return 'bg-[#0e787a] text-white border-[#0e787a]'
      case 'Completada': return 'bg-gray-500 text-white border-gray-500'
      case 'Cancelada': 
      case 'No Asistió': return 'bg-red-500 text-white border-red-500'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadge = (estado: string) => {
    switch(estado) {
      case 'Programada': return 'bg-teal-100 text-[#0e787a]'
      case 'Completada': return 'bg-gray-100 text-gray-600'
      case 'Cancelada': 
      case 'No Asistió': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Componente de Tarjeta de Cita (Lista)
  const CitaCard = ({ cita }: { cita: any }) => {
    const isProgramada = cita.estado === 'Programada'
    const dateObj = new Date(cita.fecha_hora)
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">{cita.pacientes?.nombre_completo || 'Desconocido'}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(cita.estado)}`}>
              {cita.estado}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><strong>Fecha:</strong> {dateObj.toLocaleDateString('es-CO')} a las {dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Duración:</strong> {cita.duracion_minutos} min</div>
            <div><strong>Modalidad:</strong> {cita.modalidad}</div>
            {cita.observaciones && <div className="col-span-full"><strong>Notas:</strong> {cita.observaciones}</div>}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          {isProgramada && (
            <WhatsAppReminderButton cita={cita} />
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={() => actualizarEstadoCita(cita.id, 'Completada')}
              disabled={!isProgramada}
              className="flex-1 py-1 px-2 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Completar
            </button>
            <button 
              onClick={() => actualizarEstadoCita(cita.id, 'Cancelada')}
              disabled={!isProgramada}
              className="flex-1 py-1 px-2 border border-red-300 rounded text-xs font-medium text-red-600 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          {pacientesConHistoria[cita.paciente_id] && (
            <Link 
              href={`/admin/historias/${pacientesConHistoria[cita.paciente_id]}`}
              className="text-center text-xs font-medium text-[#0e787a] hover:underline"
            >
              Ver Historia Clínica
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Barra de Controles */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por paciente o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]"
        />
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('lista')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'lista' ? 'bg-white shadow text-[#0e787a]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Vista Lista
          </button>
          <button
            onClick={() => setView('calendario')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendario' ? 'bg-white shadow text-[#0e787a]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Vista Calendario
          </button>
        </div>
      </div>

      {/* Renderizado Condicional de Vistas */}
      {view === 'lista' ? (
        <div className="space-y-2">
          {filteredCitas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
              No se encontraron citas.
            </div>
          ) : (
            filteredCitas.map(cita => (
              <CitaCard key={cita.id} cita={cita} />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Calendario */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-200 text-gray-600 font-bold">&larr;</button>
            <h2 className="text-lg font-bold text-gray-800 capitalize">
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 text-gray-600 font-bold">&rarr;</button>
          </div>
          
          {/* Grid Calendario */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
            {getDaysInMonth().map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="bg-gray-50 min-h-[120px]" />
              
              // Filtrar citas para este día
              const dayCitas = filteredCitas.filter(c => {
                const cDate = new Date(c.fecha_hora)
                return cDate.getDate() === date.getDate() && 
                       cDate.getMonth() === date.getMonth() && 
                       cDate.getFullYear() === date.getFullYear()
              })

              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div key={date.toISOString()} className={`bg-white min-h-[120px] p-2 ${isToday ? 'bg-teal-50/30' : ''}`}>
                  <div className={`text-right text-sm mb-1 ${isToday ? 'font-bold text-[#0e787a]' : 'text-gray-500'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayCitas.map(cita => (
                      <div 
                        key={cita.id} 
                        title={`${cita.pacientes?.nombre_completo} - ${cita.estado}`}
                        className={`text-xs p-1 rounded border truncate cursor-pointer ${getColorClasses(cita.estado)}`}
                      >
                        {new Date(cita.fecha_hora).toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})} {cita.pacientes?.nombre_completo?.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
