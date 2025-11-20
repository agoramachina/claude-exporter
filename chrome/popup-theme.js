// Theme initialization for popup
// This runs immediately to sync with browse window theme preference

(function() {
  // Check if user has set a theme in browse window (stored in localStorage)
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    // Use saved theme from browse window
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme'); // dark
    }
  } else {
    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    // Default to dark unless system explicitly prefers light
    if (prefersLight && !prefersDark) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  // Listen for storage changes (when browse window changes theme)
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      if (e.newValue === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  });

  // Listen for system theme changes (only if no saved preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme') && e.matches) {
      document.documentElement.removeAttribute('data-theme');
    }
  });

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme') && e.matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  });
})();
