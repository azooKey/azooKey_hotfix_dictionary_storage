async function createIssueFromForm({ github, context }) {
  const payload = context.payload.client_payload;
  const content = payload.content;
  // Extract the word after "単語を入力してください:" if present
  const wordMatch = content.match(/^単語を入力してください:\s*(.+)$/m);
  const word = wordMatch ? wordMatch[1].trim() : null;

  const titlePrefix = word
    ? `vocabulary: add 「${word}」`
    : 'Form response';
  const title = `${titlePrefix} (${payload.filename})`;

  const body = [
    'Google Formに辞書追加のリクエストがありました。対応を検討してください。',
    '',
    '```',
    content,
    '```'
  ].join('\n');

  await github.rest.issues.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title,
    body
  });
}

module.exports = { createIssueFromForm };
