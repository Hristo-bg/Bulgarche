(function(){
  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  const translations = {
    bg: {
      heroTitle: 'Научете български с Bulgarche',
      heroDesc: 'Интерактивни уроци, тестове и офлайн аудио.',
      featuresTitle: 'Характеристики',
      features: ['Офлайн уроци и аудио','60 теста и 32 урока (coming soon)','Двуезична поддръжка: български / френски']
    },
    fr: {
      heroTitle: 'Apprenez le bulgare avec Bulgarche',
      heroDesc: 'Leçons interactives, tests et audio hors ligne.',
      featuresTitle: 'Fonctionnalités',
      features: ['Leçons et audio hors ligne','60 tests et 32 leçons (bientôt)','Support bilingue: bulgare / français']
    }
  };

  function setLanguage(code){
    const t = translations[code] || translations.bg;
    document.getElementById('hero-title').textContent = t.heroTitle;
    document.getElementById('hero-desc').textContent = t.heroDesc;
    document.getElementById('features-title').textContent = t.featuresTitle;
    const featuresList = document.getElementById('features-list');
    featuresList.innerHTML = '';
    t.features.forEach(f => { const li = document.createElement('li'); li.textContent = f; featuresList.appendChild(li); });
    if (langToggle) langToggle.textContent = code === 'bg' ? 'FR' : 'BG';
  }

  function toggleTheme(){
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    if (themeToggle) themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    if (themeToggle) themeToggle.textContent = '☀️';
  }

  if (langToggle){
    langToggle.addEventListener('click', function(){
      const current = langToggle.textContent === 'FR' ? 'bg' : 'fr';
      setLanguage(current);
      localStorage.setItem('language', current);
    });
  }

  if (themeToggle){
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Load saved language
  const savedLang = localStorage.getItem('language') || 'bg';
  setLanguage(savedLang);
})();