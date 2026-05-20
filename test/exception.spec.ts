import { Failed, NotFound, Success } from '../src/exception'

describe('exceptions', () => {
  test('creates http error', () => {
    const error = new Failed()
    expect(error.status).toBe(400)
    expect(error.code).toBe(10001)
    expect(error.message).toBe('failed')
  })

  test('creates success', () => {
    const success = new Success()
    expect(success.status).toBe(201)
    expect(success.code).toBe(0)
  })

  test('creates not found', () => {
    const error = new NotFound()
    expect(error.status).toBe(404)
  })
})
