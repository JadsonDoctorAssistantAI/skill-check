import { useState, useEffect } from 'react'
import hardQuestions from './questions/hard.json'
import softQuestions from './questions/soft.json'

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

function App() {
  const [nome, setNome] = useState<string>('')
  const [tipoAvaliador, setTipoAvaliador] = useState<string>('')
  const [showQuestions, setShowQuestions] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentStage, setCurrentStage] = useState(0)
  const [resultHash, setResultHash] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [isAnalysisMode, setIsAnalysisMode] = useState(false)
  const [hashInput, setHashInput] = useState('')

  useEffect(() => {
    if (!isAnalysisMode) {
      const params = new URLSearchParams(window.location.search)
      const nomeParam = params.get('nome')
      setNome(nomeParam || 'Nome não especificado')
    }
  }, [isAnalysisMode])

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
              ? 'bg-blue-600 text-white'
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

  if (!showQuestions) {
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
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <p className="font-medium text-lg">Sou o(a) {nome}</p>
                </button>

                <button
                  onClick={() => setTipoAvaliador('par')}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${tipoAvaliador === 'par'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <p className="font-medium text-lg">Sou um(a) dos pares da {nome}</p>
                </button>

                <button
                  onClick={() => setTipoAvaliador('lider')}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${tipoAvaliador === 'lider'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <p className="font-medium text-lg">Sou o(a) líder da {nome}</p>
                </button>
              </div>

              {tipoAvaliador && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowQuestions(true)}
                    className="bg-blue-600 w-full cursor-pointer text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                        <span className="font-bold text-blue-600">
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
                className="bg-blue-600 cursor-pointer w-1/2 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                    alert('Código copiado!')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                  className="px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  Ir para Análise Comparativa
                </button>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    )
  }

  if (isAnalysisMode) {
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
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação dos Pares
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Cole o código da avaliação do par 1"
                        className="w-full p-2 border rounded"
                      />
                      <button className="text-sm text-blue-600 hover:text-blue-700">
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
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsAnalysisMode(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                className="bg-blue-600 h-2 rounded-full transition-all"
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
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
