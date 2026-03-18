// ...existing code...
import React from 'react';
import "./Question.scss"

type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DATE';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
}

interface Props {
  question: Question;
  index: number;
  onChange: (index: number, patch: Partial<Question>) => void;
  onAddOption: (index: number) => void;
  onUpdateOption: (qIndex: number, optIndex: number, value: string) => void;
  onRemoveOption: (qIndex: number, optIndex: number) => void;
  onRemoveQuestion: (index: number) => void;
}

export default function QuestionComponent({
  question,
  index,
  onChange,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onRemoveQuestion
}: Props) {

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as QuestionType;
    // якщо тип потребує options — ініціалізуємо, інакше прибираємо
    if (type === 'MULTIPLE_CHOICE' || type === 'CHECKBOX') {
      onChange(index, { type, options: question.options && question.options.length ? question.options : [''] });
    } else {
      onChange(index, { type, options: undefined });
    }
  };

  return (
    <div className="question-item">
      <div className="question-row">
        <input
          className="question-text"
          type="text"
          placeholder={`Question ${index + 1}`}
          value={question.text}
          onChange={e => onChange(index, { text: e.target.value })}
        />

        <select
          value={question.type}
          onChange={handleTypeChange}
        >
          <option value="TEXT">Text</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="CHECKBOX">Checkbox</option>
          <option value="DATE">Date</option>
        </select>

        <button className='remove-btn' type="button" onClick={() => onRemoveQuestion(index)}>Remove</button>
      </div>

      {/* Preview / options for different types */}
      {question.type === 'TEXT' && (
        <div className="answer-preview">
          <input type="text" placeholder="Short answer text" disabled />
        </div>
      )}

      {question.type === 'DATE' && (
        <div className="answer-preview">
          <input type="date" disabled />
        </div>
      )}

      {(question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') && (
        <div className="options">
          {(question.options ?? []).map((opt, oi) => (
            <div key={oi} className="option-row">
              {question.type === 'MULTIPLE_CHOICE' ? (
                <input type="radio" disabled />
              ) : (
                <input type="checkbox" disabled />
              )}
              <input
                type="text"
                className="option-input"
                placeholder={`Option ${oi + 1}`}
                value={opt}
                onChange={e => onUpdateOption(index, oi, e.target.value)}
              />
              <button type="button" onClick={() => onRemoveOption(index, oi)}>x</button>
            </div>
          ))}

          <button type="button" onClick={() => onAddOption(index)}>Add option</button>
        </div>
      )}
    </div>
  );
}