import type { SVGProps } from 'react'

/**
 * Żaba (ADR-0037) — własny glyph w konwencji lucide (lucide nie ma żaby):
 * pysk z oczami-baniami i uśmiechem. Znaczenie niesie etykieta/aria-label
 * kontrolki — sam glif jest dekoracją (aria-hidden).
 */
export function FrogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8.2" cy="6.6" r="2.2" />
      <circle cx="15.8" cy="6.6" r="2.2" />
      <path d="M5 9.5C3.2 10.8 2.5 12.4 2.5 14C2.5 17.8 6.5 20.5 12 20.5C17.5 20.5 21.5 17.8 21.5 14C21.5 12.4 20.8 10.8 19 9.5" />
      <path d="M7.8 14.2C9 15.6 10.4 16.3 12 16.3C13.6 16.3 15 15.6 16.2 14.2" />
    </svg>
  )
}
