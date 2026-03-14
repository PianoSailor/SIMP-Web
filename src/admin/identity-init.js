const isDebug = document.cookie.includes('simp_debug=1') || window.__SIMP_DEBUG__ === true

if (!isDebug) {
  const identity = document.createElement('script')
  identity.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js'
  identity.onload = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.init()
    }
  }
  document.body.appendChild(identity)
}
