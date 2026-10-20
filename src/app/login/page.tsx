'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from './actions'

function LoginForm() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'unauthorized') {
      setError('No tienes permisos de administrador con esta cuenta.')
    } else if (err === 'enlace_invalido_o_expirado') {
      setError('El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
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
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0e787a] focus:border-[#0e787a] sm:text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <Link
              href="/recuperar-password"
              className="text-xs font-medium text-[#0e787a] hover:text-[#224252] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="mt-1">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
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
            {isLoading ? 'Iniciando sesión...' : 'Entrar al Panel'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img
            className="h-16 w-auto"
            src="/logo-erika.png"
            alt="Logo Psicóloga Erika Rodríguez"
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acceso exclusivo para Administración
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
