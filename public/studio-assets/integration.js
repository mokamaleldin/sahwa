(() => {
  const logout = document.getElementById('logout-button');

  async function checkSession() {
    try {
      const response = await fetch('/api/auth', { cache: 'no-store' });
      if (response.ok && !(await response.json()).authenticated) window.location.replace('/login');
    } catch {
      // Preserve the draft during a temporary connection failure.
    }
  }

  logout.addEventListener('click', async () => {
    logout.disabled = true;
    logout.textContent = 'جارٍ الخروج…';
    try {
      const response = await fetch('/api/auth', { method: 'DELETE' });
      if (!response.ok) throw new Error('Logout failed');
      window.location.replace('/login');
    } catch {
      logout.disabled = false;
      logout.textContent = 'تعذر الخروج، حاول مجددًا';
    }
  });

  window.addEventListener('pageshow', checkSession);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkSession();
  });
})();
