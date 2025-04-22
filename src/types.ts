export interface AnalysisData {
    autoAvaliacao: string
    avaliacaoPares: string[]
    avaliacaoLider: string
}

export interface AnalysisPoint {
    categoria: string
    media: number
    gap: number
}

export interface EvaluationResult {
    avaliado: string
    tipoAvaliador: string
    respostas: Record<string, number>
    timestamp: number
}

export interface QuestionType {
    id: string
    label: string
} 