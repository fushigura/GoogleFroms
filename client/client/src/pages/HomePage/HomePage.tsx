import "./HomePage.scss"
import Header from "../../components/Header/Header"
import AddForm from "../../components/AddForm/AddForm"
import { gql } from '@apollo/client'
import { useEffect, useState, useCallback } from 'react'
import { client } from '../../graphql/client'
import { useNavigate } from 'react-router-dom'
import { createForm as apiCreateForm } from '../FormPage/formApi'

interface QuestionDTO {
  id?: string
  text: string
  type: string
  options?: string[]
}
interface FormDTO {
  id: string
  title: string
  description?: string
  questions: QuestionDTO[]
}

const GET_FORMS = gql`
  query GetForms {
    forms {
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

export default function HomePage() {
  const navigate = useNavigate()
  const [forms, setForms] = useState<FormDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await client.query<{ forms: FormDTO[] }>({ query: GET_FORMS, fetchPolicy: 'network-only' })
      setForms(res.data?.forms ?? [])
    } catch (e: any) {
      setError(e?.message ?? 'Fetch error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  // quick create: створює форму з дефолтними полями і додає у список
  const handleQuickCreate = async () => {
    setError(null)
    setLoading(true)
    try {
      const created = await apiCreateForm('Нова форма', '', [])
      if (created) {
        // додати в локальний стан для миттєвого відображення
        setForms(prev => [created, ...prev])
        // перейти на сторінку редагування (можна змінити на відкриття)
        navigate(`/form/${created.id}/edit`)
      } else {
        setError('Не вдалося створити форму')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Create error')
    } finally {
      setLoading(false)
    }
  }

  return(
    <>
      <Header/>
      <section className="create-from-section">
        <div className="create-form-container">
          <div className="content">
            <div className="title">Create Form</div>

            <div className="template-cards">
              <AddForm onClick={() => navigate('/form')} />
              <AddForm onClick={handleQuickCreate} label="Quick create" />
            </div>

            <div style={{ marginTop: 24 }}>
              <h2>Your forms</h2>
              {loading && <div>Loading...</div>}
              {error && <div style={{ color: 'red' }}>Error: {error}</div>}
              {!loading && forms.length === 0 && <div>No forms yet</div>}
              {forms.map((f) => (
                <div key={f.id} style={{ padding: 12, border: '1px solid #ddd', marginBottom: 8, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{f.title}</div>
                    <div style={{ color: '#666' }}>{f.description}</div>
                    <div style={{ marginTop: 8 }}>Questions: {f.questions?.length ?? 0}</div>
                  </div>
                  <div>
                    <button onClick={() => navigate(`/form/${f.id}`)} style={{ marginRight: 8 }}>Open</button>
                    <button onClick={() => navigate(`/form/${f.id}/edit`)}>Edit</button>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <button onClick={fetchForms}>Refresh</button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}