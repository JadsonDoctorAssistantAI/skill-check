interface EvaluationFormProps {
  currentCategory: {
    category: string
    label: string
    questions: Array<{
      id: string
      label: string
    }>
  }
  currentStage: number
  allCategories: Array<{
    category: string
    label: string
    questions: Array<{
      id: string
      label: string
    }>
  }>
  answers: Record<string, number>
  handleRatingChange: (questionId: string, rating: number) => void
  handlePrevious: () => void
  handleNext: () => void
  isCurrentCategoryComplete: () => boolean
}

export function EvaluationForm({
  currentCategory,
  currentStage,
  allCategories,
  answers,
  handleRatingChange,
  handlePrevious,
  handleNext,
  isCurrentCategoryComplete
}: EvaluationFormProps) {
  const renderRatingButtons = (questionId: string) => {
    return (
      <div className="flex gap-4 justify-between w-full max-w-lg mx-auto">
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
                <div className="flex items-center gap-4 justify-between">
                  <span className="text-xs text-gray-400">Discordo totalmente</span>
                  {renderRatingButtons(question.id)}
                  <span className="text-xs text-gray-400">Concordo totalmente</span>
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