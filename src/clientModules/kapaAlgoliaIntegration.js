/**
 * Kapa.ai + Algolia DocSearch Integration
 * Adds an "Ask AI" button to the Algolia search modal that opens Kapa with the current query
 */

function createAskAIButton() {
  const button = document.createElement('button');
  button.className = 'kapa-ask-ai-button';
  button.textContent = 'Ask AI';
  return button;
}

function initKapaAlgoliaIntegration() {
  // Watch for the DocSearch modal to appear
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if DocSearch modal was added
          const modal = node.classList?.contains('DocSearch-Modal')
            ? node
            : node.querySelector?.('.DocSearch-Modal');

          if (modal && !modal.querySelector('.kapa-ask-ai-button')) {
            injectAskAIButton(modal);
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function injectAskAIButton(modal) {
  const searchBox = modal.querySelector('.DocSearch-SearchBar');
  if (!searchBox) return;

  const button = createAskAIButton();

  // Insert after the search bar
  const container = document.createElement('div');
  container.className = 'kapa-ask-ai-container';
  container.appendChild(button);
  searchBox.insertAdjacentElement('afterend', container);

  button.addEventListener('click', () => {
    const input = modal.querySelector('.DocSearch-Input');
    const query = input?.value || '';

    if (window.Kapa) {
      // Close the DocSearch modal
      const cancelButton = modal.querySelector('.DocSearch-Cancel');
      if (cancelButton) cancelButton.click();

      // Open Kapa with the query
      window.Kapa.open({ query, submit: query.length > 0 });
    }
  });
}

// Initialize when DOM is ready (only in browser environment)
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKapaAlgoliaIntegration);
  } else {
    initKapaAlgoliaIntegration();
  }
}
