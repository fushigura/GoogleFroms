import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
        // Якщо сервер повертає errors, Apollo зазвичай викине помилку — але додаткова перевірка не завадить
        // (res.errors is not standard on successful typed result, тому помилки ловимо в catch)
        setResponses(res.data?.responses ?? []);
      } catch (err: any) {
        // лог для терміналу / devtools
        console.error("Failed to fetch responses:", err);
        // якщо це Apollo Error — витягнемо деталі
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
    <div style={{ padding: 20 }}>
      <Link to={`/form/${id}`}>Back to form</Link>
      <h2>Responses for form {id}</h2>

      {loading && <div>Loading responses...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!loading && !error && responses.length === 0 && <div>No responses yet</div>}

      {responses.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Submitted: {r.submittedAt ?? "—"}</div>
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
  );
}