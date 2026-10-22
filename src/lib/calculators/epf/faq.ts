/**
 * PF calculator FAQ — visible on the page and emitted as FAQPage JSON-LD from
 * the same array. Every figure comes from params (via PfFacts).
 */

import { inr, lakh, ratePct, fmtDate, type PfFacts } from './view'

export interface FaqItem {
  question: string
  answer: string
}

export function pfFaq(f: PfFacts): FaqItem[] {
  const rate = f.latestRateRow
  const rateDetail = rate
    ? [
        rate.decided_on && `The Central Board of Trustees recommended it on ${fmtDate(rate.decided_on)}`,
        rate.notified_on && `EPFO issued crediting instructions on ${fmtDate(rate.notified_on)}`,
      ]
        .filter(Boolean)
        .join(', and ')
    : ''
  return [
    {
      question: 'Does a salary hike always increase my PF?',
      answer: `Only if your employer pays PF on your full Basic + DA. Many employers cap it at the wage ceiling, now ${inr(f.ceiling)}. Then your contribution stays at ${inr(f.maxEe)} a month however much your salary rises.`,
    },
    {
      question: `What is the EPF interest rate for ${f.latestFy}?`,
      answer: `${ratePct(f.latestRate)}.${rateDetail ? ` ${rateDetail}.` : ''}`,
    },
    {
      question: `What changed on ${fmtDate(f.ceilingFrom).replace(/ \d{4}$/, '')} ${f.ceilingFrom.slice(0, 4)}?`,
      answer: `The EPF wage ceiling rose from ${inr(f.previousCeiling)} to ${inr(f.ceiling)} a month. Mandatory contributions for anyone earning up to ${inr(f.ceiling)} now apply to their full wage, and the maximum mandatory employee PF rose from ${inr(f.previousMaxEe)} to ${inr(f.maxEe)} a month.`,
    },
    {
      question: 'Is my PF interest taxable?',
      answer: `Interest on your own contributions above ${lakh(f.taxThreshold)} a year (${lakh(f.taxThresholdNoEmployer)} if your employer doesn’t contribute) is taxable each year. Interest on the rest stays tax-free.`,
    },
    {
      question: 'How does the Labour Code 50% rule affect PF?',
      answer: 'If allowances that don’t count as wages make up more than half your pay, the excess is added back to your PF wage. Low-Basic salary structures will see PF go up.',
    },
    {
      question: `Where does the employer’s ${f.epsShare} go?`,
      answer: 'To the Employees’ Pension Scheme. It doesn’t show in your PF balance, but it buys a monthly pension from age 58 once you have 10 years of service.',
    },
  ]
}
