import { createRequire } from 'node:module'
import Module from 'node:module'
import { vi } from 'vitest'
import 'dotenv/config'
import '@testing-library/jest-dom/vitest'

// jest-mock-extended unconditionally requires the real `@jest/globals` package,
// which throws when not running under actual Jest. Poison Node's module cache
// with a shim (jest.fn -> vi.fn) at the exact resolved path so that require
// call returns our shim instead of executing the real (throwing) module.
const rootRequire = createRequire(import.meta.url)
const calledWithFnPath = rootRequire.resolve(
  'jest-mock-extended/lib/CalledWithFn.js',
)
const localRequire = createRequire(calledWithFnPath)
const jestGlobalsPath = localRequire.resolve('@jest/globals')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(Module as any)._cache[jestGlobalsPath] = {
  id: jestGlobalsPath,
  filename: jestGlobalsPath,
  loaded: true,
  exports: { jest: { fn: vi.fn.bind(vi) } },
}
