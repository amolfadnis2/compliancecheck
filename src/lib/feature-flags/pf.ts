'use client'

/**
 * PF calculator feature flags — PostHog multivariate flags with an env-var
 * fallback (the repo's existing flag mechanism) and a safe default, so the
 * page works with PostHog blocked or not yet loaded.
 *
 *   flag                   values                       env fallback                     default
 *   pf_pdf_gate            none | optional | required   NEXT_PUBLIC_FF_PF_PDF_GATE        optional
 *   pf_default_chart       nominal | real               NEXT_PUBLIC_FF_PF_DEFAULT_CHART   nominal
 *   pf_hero_metric         corpus | return              NEXT_PUBLIC_FF_PF_HERO_METRIC     corpus
 *   pf_employer_view_cta   on | off                     NEXT_PUBLIC_FF_PF_EMPLOYER_CTA    off
 */

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

export interface PfFlags {
  pf_pdf_gate: 'none' | 'optional' | 'required'
  pf_default_chart: 'nominal' | 'real'
  pf_hero_metric: 'corpus' | 'return'
  pf_employer_view_cta: 'on' | 'off'
}

const ALLOWED: { [K in keyof PfFlags]: readonly PfFlags[K][] } = {
  pf_pdf_gate: ['none', 'optional', 'required'],
  pf_default_chart: ['nominal', 'real'],
  pf_hero_metric: ['corpus', 'return'],
  pf_employer_view_cta: ['on', 'off'],
}

// Literal process.env reads so Next.js inlines them at build time.
const ENV: { [K in keyof PfFlags]: string | undefined } = {
  pf_pdf_gate: process.env.NEXT_PUBLIC_FF_PF_PDF_GATE,
  pf_default_chart: process.env.NEXT_PUBLIC_FF_PF_DEFAULT_CHART,
  pf_hero_metric: process.env.NEXT_PUBLIC_FF_PF_HERO_METRIC,
  pf_employer_view_cta: process.env.NEXT_PUBLIC_FF_PF_EMPLOYER_CTA,
}

export const PF_FLAG_DEFAULTS: PfFlags = {
  pf_pdf_gate: 'optional',
  pf_default_chart: 'nominal',
  pf_hero_metric: 'corpus',
  pf_employer_view_cta: 'off',
}

function pick<K extends keyof PfFlags>(key: K, raw: unknown): PfFlags[K] | undefined {
  const v = raw === true ? 'on' : raw === false ? 'off' : raw
  return (ALLOWED[key] as readonly unknown[]).includes(v) ? (v as PfFlags[K]) : undefined
}

/** Resolve flags: PostHog value → env var → default. */
export function resolvePfFlags(fromPostHog: (key: string) => unknown = () => undefined): PfFlags {
  const out = { ...PF_FLAG_DEFAULTS }
  for (const key of Object.keys(ALLOWED) as (keyof PfFlags)[]) {
    const value = pick(key, fromPostHog(key)) ?? pick(key, ENV[key])
    if (value) (out as Record<string, string>)[key] = value
  }
  return out
}

const fromPostHog = (key: string): unknown =>
  typeof window !== 'undefined' && posthog.__loaded ? posthog.getFeatureFlag(key) : undefined

/** Env/default values on first render (SSR-safe); PostHog values once loaded. */
export function usePfFlags(): PfFlags {
  const [flags, setFlags] = useState<PfFlags>(() => resolvePfFlags())
  useEffect(() => {
    setFlags(resolvePfFlags(fromPostHog))
    if (typeof window === 'undefined' || !posthog.__loaded) return
    const off = posthog.onFeatureFlags(() => setFlags(resolvePfFlags(fromPostHog)))
    return typeof off === 'function' ? off : undefined
  }, [])
  return flags
}
