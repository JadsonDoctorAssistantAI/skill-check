import { useState, useEffect } from 'react'
import hardQuestions from './questions/hard.json'
import softQuestions from './questions/soft.json'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

type QuestionType = {
  id: string
  label: string
}

type EvaluationResult = {
  avaliado: string
  tipoAvaliador: string
  respostas: Record<string, number>
  timestamp: number
}

type AnalysisData = {
  autoAvaliacao: string
  avaliacaoPares: string[]
  avaliacaoLider: string
}

type AnalysisPoint = {
  categoria: string
  media: number
  gap: number
}

function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}

function Toast({ message, isVisible, onClose }: { message: string, isVisible: boolean, onClose: () => void }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up z-50">
      <svg className="w-5 h-5 text-green-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M5 13l4 4L19 7"></path>
      </svg>
      {message}
    </div>
  )
}

function App() {
  const [nome, setNome] = useState<string>('')
  const [tipoAvaliador, setTipoAvaliador] = useState<string>('')
  const [showQuestions, setShowQuestions] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentStage, setCurrentStage] = useState(0)
  const [resultHash, setResultHash] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [isAnalysisMode, setIsAnalysisMode] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    autoAvaliacao: '',
    avaliacaoPares: [''],
    avaliacaoLider: ''
  })
  const [showResults, setShowResults] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [hashInput, setHashInput] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [showUrlCopy, setShowUrlCopy] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nomeParam = params.get('nome')
    if (nomeParam) {
      setNome(nomeParam)
      setTipoAvaliador('')
      setShowQuestions(false)
    }
  }, [])

  const handleStartNewEvaluation = () => {
    if (novoNome.trim()) {
      const url = new URL(window.location.href)
      url.searchParams.set('nome', novoNome.trim())
      const fullUrl = `${window.location.origin}${window.location.pathname}?nome=${encodeURIComponent(novoNome.trim())}`

      navigator.clipboard.writeText(fullUrl)
        .then(() => {
          setShowToast(true)
          // setNome(novoNome.trim())
          // setTipoAvaliador('')
          // setShowQuestions(false)
          setShowUrlCopy(true)
        })
        .catch(err => {
          console.error('Erro ao copiar para a área de transferência:', err)
          alert('Não foi possível copiar o link automaticamente. Por favor, copie manualmente.')
        })
    }
  }

  const goToAnalysis = () => {
    setIsAnalysisMode(true)
    setShowQuestions(false)
    setTipoAvaliador('')
    setNome('')
  }

  if (!nome && !isAnalysisMode) {
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
                            value={`${window.location.origin}${window.location.pathname}?nome=${encodeURIComponent(novoNome.trim())}`}
                            className="flex-1 p-2 text-sm bg-gray-50 border rounded"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?nome=${encodeURIComponent(novoNome.trim())}`)
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

  const generateEvaluationHash = () => {
    const result: EvaluationResult = {
      avaliado: nome,
      tipoAvaliador,
      respostas: answers,
      timestamp: Date.now()
    }

    const jsonString = JSON.stringify(result)
    const hash = btoa(jsonString)
    setResultHash(hash)
    return hash
  }

  const decodeEvaluationHash = (hash: string): EvaluationResult => {
    const jsonString = atob(hash)
    return JSON.parse(jsonString)
  }

  const handleFinishEvaluation = () => {
    generateEvaluationHash()
    setShowModal(true)
  }

  const getQuestionsForRole = () => {
    const role = tipoAvaliador === 'avaliado' ? 'self' : tipoAvaliador === 'par' ? 'peers' : 'leadership'
    const questions: { category: string, label: string, questions: QuestionType[] }[] = []

    // Adicionar questões técnicas
    Object.entries(hardQuestions).forEach(([key, value]) => {
      questions.push({
        category: key,
        label: value.label,
        questions: value[role].questions
      })
    })

    // Adicionar questões soft
    Object.entries(softQuestions).forEach(([key, value]) => {
      questions.push({
        category: key,
        label: value.label,
        questions: value[role].questions
      })
    })

    return questions
  }

  const handleRatingChange = (questionId: string, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: rating
    }))
  }

  const renderRatingButtons = (questionId: string) => {
    return (
      <div className="flex gap-4 justify-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingChange(questionId, rating)}
            className={`w-10 h-10 cursor-pointer rounded-full ${answers[questionId] === rating
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
              } flex items-center justify-center font-medium transition-colors`}
          >
            {rating}
          </button>
        ))}
      </div>
    )
  }

  const isCurrentCategoryComplete = () => {
    const currentCategory = getQuestionsForRole()[currentStage]
    if (!currentCategory) return false

    return currentCategory.questions.every(
      question => answers[question.id] !== undefined
    )
  }

  const areAllQuestionsAnswered = () => {
    const allQuestions = getQuestionsForRole().flatMap(
      category => category.questions
    )
    return allQuestions.every(question => answers[question.id] !== undefined)
  }

  const handleNext = () => {
    if (isCurrentCategoryComplete()) {
      setCurrentStage(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => Math.max(0, prev - 1))
      window.scrollTo(0, 0)
    }

    else if (currentStage === 0) {
      setShowQuestions(false)
    }
  }

  const addPeerField = () => {
    setAnalysisData(prev => ({
      ...prev,
      avaliacaoPares: [...prev.avaliacaoPares, '']
    }))
  }

  const updatePeerHash = (index: number, value: string) => {
    setAnalysisData(prev => ({
      ...prev,
      avaliacaoPares: prev.avaliacaoPares.map((hash, i) =>
        i === index ? value : hash
      )
    }))
  }

  const removePeerField = (index: number) => {
    setAnalysisData(prev => ({
      ...prev,
      avaliacaoPares: prev.avaliacaoPares.filter((_, i) => i !== index)
    }))
  }

  const calculateCategoryAverage = (respostas: Record<string, number>, categoria: string) => {
    const questoesDaCategoria = Object.entries(respostas)
      .filter(([key]) => key.startsWith(categoria))

    if (questoesDaCategoria.length === 0) return 0

    return questoesDaCategoria.reduce((acc, [_, value]) => acc + value, 0) / questoesDaCategoria.length
  }

  const generateAnalysis = () => {
    try {
      const autoAvaliacao = analysisData.autoAvaliacao ?
        decodeEvaluationHash(analysisData.autoAvaliacao) : null

      const avaliacoesPares = analysisData.avaliacaoPares
        .filter(hash => hash)
        .map(hash => decodeEvaluationHash(hash))

      const avaliacaoLider = analysisData.avaliacaoLider ?
        decodeEvaluationHash(analysisData.avaliacaoLider) : null

      const categorias = [
        'technical', 'code', 'delivery', 'problem', 'system',
        'communication', 'collaboration', 'adaptability', 'initiative', 'empathy'
      ]

      const mediaPares = categorias.reduce((acc, categoria) => {
        const mediaCategoria = avaliacoesPares.length > 0 ?
          avaliacoesPares.reduce((sum, aval) =>
            sum + calculateCategoryAverage(aval.respostas, categoria), 0
          ) / avaliacoesPares.length : 0

        return { ...acc, [categoria]: mediaCategoria }
      }, {} as Record<string, number>)

      const results = {
        labels: [
          'Conhecimento Técnico',
          'Qualidade de Código',
          'Entrega',
          'Resolução de Problemas',
          'Visão Sistêmica',
          'Comunicação',
          'Colaboração',
          'Adaptabilidade',
          'Iniciativa',
          'Empatia'
        ],
        datasets: [
          {
            label: 'Auto-avaliação',
            data: categorias.map(cat =>
              autoAvaliacao ? calculateCategoryAverage(autoAvaliacao.respostas, cat) : 0
            ),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          },
          {
            label: 'Média dos Pares',
            data: categorias.map(cat => mediaPares[cat]),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          },
          {
            label: 'Avaliação do Líder',
            data: categorias.map(cat =>
              avaliacaoLider ? calculateCategoryAverage(avaliacaoLider.respostas, cat) : 0
            ),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }
        ]
      }

      const pontosFortesEMelhorias = categorias.map((categoria, index) => {
        const mediaGeral = (
          (autoAvaliacao ? calculateCategoryAverage(autoAvaliacao.respostas, categoria) : 0) +
          mediaPares[categoria] +
          (avaliacaoLider ? calculateCategoryAverage(avaliacaoLider.respostas, categoria) : 0)
        ) / (
            (autoAvaliacao ? 1 : 0) +
            (avaliacoesPares.length > 0 ? 1 : 0) +
            (avaliacaoLider ? 1 : 0)
          )

        return {
          categoria: results.labels[index],
          media: mediaGeral,
          gap: autoAvaliacao ?
            calculateCategoryAverage(autoAvaliacao.respostas, categoria) - mediaGeral : 0
        }
      }).sort((a, b) => b.media - a.media)

      setAnalysisResults({
        chartData: results,
        pontosFortesEMelhorias
      })
      setShowResults(true)

    } catch (error) {
      alert('Erro ao processar os dados. Verifique se os códigos estão corretos.')
      console.error(error)
    }
  }

  if (isAnalysisMode) {
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
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Análise Comparativa de Avaliações
            </h1>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Adicione os códigos das avaliações
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-avaliação
                    </label>
                    <input
                      type="text"
                      placeholder="Cole o código da auto-avaliação"
                      className="w-full p-2 border rounded"
                      value={analysisData.autoAvaliacao}
                      onChange={(e) => setAnalysisData(prev => ({
                        ...prev,
                        autoAvaliacao: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação dos Pares
                    </label>
                    <div className="space-y-2">
                      {analysisData.avaliacaoPares.map((hash, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Cole o código da avaliação do par ${index + 1}`}
                            className="flex-1 p-2 border rounded"
                            value={hash}
                            onChange={(e) => updatePeerHash(index, e.target.value)}
                          />
                          {index > 0 && (
                            <button
                              onClick={() => removePeerField(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addPeerField}
                        className="text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        + Adicionar outro par
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação do Líder
                    </label>
                    <input
                      type="text"
                      placeholder="Cole o código da avaliação do líder"
                      className="w-full p-2 border rounded"
                      value={analysisData.avaliacaoLider}
                      onChange={(e) => setAnalysisData(prev => ({
                        ...prev,
                        avaliacaoLider: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setIsAnalysisMode(false)
                    setShowQuestions(false)
                    setTipoAvaliador('')
                    setNome('')
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  onClick={generateAnalysis}
                  className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                >
                  Gerar Análise
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!showQuestions || !tipoAvaliador) {
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

  const allCategories = getQuestionsForRole()
  const currentCategory = allCategories[currentStage]

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Revisão Final
            </h1>
            <div className="space-y-8">
              {allCategories.map((category, index) => (
                <div key={category.category} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {category.label}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 pl-4">
                    {category.questions.map(question => (
                      <div key={question.id} className="flex items-center justify-between">
                        <p className="text-gray-700">{question.label}</p>
                        <span className="font-bold text-cyan-600">
                          Nota: {answers[question.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex gap-4">
              <button
                onClick={handlePrevious}
                className="bg-gray-200 cursor-pointer w-1/2 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Voltar
              </button>
              <button
                className="bg-cyan-600 cursor-pointer w-1/2 text-white px-8 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                onClick={handleFinishEvaluation}
              >
                Finalizar Avaliação
              </button>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Avaliação Finalizada
              </h2>
              <p className="text-gray-600 mb-4">
                Copie o código abaixo para usar na análise comparativa:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={resultHash}
                  className="flex-1 p-2 text-sm bg-gray-50 border rounded"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resultHash)
                    setShowToast(true)
                  }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                >
                  Copiar
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setIsAnalysisMode(true)
                    setShowQuestions(false)
                    setCurrentStage(0)
                    setAnswers({})
                  }}
                  className="px-4 py-2 text-cyan-600 hover:text-cyan-700"
                >
                  Ir para Análise Comparativa
                </button>
              </div>
            </Modal>

            <Toast
              message="Código copiado com sucesso!"
              isVisible={showToast}
              onClose={() => setShowToast(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentCategory.label}
              </h1>
              <span className="text-gray-500">
                Categoria {currentStage + 1} de {allCategories.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-cyan-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentStage + 1) / allCategories.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-8">
            {currentCategory.questions.map((question) => (
              <div key={question.id} className="space-y-4">
                <p className="text-lg text-gray-700">{question.label}</p>
                {renderRatingButtons(question.id)}
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
            <button
              onClick={handlePrevious}
              className="bg-gray-200 cursor-pointer w-1/2 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            // disabled={currentStage === 0}
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={!isCurrentCategoryComplete()}
              className={`w-1/2 cursor-pointer px-8 py-3 rounded-lg font-medium transition-colors ${isCurrentCategoryComplete()
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Próxima Categoria
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
