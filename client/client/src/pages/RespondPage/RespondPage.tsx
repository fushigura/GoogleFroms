import "./RespondPage.scss"
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { client } from '../../graphql/client';

type Question = { id?: string; text: string; type: string; options?: string[] };
type FormDTO = { id: string; title: string; description?: string; questions: Question[] };

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

export default function RespondPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDTO | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No form id');
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.query<{ form: FormDTO }>({
          query: GET_FORM,
          variables: { id },
          fetchPolicy: 'network-only'
        });
        setForm(res.data?.form ?? null);
        if (!res.data?.form) setError('Form not found');
      } catch (e: any) {
        setError(e?.message ?? 'Fetch error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!form) return <div>Form not found</div>;

  const handleChange = (qid: string, value: any) => setAnswers(prev => ({ ...prev, [qid]: value }));

  const SUBMIT_RESPONSE = gql`
  mutation SubmitResponse($formId: ID!, $answers: [AnswerInput]) {
    submitResponse(formId: $formId, answers: $answers) {
      id
      formId
      submittedAt
      answers {
        questionId
        value
      }
    }
  }
`;

 const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const answersInput = Object.entries(answers).map(([qid, v]) => ({
        questionId: qid,
        value: typeof v === 'string' ? v : JSON.stringify(v)
      }));

      const res = await client.mutate({
        mutation: SUBMIT_RESPONSE,
        variables: { formId: id, answers: answersInput }
      });

      if (res?.data?.submitResponse) {
        // success -> go to responses view
        navigate(`/form/${id}/responses`);
      } else {
        setError('Submit failed');
      }
    } catch (e: any) {
      console.error('Submit error', e);
      setError(e?.message ?? 'Submit error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="form-title">
          <Link to="/"><img src="./img/logo.png" width={40} height={40} alt="" /></Link>
          <div>Respond</div>
        </div>
      </header>

      <section className="form-section">
        <div className="form-container">
          <div className="content">
            <div className="form-header-container">
              <div className="form-header">
                <div className="respond-body">
                  <h2>{form.title}</h2>
                  <p>{form.description}</p>

                  {form.questions.map((q, idx) => {
                    const qid = q.id ?? `q-${idx}`;
                    const value = answers[qid];

                    return (
                      <div key={qid} className="respond-question">
                        <div className="q-title">{`${idx + 1}. ${q.text}`}</div>

                        {q.type === 'TEXT' && (
                          <input type="text" value={value ?? ''} onChange={e => handleChange(qid, e.target.value)} />
                        )}

                        {q.type === 'DATE' && (
                          <input type="date" value={value ?? ''} onChange={e => handleChange(qid, e.target.value)} />
                        )}

                        {q.type === 'MULTIPLE_CHOICE' && (q.options ?? []).map((opt, oi) => (
                          <label key={oi} style={{ display: 'block' }}>
                            <input
                              type="radio"
                              name={qid}
                              checked={value === opt}
                              onChange={() => handleChange(qid, opt)}
                            /> {opt}
                          </label>
                        ))}

                        {q.type === 'CHECKBOX' && (q.options ?? []).map((opt, oi) => {
                          const arr: string[] = Array.isArray(value) ? value : [];
                          const checked = arr.includes(opt);
                          return (
                            <label key={oi} style={{ display: 'block' }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked ? arr.filter(a => a !== opt) : [...arr, opt];
                                  handleChange(qid, next);
                                }}
                              /> {opt}
                            </label>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-menu">
                <div className="add-btn" />
                <div className="menu-actions">
                  <button className="menu-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button className="menu-btn secondary" onClick={() => navigate(`/form/${form.id}`)}>Back</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}