export const meta = {
  name: 'deepseek-workflow-probe',
  description: 'Minimal probe: does the native Workflow tool run agent() on DeepSeek?',
  phases: [
    { title: 'Probe', detail: 'Single agent probe' },
  ],
}

phase('Probe')
const result = await agent(
  'Respond with only the word PASS followed by your model identifier, e.g. "PASS deepseek-v4-flash" or "PASS claude-opus-4-8". Also include one sentence about what model you are.',
  { label: 'model-probe', schema: { type: 'object', properties: { verdict: { type: 'string', pattern: '^(PASS|FAIL)' }, model: { type: 'string' }, note: { type: 'string' } }, required: ['verdict', 'model', 'note'], additionalProperties: false } }
)
return result
