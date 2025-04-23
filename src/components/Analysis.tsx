import { Dispatch, SetStateAction } from 'react'
import { Radar } from 'react-chartjs-2'
import { AnalysisData, AnalysisPoint } from '../types'

interface AnalysisProps {
  analysisData: AnalysisData
  setAnalysisData: Dispatch<SetStateAction<AnalysisData>>
  showResults: boolean
  setShowResults: Dispatch<SetStateAction<boolean>>
  analysisResults: any
  generateAnalysis: () => void
  updatePeerHash: (index: number, value: string) => void
  addPeerField: () => void
  removePeerField: (index: number) => void
  onBack: () => void
}

export function Analysis({
  analysisData,
  setAnalysisData,
  showResults,
  setShowResults,
  analysisResults,
  generateAnalysis,
  updatePeerHash,
  addPeerField,
  removePeerField,
  onBack
}: AnalysisProps) {
  if (showResults && analysisResults) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Análise Comparativa
            </h1>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Comparativo Geral
              </h2>
              <div className="w-full h-[600px]">
                <Radar
                  data={analysisResults.chartData}
                  options={{
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const
                      }
                    },
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Pontos Fortes
                </h2>
                <div className="space-y-2">
                  {analysisResults.pontosFortesEMelhorias.slice(0, 3).map((ponto: AnalysisPoint) => (
                    <div
                      key={ponto.categoria}
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <p className="font-medium text-green-800">{ponto.categoria}</p>
                      <p className="text-sm text-green-600">Média: {ponto.media.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Pontos de Melhoria
                </h2>
                <div className="space-y-2">
                  {analysisResults.pontosFortesEMelhorias.slice(-3).reverse().map((ponto: AnalysisPoint) => (
                    <div
                      key={ponto.categoria}
                      className="p-4 bg-red-50 rounded-lg border border-red-200"
                    >
                      <p className="font-medium text-red-800">{ponto.categoria}</p>
                      <p className="text-sm text-red-600">Média: {ponto.media.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowResults(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Análise Comparativa
            </h1>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              Voltar
            </button>
          </div>

          {!showResults ? (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-avaliação
                </label>
                <input
                  type="text"
                  value={analysisData.autoAvaliacao}
                  onChange={(e) =>
                    setAnalysisData(prev => ({
                      ...prev,
                      autoAvaliacao: e.target.value
                    }))
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Cole o código da auto-avaliação"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Avaliação dos Pares
                  </label>
                  <button
                    onClick={addPeerField}
                    className="text-cyan-600 hover:text-cyan-700 text-sm"
                  >
                    + Adicionar Par
                  </button>
                </div>
                {analysisData.avaliacaoPares.map((hash, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hash}
                      onChange={(e) => updatePeerHash(index, e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Cole o código da avaliação do par"
                    />
                    <button
                      onClick={() => removePeerField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação do Líder
                </label>
                <input
                  type="text"
                  value={analysisData.avaliacaoLider}
                  onChange={(e) =>
                    setAnalysisData(prev => ({
                      ...prev,
                      avaliacaoLider: e.target.value
                    }))
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Cole o código da avaliação do líder"
                />
              </div>

              <button
                onClick={generateAnalysis}
                className="w-full bg-cyan-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                Gerar Análise
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Gráfico Comparativo
                </h2>
                <div className="aspect-square">
                  <Radar
                    data={analysisResults.chartData}
                    options={{
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 5,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Pontos Fortes e Oportunidades de Melhoria
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Pontos Fortes
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResults.pontosFortesEMelhorias
                        .slice(0, 3)
                        .map((item: any) => (
                          <li key={item.categoria} className="text-gray-600">
                            {item.categoria} (Média: {item.media.toFixed(1)})
                            {Math.abs(item.gap) > 0.5 && (
                              <span className="text-gray-500 text-sm">
                                {item.gap > 0
                                  ? ' - Você se avalia acima da média'
                                  : ' - Você se avalia abaixo da média'}
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Oportunidades de Melhoria
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResults.pontosFortesEMelhorias
                        .slice(-3)
                        .reverse()
                        .map((item: any) => (
                          <li key={item.categoria} className="text-gray-600">
                            {item.categoria} (Média: {item.media.toFixed(1)})
                            {Math.abs(item.gap) > 0.5 && (
                              <span className="text-gray-500 text-sm">
                                {item.gap > 0
                                  ? ' - Você se avalia acima da média'
                                  : ' - Você se avalia abaixo da média'}
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowResults(false)}
                className="mt-8 w-full bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Voltar para Entrada de Dados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 