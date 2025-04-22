import { Toast } from './Toast'

interface StartEvaluationProps {
  novoNome: string
  setNovoNome: (nome: string) => void
  handleStartNewEvaluation: () => void
  showUrlCopy: boolean
  showToast: boolean
  setShowToast: (show: boolean) => void
  goToAnalysis: () => void
}

export function StartEvaluation({
  novoNome,
  setNovoNome,
  handleStartNewEvaluation,
  showUrlCopy,
  showToast,
  setShowToast,
  goToAnalysis
}: StartEvaluationProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Avaliação de Habilidades
          </h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                O que você deseja fazer?
              </h2>

              <div className="space-y-6 mt-8">
                <div className="p-6 bg-cyan-50 rounded-lg border border-cyan-100">
                  <h3 className="text-lg font-medium text-cyan-900 mb-4">
                    Iniciar Nova Avaliação
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Digite o nome do avaliado"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={handleStartNewEvaluation}
                      disabled={!novoNome.trim()}
                      className={`w-full py-2 px-4 rounded-md font-medium ${novoNome.trim()
                        ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      Gerar Link de Avaliação
                    </button>
                  </div>

                  {showUrlCopy && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <p className="text-sm text-gray-600 mb-2">
                        Compartilhe este link para coletar as avaliações:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}${window.location.pathname}?nome=${encodeURIComponent(
                            novoNome.trim()
                          )}`}
                          className="flex-1 p-2 text-sm bg-gray-50 border rounded"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}${window.location.pathname
                              }?nome=${encodeURIComponent(novoNome.trim())}`
                            )
                            setShowToast(true)
                          }}
                          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Analisar Avaliações
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Compare diferentes avaliações e veja análises detalhadas.
                  </p>
                  <button
                    onClick={goToAnalysis}
                    className="w-full py-2 px-4 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900"
                  >
                    Ir para Análise
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message="Link copiado com sucesso!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
} 