import assert from 'node:assert/strict'
import test from 'node:test'

import { toPdfSafeText } from './pdf-text.ts'

test('normalizes narrow and non-breaking spaces for WinAnsi PDF fonts', () => {
  assert.equal(toPdfSafeText('A\u202Fnarrow\u00A0space'), 'A narrow space')
})
