// Font Awesome configuration (if using CDN)
export const initFontAwesome = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
  document.head.appendChild(link)
}

// Initialize
initFontAwesome()
