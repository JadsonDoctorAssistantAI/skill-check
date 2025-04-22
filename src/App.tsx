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
import { Modal } from './components/Modal'
import { Toast } from './components/Toast'
import { StartEvaluation } from './components/StartEvaluation'
import { RoleSelection } from './components/RoleSelection'
import { EvaluationForm } from './components/EvaluationForm'
import { Analysis } from './components/Analysis'
import { AnalysisData, EvaluationResult } from './types'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

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
    const questions: { category: string, label: string, questions: Array<{ id: string, label: string }> }[] = []

    Object.entries(hardQuestions).forEach(([key, value]) => {
      questions.push({
        category: key,
        label: value.label,
        questions: value[role].questions
      })
    })

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

  const isCurrentCategoryComplete = () => {
    const currentCategory = getQuestionsForRole()[currentStage]
    if (!currentCategory) return false

    return currentCategory.questions.every(
      question => answers[question.id] !== undefined
    )
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
    } else if (currentStage === 0) {
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

  if (!nome && !isAnalysisMode) {
    return (
      <StartEvaluation
        novoNome={novoNome}
        setNovoNome={setNovoNome}
        handleStartNewEvaluation={handleStartNewEvaluation}
        showUrlCopy={showUrlCopy}
        showToast={showToast}
        setShowToast={setShowToast}
        goToAnalysis={goToAnalysis}
      />
    )
  }

  if (isAnalysisMode) {
    return (
      <Analysis
        analysisData={analysisData}
        setAnalysisData={setAnalysisData}
        showResults={showResults}
        analysisResults={analysisResults}
        setShowResults={setShowResults}
        generateAnalysis={generateAnalysis}
        updatePeerHash={updatePeerHash}
        addPeerField={addPeerField}
        removePeerField={removePeerField}
        onBack={() => {
          setIsAnalysisMode(false)
          setShowQuestions(false)
          setTipoAvaliador('')
          setNome('')
        }}
      />
    )
  }

  if (!showQuestions || !tipoAvaliador) {
    return (
      <RoleSelection
        nome={nome}
        tipoAvaliador={tipoAvaliador}
        setTipoAvaliador={setTipoAvaliador}
        setShowQuestions={setShowQuestions}
      />
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
              {allCategories.map((category) => (
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
    <EvaluationForm
      currentCategory={currentCategory}
      currentStage={currentStage}
      allCategories={allCategories}
      answers={answers}
      handleRatingChange={handleRatingChange}
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      isCurrentCategoryComplete={isCurrentCategoryComplete}
    />
  )
}

export default App
