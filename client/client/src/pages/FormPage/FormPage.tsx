import "./FormPage.scss"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import QuestionComponent from '../../components/Question/Question';
import type { Question as QuestionType } from '../../components/Question/Question';
import { createForm as apiCreateForm } from './formApi'; // <-- імпорт API
import { gql } from "@apollo/client";
import { client } from '../../graphql/client';

type QuestionDTO = {
  id?: string;
  text: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DATE';
  options?: string[];
}
type FormDTO = {
  id: string;
  title: string;
  description?: string;
  questions: QuestionDTO[];
}

const GET_FORM = gql`
  query GetForm($id: ID!) {
    form(id: $id) {
      id
      title
      description
      questions {
        id
        text
        type
        options
      }
    }
  }
`;

export default function FormPage() {
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const isEdit = location.pathname.endsWith('/edit')
  const isView = !!id && !isEdit

  const [title, setTitle] = useState("Untitled Form")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = useCallback(async (formId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await client.query<{ form: FormDTO }>({ query: GET_FORM, variables: { id: formId }, fetchPolicy: 'network-only' })
      const f = res.data?.form
      if (f) {
        setTitle(f.title ?? "Untitled Form")
        setDescription(f.description ?? "")
        setQuestions((f.questions ?? []).map(q => ({ id: q.id ?? Date.now().toString(), type: q.type as QuestionType['type'], text: q.text, options: q.options })))
      } else {
        setError('Form not found')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Fetch error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchForm(id)
    } else {
      // new form reset
      setTitle("Untitled Form")
      setDescription("")
      setQuestions([])
    }
  }, [id, fetchForm])

  const addQuestion = () => {
    const newQ: QuestionType = { id: Date.now().toString(), type: 'TEXT', text: 'New Question', options: [] }
    setQuestions(prev => [...prev, newQ])
  }

  const updateQuestion = (index: number, patch: Partial<QuestionType>) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...patch } : q))
  }

  const addOption = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, options: [...(q.options ?? []), ''] } : q))
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const options = [...(q.options ?? [])]
      options[optIndex] = value
      return { ...q, options }
    }))
  }

  const removeOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const options = [...(q.options ?? [])]
      options.splice(optIndex, 1)
      return { ...q, options }
    }))
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  // create new form
  const handleCreate = async () => {
    setError(null)
    setLoading(true)
    try {
      const questionsInput = questions.map(q => ({
        type: q.type,
        text: q.text,
        options: q.options && q.options.length ? q.options : undefined
      }))
      const created = await apiCreateForm(title, description, questionsInput)
      if (created) {
        navigate('/')
      } else {
        setError('Не вдалося створити форму')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // save edits — server update mutation not implemented in backend; fallback: create new form and navigate home
  const handleSave = async () => {
    setError(null)
    setLoading(true)
    try {
      // if you implement updateForm on server, replace this with update call
      const questionsInput = questions.map(q => ({
        type: q.type,
        text: q.text,
        options: q.options && q.options.length ? q.options : undefined
      }))
      const created = await apiCreateForm(title, description, questionsInput)
      if (created) {
        navigate('/')
      } else {
        setError('Не вдалося зберегти форму')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Save error')
    } finally {
      setLoading(false)
    }
  }

  // readonly preview renderer for view/respond mode
  const renderPreview = (q: QuestionType, idx: number) => {
    if (q.type === 'TEXT') return <input type="text" disabled placeholder="Short answer" />
    if (q.type === 'DATE') return <input type="date" disabled />
    if (q.type === 'MULTIPLE_CHOICE') return (
      <div className="options">
        {(q.options ?? []).map((opt, oi) => <div key={oi}><input type="radio" name={`q-${idx}`} disabled/> {opt}</div>)}
      </div>
    )
    if (q.type === 'CHECKBOX') return (
      <div className="options">
        {(q.options ?? []).map((opt, oi) => <div key={oi}><input type="checkbox" disabled/> {opt}</div>)}
      </div>
    )
    return null
  }

  return (
    <>
      <header>
        <div className="form-title">
          <Link to="/"><img src="./img/logo.png" width={40} height={40} alt="" /></Link>
          <div>{id ? (isEdit ? 'Edit Form' : 'View Form') : 'New Form'}</div>
        </div>
      </header>

      <section className="form-section">
        <div className="form-container">
          <div className="content">
            <div className="form-header-container">
              <div className="form-header">
                <input
                  className="title"
                  type="text"
                  placeholder="Form Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isView && !isEdit}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isView && !isEdit}
                />
              </div>

              <div className="form-menu">
                <div className="add-btn">
                   {(!isView || isEdit) && (
                    <img
                      src="./img/icons/add.png"
                      width={24}
                      height={24}
                      alt="Add question"
                      style={{ cursor: 'pointer' }}
                      onClick={addQuestion}
                    />
                  )}
                </div>

               <div style={{ marginLeft: 12 }}>
                  {!id && <button className="create-form-btn" onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create Form'}</button>}
                  {id && isEdit && <button className="create-form-btn" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>}
                  {id && isView && <button onClick={() => navigate(`/form/${id}/edit`)}>Edit</button>}
                 {id && isView && <button onClick={() => navigate(`/form/${id}/respond`)} style={{ marginLeft: 8 }}>Respond</button>}
                 {id && isView && <button onClick={() => navigate(`/form/${id}/responses`)} style={{ marginLeft: 8 }}>Responses</button>}
                </div>
              </div>
            </div>

            {error && <div style={{ color: 'red', margin: '8px 0' }}>{error}</div>}

            <div className="questions-list">
              {questions.map((q, idx) => (
                isView && !isEdit
                ? <div key={q.id ?? idx} className="question-item">
                    <div className="question-row">
                      <div style={{ fontWeight: 600 }}>{`Q${idx + 1}. ${q.text}`}</div>
                    </div>
                    <div style={{ marginTop: 8 }}>{renderPreview(q, idx)}</div>
                  </div>
                : <QuestionComponent
                    key={q.id ?? idx}
                    question={q}
                    index={idx}
                    onChange={updateQuestion}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onRemoveOption={removeOption}
                    onRemoveQuestion={removeQuestion}
                  />
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}