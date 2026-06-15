'use client'

import React from 'react'

// TEMPORARY debugging aid. Wraps a subtree and renders the real error
// message + stack on the client (Next.js redacts server-side error messages
// in production, leaving only a digest). Remove once the results crash is
// diagnosed.
interface State {
  error: Error | null
}

export class DebugBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[DebugBoundary] caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold text-red-700 mb-3">
              Results render error (debug)
            </h1>
            <pre className="whitespace-pre-wrap break-words text-xs bg-white border border-red-300 rounded p-4 text-red-900">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
