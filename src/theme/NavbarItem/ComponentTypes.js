// Register custom navbar item types so the masthead entries can be driven from
// docusaurus.config.js via `type: 'custom-bpsBrand'` / `type: 'custom-navLink'`.
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes'
import BpsBrand from '@site/src/components/Navbar/BpsBrand'
import NavCustomLink from '@site/src/components/Navbar/NavCustomLink'
import DocsMenu from '@site/src/components/Navbar/DocsMenu'

export default {
  ...ComponentTypes,
  'custom-bpsBrand': BpsBrand,
  'custom-navLink': NavCustomLink,
  'custom-docsMenu': DocsMenu,
}
