'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cambiarPassword } from '@/app/recuperar-password/actions'

export default function CambiarPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await cambiarPassword(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } else {
      setError(result.error || 'Ocurrió un error al actualizar la contraseña.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 font-sans">
      <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-50 text-[#0e787a] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Establecer Nueva Contraseña
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa tu nueva clave de acceso seguro
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center space-y-2">
            <p className="font-semibold text-green-900">¡Contraseña actualizada con éxito!</p>
            <p className="text-sm">Redirigiendo al panel administrativo...</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nueva Contraseña
              </label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0e787a] focus:border-[#0e787a] sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Confirmar Nueva Contraseña
              </label>
              <div className="mt-1">
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Repite la contraseña"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0e787a] focus:border-[#0e787a] sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0e787a] hover:bg-[#224252] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e787a] transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Guardando contraseña...' : 'Actualizar y Entrar'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/admin"
                className="text-xs font-medium text-gray-500 hover:text-slate-800"
              >
                Cancelar y volver al Dashboard
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
