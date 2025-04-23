import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { StartEvaluation } from './components/StartEvaluation'
import { RoleSelection } from './components/RoleSelection'
import { EvaluationForm } from './components/EvaluationForm'
import { Analysis } from './components/Analysis'
import { FinalReview } from './components/FinalReview'
import { useEvaluation } from './hooks/useEvaluation'
import { useAnalysis } from './hooks/useAnalysis'

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
  const [isAnalysisMode, setIsAnalysisMode] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [showUrlCopy, setShowUrlCopy] = useState(false)

  const {
    answers,
    currentStage,
    resultHash,
    showModal,
    showToast,
    setShowModal,
    setShowToast,
    getQuestionsForRole,
    handleRatingChange,
    isCurrentCategoryComplete,
    handleNext,
    handlePrevious,
    generateEvaluationHash,
    decodeEvaluationHash,
    setCurrentStage,
    setAnswers
  } = useEvaluation()

  const {
    analysisData,
    setAnalysisData,
    showResults,
    setShowResults,
    analysisResults,
    addPeerField,
    updatePeerHash,
    removePeerField,
    generateAnalysis
  } = useAnalysis()

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

  const handleFinishEvaluation = () => {
    generateEvaluationHash(nome, tipoAvaliador)
    setShowModal(true)
  }

  const handleAnalysisBack = () => {
    setIsAnalysisMode(false)
    setShowQuestions(false)
    setTipoAvaliador('')
    setNome('')
    setCurrentStage(0)
    setAnswers({})
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
        setShowResults={setShowResults}
        analysisResults={analysisResults}
        generateAnalysis={() => generateAnalysis(decodeEvaluationHash)}
        updatePeerHash={updatePeerHash}
        addPeerField={addPeerField}
        removePeerField={removePeerField}
        onBack={handleAnalysisBack}
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

  const allCategories = getQuestionsForRole(tipoAvaliador)
  const currentCategory = allCategories[currentStage]

  if (!currentCategory) {
    return (
      <FinalReview
        allCategories={allCategories}
        answers={answers}
        onPrevious={handlePrevious}
        onFinish={handleFinishEvaluation}
        resultHash={resultHash}
        showModal={showModal}
        setShowModal={setShowModal}
        showToast={showToast}
        setShowToast={setShowToast}
        goToAnalysis={() => {
          setShowModal(false)
          setIsAnalysisMode(true)
          setShowQuestions(false)
          setCurrentStage(0)
          setAnswers({})
        }}
      />
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
      isCurrentCategoryComplete={() => isCurrentCategoryComplete(currentCategory)}
    />
  )
}

export default App
