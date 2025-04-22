interface RoleSelectionProps {
  nome: string
  tipoAvaliador: string
  setTipoAvaliador: (tipo: string) => void
  setShowQuestions: (show: boolean) => void
}

export function RoleSelection({
  nome,
  tipoAvaliador,
  setTipoAvaliador,
  setShowQuestions
}: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Avaliação de Habilidades: {nome}
          </h1>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Como você está participando desta avaliação?
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setTipoAvaliador('avaliado')}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${tipoAvaliador === 'avaliado'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-cyan-300'
                  }`}
              >
                <p className="font-medium text-lg">Sou o(a) {nome}</p>
              </button>

              <button
                onClick={() => setTipoAvaliador('par')}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${tipoAvaliador === 'par'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-cyan-300'
                  }`}
              >
                <p className="font-medium text-lg">Sou um(a) dos pares da {nome}</p>
              </button>

              <button
                onClick={() => setTipoAvaliador('lider')}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${tipoAvaliador === 'lider'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-cyan-300'
                  }`}
              >
                <p className="font-medium text-lg">Sou o(a) líder da {nome}</p>
              </button>
            </div>

            {tipoAvaliador && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowQuestions(true)}
                  className="bg-cyan-600 w-full cursor-pointer text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 