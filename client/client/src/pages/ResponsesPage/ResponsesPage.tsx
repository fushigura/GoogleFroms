import "./ResponsesPage.scss"
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../../graphql/client";

type AnswerItem = { questionId?: string; value?: string | string[] };
type ResponseDTO = { id: string; submittedAt?: string; answers: AnswerItem[] };

const GET_RESPONSES = gql`
  query GetResponses($formId: ID!) {
    responses(formId: $formId) {
      id
      submittedAt
      answers {
        questionId
        value
      }
    }
  }
`;

export default function ResponsesPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<ResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No form id");
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.query<{ responses: ResponseDTO[] }>({
          query: GET_RESPONSES,
          variables: { formId: id },
          fetchPolicy: "network-only",
        });
        setResponses(res.data?.responses ?? []);
      } catch (err: any) {
        console.error("Failed to fetch responses:", err);
        const graphQLErrors = err?.graphQLErrors;
        const networkError = err?.networkError;
        if (graphQLErrors && graphQLErrors.length) {
          setError(graphQLErrors.map((g: any) => g.message).join("; "));
        } else if (networkError) {
          setError(networkError?.result?.errors?.map((e: any) => e.message).join("; ") ?? networkError.message);
        } else {
          setError(err?.message ?? "Fetch error");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <>
      <header>
        <div className="form-title">
          <Link to="/"><img src="./img/logo.png" width={40} height={40} alt="" /></Link>
          <div>Responses</div>
        </div>
      </header>

      <section className="form-section">
        <div className="form-container">
          <div className="content">
            <div className="form-header-container">
              <div className="form-header">
                <div className="responses-body">
                  <h2>Responses for form {id}</h2>

                  {loading && <div>Loading responses...</div>}
                  {error && <div style={{ color: "red" }}>Error: {error}</div>}
                  {!loading && !error && responses.length === 0 && <div>No responses yet</div>}

                  {responses.map((r) => (
                    <div key={r.id} className="response-card">
                      <div className="response-meta">Submitted: {r.submittedAt ?? "—"}</div>
                      <div style={{ marginTop: 8 }}>
                        {r.answers.map((a, i) => (
                          <div key={i} style={{ marginBottom: 6 }}>
                            <strong>{a.questionId ?? `q${i + 1}`}:</strong>{" "}
                            {Array.isArray(a.value) ? a.value.join(", ") : a.value ?? "—"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-menu">
                <div className="add-btn" />
                <div className="menu-actions">
                  <button className="menu-btn secondary" onClick={() => navigate(`/form/${id}`)}>Back</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}