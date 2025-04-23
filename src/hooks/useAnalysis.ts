import { useState } from 'react'
import { AnalysisData, EvaluationResult } from '../types'

export function useAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    autoAvaliacao: '',
    avaliacaoPares: [''],
    avaliacaoLider: ''
  })
  const [showResults, setShowResults] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

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

  const generateAnalysis = (decodeEvaluationHash: (hash: string) => EvaluationResult) => {
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

  return {
    analysisData,
    setAnalysisData,
    showResults,
    setShowResults,
    analysisResults,
    addPeerField,
    updatePeerHash,
    removePeerField,
    generateAnalysis
  }
} 