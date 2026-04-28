import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { describe, expect, test } from 'vitest'

import { getErrorMessage } from './errors'

function createAxiosError (data: unknown) {
  return new axios.AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    {
      headers: {}
    } as InternalAxiosRequestConfig,
    undefined,
    {
      config: {
        headers: {}
      } as InternalAxiosRequestConfig,
      data,
      headers: {},
      status: 400,
      statusText: 'Bad Request'
    }
  )
}

describe('getErrorMessage', () => {
  describe('when API error has detail', () => {
    test('should return detail message', () => {
      const error = createAxiosError({
        detail: 'Invalid credentials'
      })

      expect(getErrorMessage(error)).toBe('Invalid credentials')
    })
  })

  describe('when API error has field array errors', () => {
    test('should return first field error', () => {
      const error = createAxiosError({
        email: ['Enter a valid email'],
        username: ['Username is required']
      })

      expect(getErrorMessage(error)).toBe('Enter a valid email')
    })
  })

  describe('when API error has field string errors', () => {
    test('should return first field message', () => {
      const error = createAxiosError({
        non_field_errors: 'Unable to save note'
      })

      expect(getErrorMessage(error)).toBe('Unable to save note')
    })
  })

  describe('when API error has empty field array errors', () => {
    test('should return axios error message', () => {
      const error = createAxiosError({
        email: []
      })

      expect(getErrorMessage(error, 'Unable to submit.')).toBe('Request failed')
    })
  })

  describe('when error has message', () => {
    test('should return error message', () => {
      expect(getErrorMessage(new Error('Network unavailable'))).toBe('Network unavailable')
    })
  })

  describe('when error cannot be parsed', () => {
    test('should return fallback message', () => {
      expect(getErrorMessage(null, 'Unable to continue.')).toBe('Unable to continue.')
    })
  })
})
