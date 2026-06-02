import React from 'react'
import Link from '@docusaurus/Link'
import Butterfly from './Butterfly'

// Generic mockup-styled navbar link used for the "Get Started" (butterfly +
// label) and "at://" entries.
//
// These stay in the top bar at all widths (abbreviated on mobile via CSS:
// Get Started -> butterfly only, at:// -> "at://"), so they return null in the
// mobile hamburger — which keeps the standard Docusaurus menu (GitHub + the
// docs sidebar) intact rather than being replaced by these.
export default function NavCustomLink({
  mobile,
  label,
  to,
  href,
  icon,
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
      <span className="bpsNav__label">{label}</span>
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
