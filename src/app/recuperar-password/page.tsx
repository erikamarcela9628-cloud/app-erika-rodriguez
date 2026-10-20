'use client'

import { useState } from 'react'
import Link from 'next/link'
import { solicitarRecuperacion } from './actions'

export default function RecuperarPasswordPage() {
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMsg('')

    const formData = new FormData(e.currentTarget)
    const result = await solicitarRecuperacion(formData)

    if (result.success) {
      setSuccessMsg(result.message || 'Correo de recuperación enviado con éxito.')
    } else {
      setError(result.error || 'Ocurrió un error inesperado.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img
            className="h-16 w-auto"
            src="/logo-erika.png"
            alt="Logo Psicóloga Erika Rodríguez"
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu correo institucional para enviarte un enlace de acceso
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {successMsg ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl text-sm leading-relaxed text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900 mb-1">¡Revisa tu correo!</h3>
                <p>{successMsg}</p>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="font-medium text-sm text-[#0e787a] hover:text-[#224252] transition-colors"
                >
                  &larr; Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Correo Electrónico
                </label>
                <div className="mt-1">
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ejemplo@correo.com"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0e787a] focus:border-[#0e787a] sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0e787a] hover:bg-[#224252] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e787a] transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="font-medium text-sm text-gray-500 hover:text-slate-800 transition-colors"
                >
                  &larr; Volver a Iniciar Sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
