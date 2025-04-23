import { useState } from 'react'
import hardQuestions from '../questions/hard.json'
import softQuestions from '../questions/soft.json'
import { EvaluationResult } from '../types'

export function useEvaluation() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentStage, setCurrentStage] = useState(0)
  const [resultHash, setResultHash] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const getQuestionsForRole = (tipoAvaliador: string) => {
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

  const isCurrentCategoryComplete = (currentCategory: any) => {
    if (!currentCategory) return false

    return currentCategory.questions.every(
      (question: { id: string }) => answers[question.id] !== undefined
    )
  }

  const handleNext = () => {
    setCurrentStage(prev => prev + 1)
    window.scrollTo(0, 0)
  }

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => Math.max(0, prev - 1))
      window.scrollTo(0, 0)
    }
  }

  const generateEvaluationHash = (nome: string, tipoAvaliador: string) => {
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

  return {
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
  }
} 