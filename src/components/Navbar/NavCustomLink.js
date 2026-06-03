import React from 'react'
import Link from '@docusaurus/Link'
import Butterfly from './Butterfly'

// Generic mockup-styled navbar link used for the "Get Started" (butterfly +
// label) and "AT Protocol" entries.
//
// These stay in the top bar at all widths (abbreviated on mobile via CSS:
// Get Started -> butterfly only, AT Protocol -> "at://"), so they return null
// in the mobile hamburger — which keeps the standard Docusaurus menu (GitHub
// + the docs sidebar) intact rather than being replaced by these.
//
// `shortLabel`, when provided, renders alongside `label` and the two spans
// swap visibility at the mobile breakpoint via CSS.
export default function NavCustomLink({
  mobile,
  label,
  shortLabel,
  to,
  href,
  icon,
  image,
  plain,
  friendly,
}) {
  if (mobile) return null
  const cls =
    'bpsNav bpsNav--link' +
    (plain ? ' bpsNav--plain' : '') +
    (friendly ? ' bpsNav--friendly' : '')
  const content = (
    <>
      {icon === 'butterfly' && <Butterfly className="bpsNav__butterfly" />}
      {image && <img className="bpsNav__image" src={image} alt="" aria-hidden="true" />}
      <span className="bpsNav__label bpsNav__label--long">{label}</span>
      {shortLabel && (
        <span className="bpsNav__label bpsNav__label--short">{shortLabel}</span>
      )}
    </>
  )
  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }
  return (
    <Link className={cls} to={to}>
      {content}
    </Link>
  )
}
