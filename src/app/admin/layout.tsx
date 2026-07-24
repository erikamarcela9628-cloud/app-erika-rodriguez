import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin">
                  <img
                    className="h-10 w-auto"
                    src="https://erikarodriguezpsicologa.com/wp-content/uploads/2026/07/logo-erika-.png"
                    alt="Logo Dra. Erika Rodríguez"
                  />
                </Link>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className="border-transparent text-gray-600 hover:border-[#0e787a] hover:text-[#0e787a] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/nuevo-contrato"
                  className="border-transparent text-gray-600 hover:border-[#0e787a] hover:text-[#0e787a] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Nuevo Contrato
                </Link>
                <Link
                  href="/admin/pagos"
                  className="border-transparent text-gray-600 hover:border-[#0e787a] hover:text-[#0e787a] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Pagos y Recibos
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                href="/admin/nuevo-contrato"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0e787a] hover:bg-[#224252] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e787a] transition-colors"
              >
                + Crear Contrato
              </Link>
            </div>
            
            {/* Mobile Menu Button (Opcional) */}
            <div className="-mr-2 flex items-center sm:hidden">
               {/* Simplemente mostrar el enlace de nuevo contrato en móvil también para facilidad */}
               <Link
                href="/admin/nuevo-contrato"
                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#0e787a] hover:bg-[#224252]"
              >
                + Crear
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
