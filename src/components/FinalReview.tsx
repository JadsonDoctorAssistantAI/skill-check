import { Modal } from './Modal'
import { Toast } from './Toast'
import { Category } from '../types'

interface FinalReviewProps {
  allCategories: Category[]
  answers: Record<string, number>
  onPrevious: () => void
  onFinish: () => void
  resultHash: string
  showModal: boolean
  setShowModal: (show: boolean) => void
  showToast: boolean
  setShowToast: (show: boolean) => void
  goToAnalysis: () => void
}

export function FinalReview({
  allCategories,
  answers,
  onPrevious,
  onFinish,
  resultHash,
  showModal,
  setShowModal,
  showToast,
  setShowToast,
  goToAnalysis
}: FinalReviewProps) {
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
              onClick={onPrevious}
              className="bg-gray-200 cursor-pointer w-1/2 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
            <button
              className="bg-cyan-600 cursor-pointer w-1/2 text-white px-8 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              onClick={onFinish}
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
                onClick={goToAnalysis}
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