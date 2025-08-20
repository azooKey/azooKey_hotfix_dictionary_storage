async function createIssueFromForm({ github, context, core, fetch }) {
  const payload = context.payload.client_payload;
  const content = payload.content;
  // Extract the word after "単語を入力してください:" if present
  const wordMatch = content.match(/^単語を入力してください:\s*(.+)$/m);
  const word = wordMatch ? wordMatch[1].trim() : null;

  // Extract supplementary info
  const supplementMatch = content.match(/^この単語について補足すべき情報があれば記載してください:\s*(.*)$/m);
  const supplement = supplementMatch ? supplementMatch[1].trim() : '';

  let filteredContent = content;
  let llmCalled = false;
  let llmError = null;
  let toxicVerdict = null;

  if (supplement) {
    llmCalled = true;
    try {
      const res = await fetch('https://models.github.ai/inference/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You check whether the user text is toxic. If toxic, rewrite it into Japanese cat-speak. Respond in JSON.'
            },
            { role: 'user', content: supplement }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'toxicity',
              schema: {
                type: 'object',
                properties: {
                  toxic: { type: 'boolean' },
                  cat: { type: 'string' }
                },
                required: ['toxic', 'cat'],
                additionalProperties: false
              }
            }
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const msg = data?.choices?.[0]?.message?.content;
        const result = JSON.parse(msg);
        toxicVerdict = result.toxic;
        core.info(`LLM verdict: ${JSON.stringify(result)}`);
        if (result.toxic) {
          filteredContent = content.replace(
            /^この単語について補足すべき情報があれば記載してください:\s*(.*)$/m,
            `この単語について補足すべき情報があれば記載してください: ${result.cat}`
          );
        }
      } else {
        llmError = `HTTP ${res.status}`;
        core.warning(`LLM filtering failed: ${llmError}`);
      }
    } catch (err) {
      llmError = `${err}`;
      core.warning(`LLM filtering failed: ${err}`);
    }
  }

  const titlePrefix = word
    ? `vocabulary: add 「${word}」`
    : 'Form response';
  const title = `${titlePrefix} (${payload.filename})`;

  const body = [
    'Google Formに辞書追加のリクエストがありました。対応を検討してください。',
    '',
    '```',
    filteredContent,
    '```',
    '',
    '以下はGitHub Actionsの実行ログです',
    `LLM API called: ${llmCalled ? 'Yes' : 'No'}`,
    llmError ? `Error: ${llmError}` : null,
    toxicVerdict !== null ? `Toxic verdict: ${toxicVerdict}` : null
  ].filter(Boolean).join('\n');

  await github.rest.issues.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title,
    body
  });

  core.setOutput('llm_called', llmCalled);
  if (llmError) core.setOutput('llm_error', llmError);
  if (toxicVerdict !== null) core.setOutput('llm_toxic', toxicVerdict);
}

module.exports = { createIssueFromForm };
