// Error handling wrapper
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);
    // Don't crash - let app continue
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    // Don't crash - let app continue
});

// App State
const appState = {
    currentLesson: 0,
    currentTest: null,
    currentGame: null,
    lessons: [],
    tests: [],
    dictionary: [],
    wordsBg: [],
    progress: {
        lessonsRead: [],
        testsCompleted: [],
        gamesPlayed: 0,
        lessonProgress: {}, // Track reading progress per lesson
        totalScore: 0
    },
    user: {
        name: 'Étudiant',
        nameBg: 'Ученик',
        level: 1,
        language: 'both',
        avatar: '👤'
    },
    achievements: {
        totalAchievements: 0,
        achievementPoints: 0,
        unlockedAchievements: []
    },
    streak: {
        currentStreak: 0,
        lastActiveDate: null
    },
    settings: {
        theme: 'light',
        language: 'both'
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the first launch by verifying app version
    const appVersion = '4.0';
    const storedVersion = localStorage.getItem('bulgarche_version');
    
    // If version changed or not set, reset certain localStorage values
    if (storedVersion !== appVersion) {
        console.log('App version changed or first launch, resetting onboarding...');
        localStorage.removeItem('hasVisitedBefore');
        localStorage.removeItem('skipTutorial');
        // Note: Keep skipDisclaimer if explicitly set by user
        localStorage.setItem('bulgarche_version', appVersion);
    }
    
    loadProgress();
    loadSettings();
    
    // Listen for data loaded event
    window.addEventListener('dataLoaded', () => {
        console.log('Data loaded event received, initializing app...');
        // Small delay to ensure all DOM elements are fully loaded
        setTimeout(() => {
            initializeApp();
        }, 100);
    });
    
    // Also check if data is already loaded (in case event was missed)
    const checkDataLoaded = () => {
        if (window.appData) {
            console.log('Data already available, initializing app...');
            setTimeout(() => {
                initializeApp();
            }, 100);
        } else {
            // Check again in 100ms
            setTimeout(checkDataLoaded, 100);
        }
    };
    
    // Start checking after a short delay
    setTimeout(checkDataLoaded, 500);
});

async function initializeApp() {
    try {
        // Setup navigation first so menu works as soon as main app is shown
        if (typeof setupNavigation === 'function') {
            setupNavigation();
        }

        // Ensure disclaimer screen is visible at start
        const disclaimerScreen = document.getElementById('disclaimer-screen');
        const mainApp = document.getElementById('main-app');
        const tutorialScreen = document.getElementById('tutorial-screen');
        
        if (disclaimerScreen) disclaimerScreen.classList.add('active');
        if (mainApp) mainApp.classList.remove('active');
        if (tutorialScreen) tutorialScreen.classList.remove('active');
        
        // Check disclaimer - force show on first run
        const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
        const skipDisclaimer = localStorage.getItem('skipDisclaimer');
        
        if (!hasVisitedBefore) {
            // First time user - show disclaimer and tutorial
            setupDisclaimer();
            localStorage.setItem('hasVisitedBefore', 'true');
        } else if (skipDisclaimer === 'true') {
            const disclaimerScreen = document.getElementById('disclaimer-screen');
            if (disclaimerScreen) disclaimerScreen.classList.remove('active');
            checkTutorial();
        } else {
            setupDisclaimer();
        }

        // Load data if loadData exists
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Setup modals if setupModals exists
        if (typeof setupModals === 'function') {
            setupModals();
        }
        
        // Setup games if setupGames exists
        if (typeof setupGames === 'function') {
            setupGames();
        }
        
        // Setup settings if setupSettings exists
        if (typeof setupSettings === 'function') {
            setupSettings();
        }
        
        // Initialize achievements and profile if functions exist
        if (typeof initializeAchievements === 'function') {
            initializeAchievements();
        }
        if (typeof initializeProfile === 'function') {
            initializeProfile();
        }
        
        // Initialize mascot if function exists
        if (typeof initializeMascot === 'function') {
            initializeMascot();
        }
        
        // Update streak if function exists
        if (typeof updateStreak === 'function') {
            updateStreak();
        }
        
        // Update stats if function exists
        if (typeof updateStats === 'function') {
            updateStats();
        }
        
        // Setup quick action cards if function exists
        if (typeof setupQuickActions === 'function') {
            setupQuickActions();
        }
    } catch (error) {
        console.error('Error during app initialization:', error);
        // Try to at least show main app
        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.classList.add('active');
    }
}

function setupQuickActions() {
    // Setup desktop quick action cards
    document.querySelectorAll('.quick-action-card[data-action]').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            showPage(action);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`[data-page="${action}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
        });
    });
    
    // Setup mobile action buttons
    document.querySelectorAll('.mobile-action-btn[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            showPage(action);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`[data-page="${action}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
        });
    });
}

// Disclaimer
function setupDisclaimer() {
    // Ensure disclaimer screen is visible
    const disclaimerScreen = document.getElementById('disclaimer-screen');
    if (disclaimerScreen) {
        disclaimerScreen.classList.add('active');
    }
    
    const acceptButton = document.getElementById('accept-disclaimer');
    if (!acceptButton) {
        console.error('Disclaimer accept button not found!');
        // Try again after a short delay in case DOM isn't ready
        setTimeout(() => setupDisclaimer(), 200);
        return;
    }
    
    console.log('Setting up disclaimer with accept button');
    
    // Remove all existing listeners by cloning
    const newButton = acceptButton.cloneNode(true);
    acceptButton.parentNode.replaceChild(newButton, acceptButton);
    
    // Simple direct click handler
    newButton.onclick = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Disclaimer accepted via onclick');
        handleDisclaimerAccept();
        return false;
    };
    
    // Also add addEventListener as backup
    newButton.addEventListener('click', function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Disclaimer accepted via addEventListener');
        handleDisclaimerAccept();
        return false;
    }, true); // Use capture phase
    
    // Handle Enter key
    newButton.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDisclaimerAccept();
        }
    });
}

function handleDisclaimerAccept() {
    const skipCheckbox = document.getElementById('skip-disclaimer-device');
    const skip = skipCheckbox ? skipCheckbox.checked : false;
    
    if (skip) {
        localStorage.setItem('skipDisclaimer', 'true');
    }
    
    const disclaimerScreen = document.getElementById('disclaimer-screen');
    if (disclaimerScreen) {
        disclaimerScreen.classList.remove('active');
    }
    
    // Call checkTutorial if it exists
    if (typeof checkTutorial === 'function') {
        checkTutorial();
    } else {
        // Fallback: show main app
        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.classList.add('active');
    }
}

function checkTutorial() {
    const skipTutorial = localStorage.getItem('skipTutorial');
    const mainApp = document.getElementById('main-app');
    const tutorialScreen = document.getElementById('tutorial-screen');
    // Show tutorial unless user previously chose "skip permanently"
    if (skipTutorial === 'skip-permanently') {
        if (tutorialScreen) tutorialScreen.classList.remove('active');
        if (mainApp) mainApp.classList.add('active');
    } else {
        if (mainApp) mainApp.classList.remove('active');
        setupTutorial();
    }
}

// Tutorial
let currentTutorialStep = 1;
const totalTutorialSteps = 5;
let tutorialListenersAdded = false;

function setupTutorial() {
    const tutScreen = document.getElementById('tutorial-screen');
    const mainApp = document.getElementById('main-app');
    if (!tutScreen) return;
    if (mainApp) mainApp.classList.remove('active');
    tutScreen.classList.add('active');
    currentTutorialStep = 1;
    updateTutorialStep();

    if (tutorialListenersAdded) return;
    tutorialListenersAdded = true;
    
    document.getElementById('next-tutorial').addEventListener('click', () => {
        if (currentTutorialStep < totalTutorialSteps) {
            currentTutorialStep++;
            updateTutorialStep();
        }
    });
    
    document.getElementById('prev-tutorial').addEventListener('click', () => {
        if (currentTutorialStep > 1) {
            currentTutorialStep--;
            updateTutorialStep();
        }
    });
    
    const finishBtn = document.getElementById('finish-tutorial');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            const skipEl = document.getElementById('skip-tutorial-device');
            if (skipEl && skipEl.checked) {
                localStorage.setItem('skipTutorial', 'skip-permanently');
            }
            const tutScreen = document.getElementById('tutorial-screen');
            const mainApp = document.getElementById('main-app');
            if (tutScreen) tutScreen.classList.remove('active');
            if (mainApp) mainApp.classList.add('active');
        });
    }
}

function updateTutorialStep() {
    document.querySelectorAll('.tutorial-step').forEach((step, idx) => {
        step.classList.toggle('active', idx + 1 === currentTutorialStep);
    });
    
    document.getElementById('prev-tutorial').style.display = 
        currentTutorialStep > 1 ? 'inline-block' : 'none';
    document.getElementById('next-tutorial').style.display = 
        currentTutorialStep < totalTutorialSteps ? 'inline-block' : 'none';
    document.getElementById('finish-tutorial').style.display = 
        currentTutorialStep === totalTutorialSteps ? 'inline-block' : 'none';
}

// Load Data
async function loadData() {
    try {
        // Load lessons
        appState.lessons = window.appData.lessons || [];
        
        // Load tests
        appState.tests = (window.appData.tests || [])
            .filter(test => test && test.questions && test.questions.length > 0)
            .map((test, idx) => ({
                ...test,
                id: idx
            }));
        
        // Load dictionary
        appState.dictionary = (window.appData.dictionary || []).filter(w => w && w.word && w.word.trim().length > 0);
        
        // Load Bulgarian words for audio
        appState.wordsBg = (window.appData.wordsBg || []).filter(w => w && w.trim().length > 0);
        buildWordsBgIndex();
        buildDictionaryIndex();
        buildEnrichedWordsList();
        
        // Check if data loaded - be more lenient, allow partial data
        if (appState.lessons.length === 0 && appState.tests.length === 0 && appState.dictionary.length === 0) {
            console.warn('No data loaded at all, but continuing anyway...');
            // Don't show error message, just continue with empty state
        }
        
        // Render lessons
        if (appState.lessons.length > 0) {
            renderLessons();
        }
        
        // Render tests
        renderTests();
    } catch (error) {
        console.error('Error loading data:', error);
        console.warn('Continuing with partial data due to error:', error.message);
    }
}

function showErrorMessage(message) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
            <div style="text-align: center; max-width: 500px; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #e74c3c; margin-bottom: 20px;">Application Error</h2>
                <p style="color: #333; line-height: 1.6;">${message}</p>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">Please try reinstalling the application or contact support.</p>
            </div>
        </div>
    `;
}

function normalizeWordKey(value) {
    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\sа-яё]/gi, '');
}

function buildWordsBgIndex() {
    const index = new Map();
    (appState.wordsBg || []).forEach(w => {
        if (!w) return;
        const raw = String(w).trim();
        if (!raw) return;
        index.set(normalizeWordKey(raw), raw);
        const first = normalizeWordKey(raw).split(/\s+/)[0];
        if (first) index.set(first, raw);
    });
    appState.wordsBgIndex = index;
}

function buildDictionaryIndex() {
    const index = new Map();
    (appState.dictionary || []).forEach(entry => {
        const key = normalizeWordKey(entry?.word);
        if (!key) return;
        if (!index.has(key)) index.set(key, entry);
    });
    appState.dictionaryIndex = index;
}

function enrichBgWord(bgWordRaw) {
    const bgWord = String(bgWordRaw || '').trim();
    const key = normalizeWordKey(bgWord);
    const dictEntry = appState.dictionaryIndex?.get(key);

    return {
        word: bgWord,
        type: dictEntry?.type || '',
        bgExplanation: dictEntry?.bgExplanation || '',
        frenchTranslation: dictEntry?.frenchTranslation || '',
        frenchExplanation: dictEntry?.frenchExplanation || ''
    };
}

function buildEnrichedWordsList() {
    const seen = new Set();
    const list = [];

    (appState.wordsBg || []).forEach(w => {
        const raw = String(w || '').trim();
        const key = normalizeWordKey(raw);
        if (!key) return;
        if (seen.has(key)) return;
        seen.add(key);
        list.push(enrichBgWord(raw));
    });

    // Keep dictionary tidy: sort alphabetically by Bulgarian word,
    // ignoring case and accents where possible.
    list.sort((a, b) => {
        const aw = String(a.word || '').toLowerCase();
        const bw = String(b.word || '').toLowerCase();
        return aw.localeCompare(bw, 'bg', { sensitivity: 'base' });
    });

    appState.dictionaryWords = list;
}

// Navigation
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    const overlay = document.getElementById('nav-overlay');

    // Single delegated listener for all nav actions (works on mobile touch)
    if (mainNav) {
        mainNav.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link, .nav-logo');
            if (link && link.classList.contains('nav-logo')) {
                e.preventDefault();
                showPage('home');
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                const homeLink = document.querySelector('[data-page="home"]');
                if (homeLink) homeLink.classList.add('active');
                closeMobileDrawer();
                return;
            }
            if (link && link.dataset.page) {
                e.preventDefault();
                const page = link.dataset.page;
                showPage(page);
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                closeMobileDrawer();
            }
        });

        // Add touch support for navigation links
        mainNav.addEventListener('touchend', (e) => {
            const link = e.target.closest('.nav-link, .nav-logo');
            if (link) {
                e.preventDefault();
                if (link.classList.contains('nav-logo')) {
                    showPage('home');
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    const homeLink = document.querySelector('[data-page="home"]');
                    if (homeLink) homeLink.classList.add('active');
                } else if (link.dataset.page) {
                    const page = link.dataset.page;
                    showPage(page);
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
                closeMobileDrawer();
            }
        }, { passive: false });
    }

    // Mobile drawer: open/close (improved touch handling)
    const menuBtn = document.getElementById('nav-menu-btn');
    if (menuBtn) {
        // Remove existing listeners to prevent duplicates
        menuBtn.removeEventListener('touchend', menuBtn._touchHandler);
        menuBtn.removeEventListener('click', menuBtn._clickHandler);
        
        function toggleDrawer(e) {
            e.preventDefault();
            e.stopPropagation();
            document.body.classList.toggle('drawer-open');
            if (overlay) overlay.setAttribute('aria-hidden', document.body.classList.contains('drawer-open') ? 'false' : 'true');
        }
        
        menuBtn._touchHandler = toggleDrawer;
        menuBtn._clickHandler = toggleDrawer;
        
        menuBtn.addEventListener('touchend', menuBtn._touchHandler, { passive: false });
        menuBtn.addEventListener('click', menuBtn._clickHandler);
        
        // Add visual feedback
        menuBtn.addEventListener('touchstart', () => {
            menuBtn.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        menuBtn.addEventListener('touchend', () => {
            setTimeout(() => {
                menuBtn.style.transform = 'scale(1)';
            }, 100);
        }, { passive: true });
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileDrawer);
        overlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            closeMobileDrawer();
        }, { passive: false });
    }
}

function closeMobileDrawer() {
    document.body.classList.remove('drawer-open');
    const overlay = document.getElementById('nav-overlay');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(`${pageName}-page`);
    
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Auto-load dictionary words when dictionary page is shown
        if (pageName === 'dictionary' && Array.isArray(appState.dictionaryWords)) {
            setTimeout(() => {
                const searchInput = document.getElementById('dictionary-search');
                if (!searchInput.value) {
                    displayDictionaryWords(appState.dictionaryWords);
                }
            }, 300);
        }
    }
}

// Lessons - Duolingo style grid layout (all visible)
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function renderLessons() {
    const pathContainer = document.getElementById('lessons-path');
    if (!pathContainer) return;

    pathContainer.innerHTML = '';

    if (!appState.lessons || appState.lessons.length === 0) {
        pathContainer.innerHTML = '<p style="text-align: center; font-size: 24px;">Chargement des leçons... / Зареждане на уроците...</p>';
        return;
    }

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Create grid layout: 8 lessons per row
    const lessonsPerRow = 8;
    const totalRows = Math.ceil(appState.lessons.length / lessonsPerRow);

    // Create rows - optimized without heavy animations
    for (let row = 0; row < totalRows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'lesson-row';
        rowDiv.style.cssText = 'display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; position: relative; width: 100%; min-height: 120px;';

        const startIdx = row * lessonsPerRow;
        const endIdx = Math.min(startIdx + lessonsPerRow, appState.lessons.length);

        for (let i = startIdx; i < endIdx; i++) {
            const lesson = appState.lessons[i];
            if (!lesson) continue;

            const index = i;
            const isCompleted = appState.progress.lessonsRead.includes(lesson.id);

            // SIMPLIFIED: all lessons are always available in order (no locking).
            // We still show completed lessons differently, but every lesson can be opened.
            const isAvailable = true;
            const isCurrent = index === appState.currentLesson && isAvailable;
            
            const lessonNode = document.createElement('div');
            lessonNode.className = 'lesson-node';
            lessonNode.style.opacity = '1';
            lessonNode.style.willChange = 'auto'; // Remove will-change for better performance
            
            const circle = document.createElement('div');
            circle.className = 'lesson-circle';
            
            if (!isAvailable) {
                circle.classList.add('locked');
                circle.innerHTML = '🔒';
            } else if (isCompleted) {
                circle.classList.add('completed');
                circle.innerHTML = '✓';
            } else if (isCurrent) {
                circle.classList.add('current');
                circle.textContent = index + 1;
            } else {
                circle.classList.add('available');
                circle.textContent = index + 1;
            }
            
            const title = document.createElement('div');
            title.className = 'lesson-title';
            const titleText = lesson.title || `Leçon ${index + 1}`;
            title.textContent = titleText.length > 25 ? titleText.substring(0, 25) + '...' : titleText;
            title.title = titleText;
            
            if (isAvailable) {
                circle.style.cursor = 'pointer';
                circle.classList.add('clickable');
                // Use event delegation instead of individual listeners for better performance
                circle.dataset.lessonIndex = index;
            } else {
                circle.style.cursor = 'not-allowed';
            }
            
            lessonNode.appendChild(circle);
            lessonNode.appendChild(title);
            rowDiv.appendChild(lessonNode);
        }
        
        fragment.appendChild(rowDiv);
        
        // Add connector - simplified without heavy SVG
        if (row < totalRows - 1) {
            const connector = document.createElement('div');
            connector.className = 'row-connector';
            connector.style.cssText = 'width: 60px; height: 30px; margin: 5px auto; position: relative;';
            fragment.appendChild(connector);
        }
    }
    
    // Append fragment in one operation
    pathContainer.appendChild(fragment);

    // Use event delegation for better performance - ensure only one listener on container
    if (pathContainer._lessonClickHandler) {
        pathContainer.removeEventListener('click', pathContainer._lessonClickHandler);
    }
    pathContainer._lessonClickHandler = (e) => {
        const circle = e.target.closest('.lesson-circle.clickable');
        if (circle && circle.dataset.lessonIndex) {
            const index = parseInt(circle.dataset.lessonIndex, 10);
            if (!Number.isNaN(index)) {
                openLesson(index);
            }
        }
    };
    pathContainer.addEventListener('click', pathContainer._lessonClickHandler);
}

function openLesson(index) {
    appState.currentLesson = index;
    const lesson = appState.lessons[index];
    
    document.getElementById('lesson-modal-title').textContent = lesson.title;
    document.getElementById('lesson-bulgarian').textContent = lesson.bulgarian;
    document.getElementById('lesson-french').textContent = lesson.french;
    
    // Update progress bar
    updateLessonProgress(lesson.id);
    
    const checkbox = document.getElementById('lesson-read-checkbox');
    checkbox.checked = appState.progress.lessonsRead.includes(lesson.id);
    
    checkbox.onchange = () => {
        if (checkbox.checked) {
            if (!appState.progress.lessonsRead.includes(lesson.id)) {
                appState.progress.lessonsRead.push(lesson.id);
                appState.progress.lessonProgress[lesson.id] = 100;
                appState.progress.totalScore += 10;
            }
        } else {
            appState.progress.lessonsRead = appState.progress.lessonsRead.filter(id => id !== lesson.id);
            appState.progress.lessonProgress[lesson.id] = 0;
            appState.progress.totalScore = Math.max(0, appState.progress.totalScore - 10);
        }
        updateLessonProgress(lesson.id);
        saveProgress();
        renderLessons();
        updateStats();
    };
    
    // Track reading progress - debounced for better performance
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        // Remove old scroll listener if exists
        if (modalContent._scrollHandler) {
            modalContent.removeEventListener('scroll', modalContent._scrollHandler);
        }
        
        // Create debounced scroll handler
        modalContent._scrollHandler = debounce(() => {
            const scrollPosition = modalContent.scrollTop / (modalContent.scrollHeight - modalContent.clientHeight);
            const progress = Math.min(100, Math.round(scrollPosition * 100));
            if (!appState.progress.lessonProgress[lesson.id] || appState.progress.lessonProgress[lesson.id] < progress) {
                appState.progress.lessonProgress[lesson.id] = progress;
                updateLessonProgress(lesson.id);
            }
        }, 200); // Debounce for 200ms
        
        modalContent.addEventListener('scroll', modalContent._scrollHandler, { passive: true });
    }
    
    // Update buttons
    document.getElementById('lesson-prev').style.display = index > 0 ? 'inline-block' : 'none';
    document.getElementById('lesson-next').style.display = index < appState.lessons.length - 1 ? 'inline-block' : 'none';
    
    document.getElementById('lesson-modal').classList.add('active');
}

function updateLessonProgress(lessonId) {
    const progress = appState.progress.lessonProgress[lessonId] || 0;
    const progressBar = document.getElementById('lesson-progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';
    }
}

function setupModals() {
    // Close modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').classList.remove('active');
        });
    });
    
    // Lesson navigation – use direct onclick so there is always exactly one handler
    const prevBtn = document.getElementById('lesson-prev');
    const nextBtn = document.getElementById('lesson-next');

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (appState.currentLesson > 0) {
                openLesson(appState.currentLesson - 1);
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            if (appState.currentLesson < appState.lessons.length - 1) {
                openLesson(appState.currentLesson + 1);
            }
        };
    }
    
    document.getElementById('go-to-tests').addEventListener('click', () => {
        document.getElementById('lesson-modal').classList.remove('active');
        showPage('tests');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-page="tests"]').classList.add('active');
    });
    
    // Close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Tests
function renderTests() {
    const testsList = document.getElementById('tests-list');
    testsList.innerHTML = '';

    // If tests are not yet loaded, show a short loading message and retry once
    if (!appState.tests || appState.tests.length === 0) {
        testsList.innerHTML = '<p style="text-align: center; font-size: 24px; padding: 40px;">Chargement des tests... / Зареждане на тестовете...</p>';

        setTimeout(() => {
            if (!appState.tests || appState.tests.length === 0) {
                testsList.innerHTML = '<p style="text-align: center; font-size: 24px; padding: 40px; color: #d32f2f;">Erreur: Aucun test trouvé. Veuillez vérifier le chargement des données. / Грешка: Не са намерени тестове. Моля, проверете зареждането на данните.</p>';
                return;
            }
            // When data arrives late, render again
            renderTests();
        }, 2000);
        return;
    }

    // Use fragment for better performance
    const fragment = document.createDocumentFragment();

    appState.tests.forEach((test, index) => {
        if (!test || !Array.isArray(test.questions) || test.questions.length === 0) {
            console.warn('Skipping test with no questions:', test);
            return;
        }

        const titleFr = test.titleFr || '';
        const titleBg = test.titleBg || '';
        const displayTitle = titleFr || titleBg || `Test ${index + 1}`;

        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.dataset.testIndex = index.toString();
        testCard.innerHTML = `
            <h3 style="font-size: 28px; margin-bottom: 10px;">${displayTitle}</h3>
            ${titleFr && titleBg && titleBg !== titleFr ? `<p style="font-size: 22px; margin: 10px 0; color: var(--accent-color);">${titleBg}</p>` : ''}
            <p style="font-size: 24px; font-weight: bold; margin-top: 15px;"><strong>${test.questions.length} questions / ${test.questions.length} въпроса</strong></p>
        `;
        testCard.classList.add('clickable');
        testCard.style.cursor = 'pointer';
        fragment.appendChild(testCard);
    });

    testsList.appendChild(fragment);

    // Use event delegation for better performance
    testsList.addEventListener('click', (e) => {
        const testCard = e.target.closest('.test-card');
        if (testCard && typeof testCard.dataset.testIndex !== 'undefined') {
            const index = parseInt(testCard.dataset.testIndex, 10);
            if (!Number.isNaN(index)) {
                openTest(index);
            }
        }
    });
}

function openTest(index) {
    if (index < 0 || index >= appState.tests.length) {
        alert('Test non disponible / Тестът не е наличен');
        return;
    }
    
    appState.currentTest = index;
    const test = appState.tests[index];
    
    if (!test || !test.questions || test.questions.length === 0) {
        alert('Test non disponible / Тестът не е наличен');
        console.error('Test has no questions:', test);
        return;
    }

    const titleFr = test.titleFr || '';
    const titleBg = test.titleBg || '';
    document.getElementById('test-modal-title').textContent = titleFr || titleBg || `Test ${index + 1}`;
    const questionsContainer = document.getElementById('test-questions');
    questionsContainer.innerHTML = '';
    
    test.questions.forEach((question, qIndex) => {
        const qFr = question?.questionFr || '';
        const qBg = question?.questionBg || '';
        const optsFr = Array.isArray(question?.optionsFr) ? question.optionsFr : [];
        const optsBg = Array.isArray(question?.optionsBg) ? question.optionsBg : [];
        const displayOptions = (optsBg.length >= 2 ? optsBg : (optsFr.length >= 2 ? optsFr : []));

        if (!question || (!qFr && !qBg) || displayOptions.length < 2) {
            console.warn('Skipping invalid question:', question);
            return;
        }
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'test-question';
        questionDiv.dataset.questionIndex = qIndex;
        questionDiv.innerHTML = `
            <h4 style="margin-bottom: 10px;">${qIndex + 1}.</h4>
            ${qFr ? `<div style="font-size: 26px; font-weight: bold; margin-bottom: 6px;">${qFr}</div>` : ''}
            ${qBg ? `<div style="font-size: 24px; opacity: 0.95;">${qBg}</div>` : ''}
        `;
        
        displayOptions.forEach((option, optIndex) => {
            if (!option || option.trim().length === 0) return;
            const optionDiv = document.createElement('div');
            optionDiv.className = 'test-option';
            optionDiv.dataset.answer = String.fromCharCode(65 + optIndex);
            optionDiv.dataset.questionIndex = qIndex;
            
            optionDiv.innerHTML = `<span style="font-weight: bold; margin-right: 20px; font-size: 28px; color: var(--primary-color);">${String.fromCharCode(65 + optIndex)})</span><span style="font-size: 28px;">${option}</span>`;
            
            optionDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove selection from all options in this question
                questionDiv.querySelectorAll('.test-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionDiv.classList.add('selected');
            });
            
            questionDiv.appendChild(optionDiv);
        });
        
        questionsContainer.appendChild(questionDiv);
    });
    
    document.getElementById('test-result').innerHTML = '';
    document.getElementById('test-result').style.display = 'none';
    document.getElementById('submit-test').style.display = 'block';
    document.getElementById('test-modal').classList.add('active');
    
    // Reset submit handler
    const submitBtn = document.getElementById('submit-test');
    submitBtn.onclick = submitTest;
}

function submitTest() {
    const test = appState.tests[appState.currentTest];
    if (!test || !test.questions) return;
    
    const questions = document.querySelectorAll('.test-question');
    let correct = 0;
    let total = test.questions.length;
    
    questions.forEach((questionDiv, index) => {
        if (index >= test.questions.length) return;
        
        const selected = questionDiv.querySelector('.test-option.selected');
        const question = test.questions[index];
        const correctAnswer = (question.correctAnswer || 'A').toUpperCase();
        
        // Disable all options after submission
        questionDiv.querySelectorAll('.test-option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            opt.classList.remove('selected');
        });
        
        if (selected) {
            const userAnswer = selected.dataset.answer.toUpperCase();
            
            // Mark correct answer
            questionDiv.querySelectorAll('.test-option').forEach(opt => {
                if (opt.dataset.answer.toUpperCase() === correctAnswer) {
                    opt.classList.add('correct');
                }
            });
            
            // Mark incorrect if wrong
            if (userAnswer !== correctAnswer) {
                selected.classList.add('incorrect');
            } else {
                correct++;
            }
        } else {
            // No answer selected, show correct one
            questionDiv.querySelectorAll('.test-option').forEach(opt => {
                if (opt.dataset.answer.toUpperCase() === correctAnswer) {
                    opt.classList.add('correct');
                }
            });
        }
    });
    
    const resultDiv = document.getElementById('test-result');
    const percentage = Math.round((correct / total) * 100);
    resultDiv.className = `test-result ${percentage >= 70 ? 'success' : 'error'}`;
    resultDiv.innerHTML = `
        <p style="font-size: 36px; margin-bottom: 15px; font-weight: bold;">Résultat: ${correct}/${total} (${percentage}%)</p>
        <p style="font-size: 32px; margin-bottom: 15px;">Резултат: ${correct}/${total} (${percentage}%)</p>
        ${percentage >= 70 ? '<p style="margin-top: 20px; font-size: 28px; font-weight: bold;">🎉 Excellent! / Отлично! 🎉</p>' : '<p style="margin-top: 20px; font-size: 28px;">Continuez! / Продължете!</p>'}
    `;
    resultDiv.style.display = 'block';
    document.getElementById('submit-test').style.display = 'none';
    
    // Track perfect tests
    if (percentage === 100) {
        const perfectTests = parseInt(localStorage.getItem('perfectTests')) || 0;
        localStorage.setItem('perfectTests', (perfectTests + 1).toString());
    }
    
    if (percentage >= 70 && !appState.progress.testsCompleted.includes(appState.currentTest)) {
        appState.progress.testsCompleted.push(appState.currentTest);
        appState.progress.totalScore += Math.round(percentage / 10);
        saveProgress();
        updateStats();
        checkForNewAchievements();
    } else if (percentage >= 70) {
        appState.progress.totalScore += Math.round(percentage / 20);
        saveProgress();
        updateStats();
    }
    
    checkForNewAchievements();
}

// Dictionary
document.getElementById('search-btn').addEventListener('click', searchDictionary);
document.getElementById('show-all-btn').addEventListener('click', () => {
    document.getElementById('dictionary-search').value = '';
    displayDictionaryWords(appState.dictionaryWords);
});
document.getElementById('dictionary-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchDictionary();
});

// Show initial dictionary words when page loads
setTimeout(() => {
    if (document.getElementById('dictionary-page').classList.contains('active')) {
        displayDictionaryWords(appState.dictionaryWords);
    }
}, 1000);

function searchDictionary() {
    const query = document.getElementById('dictionary-search').value.toLowerCase().trim();
    const results = document.getElementById('dictionary-results');
    results.innerHTML = '';
    
    if (!query) {
        // Show all words if no query
        displayDictionaryWords(appState.dictionaryWords);
        return;
    }
    
    // Track word searches for achievements
    const currentCount = parseInt(localStorage.getItem('wordsSearched')) || 0;
    localStorage.setItem('wordsSearched', (currentCount + 1).toString());
    checkForNewAchievements();
    
    const matches = (appState.dictionaryWords || []).filter(word => {
        // Bulgarian word search (exact match and partial)
        const wordLower = (word.word || '').toLowerCase().trim();
        const wordExactMatch = wordLower === query;
        const wordPartialMatch = wordLower.includes(query);
        
        // French translation search (exact match and partial)
        const transLower = (word.frenchTranslation || '').toLowerCase().trim();
        const transExactMatch = transLower === query;
        const transPartialMatch = transLower.includes(query);
        
        // Explanation searches
        const explLower = (word.frenchExplanation || '').toLowerCase().trim();
        const bgExplLower = (word.bgExplanation || '').toLowerCase().trim();
        const explMatch = explLower.includes(query) || bgExplLower.includes(query);
        
        // Prioritize exact matches
        return wordExactMatch || transExactMatch || wordPartialMatch || transPartialMatch || explMatch;
    }).sort((a, b) => {
        // Sort by relevance: exact matches first, then partial matches
        const aWord = (a.word || '').toLowerCase().trim();
        const aTrans = (a.frenchTranslation || '').toLowerCase().trim();
        const bWord = (b.word || '').toLowerCase().trim();
        const bTrans = (b.frenchTranslation || '').toLowerCase().trim();
        
        const aExact = aWord === query || aTrans === query;
        const bExact = bWord === query || bTrans === query;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // If both are exact or both are partial, sort alphabetically
        return aWord.localeCompare(bWord);
    });
    
    if (matches.length === 0) {
        results.innerHTML = '<div class="dictionary-item"><p style="font-size: 32px; text-align: center; padding: 40px;">Aucun résultat trouvé / Не са намерени резултати</p></div>';
        return;
    }
    
    displayDictionaryWords(matches);
}

// Fallback audio button creator
function createFallbackAudioButton(word) {
    const button = document.createElement('button');
    button.className = 'audio-btn';
    button.innerHTML = '🔊';
    button.title = `Play audio for: ${word}`;
    
    // Check if audio might be available
    const hasAudio = checkIfAudioExists(word);
    if (!hasAudio) {
        button.disabled = true;
        button.innerHTML = '🔇';
        button.style.opacity = '0.5';
    }
    
    return button;
}

// Check if audio might exist for a word
function checkIfAudioExists(word) {
    if (!word || !appState.wordsBg || appState.wordsBg.length === 0) return false;
    
    const cleanWord = normalizeWordKey(word);
    return appState.wordsBg.includes(cleanWord);
}

// Play audio for a word (fallback function)
async function playAudioForWord(word) {
    if (window.audioManager) {
        return await window.audioManager.playAudio(word);
    }
    
    // Fallback to old method
    const audioFile = findAudioFile(word);
    if (audioFile) {
        try {
            const audio = new Audio(audioFile);
            await audio.play();
            return true;
        } catch (error) {
            console.error('Error playing audio:', error);
            return false;
        }
    }
    return false;
}

function displayDictionaryWords(words) {
    const results = document.getElementById('dictionary-results');
    results.innerHTML = '';

    if (!words || words.length === 0) {
        results.innerHTML = '<div class="dictionary-item"><p style="font-size: 24px; text-align: center;">Aucun mot trouvé / Не са намерени думи</p></div>';
        return;
    }

    // Show total count
    const totalCount = document.createElement('div');
    totalCount.className = 'dictionary-count';
    totalCount.innerHTML = `<p style="font-size: 18px; text-align: center; margin-bottom: 20px;">Total words found: ${words.length} / Намерени думи общо: ${words.length}</p>`;
    results.appendChild(totalCount);

    // Reuse the dedicated helper so audio buttons are wired correctly
    words.forEach((word) => {
        if (!word || !word.word) return;
        const item = createDictionaryItemElement(word);
        results.appendChild(item);
    });
}

function createDictionaryItemElement(word) {
    const item = document.createElement('div');
    item.className = 'dictionary-item';

    // Header with word text + audio button element (keep event listeners intact)
    const header = document.createElement('div');
    header.className = 'word-header';

    const wordText = document.createElement('div');
    wordText.className = 'word-text';
    wordText.textContent = word.word;
    header.appendChild(wordText);

    const audioButton = window.createAudioButton
        ? window.createAudioButton(word.word)
        : createFallbackAudioButton(word.word);
    header.appendChild(audioButton);

    item.appendChild(header);

    // Extra info (type, translations, explanations)
    if (word.type) {
        const p = document.createElement('p');
        p.style.cssText = 'font-size: 20px; margin: 10px 0;';
        p.innerHTML = `<strong>Type / Тип:</strong> ${word.type}`;
        item.appendChild(p);
    }

    if (word.frenchTranslation) {
        const p = document.createElement('p');
        p.style.cssText = 'font-size: 24px; margin: 10px 0; color: var(--accent-color); font-weight: bold;';
        p.innerHTML = `<strong>Traduction / Превод:</strong> ${word.frenchTranslation}`;
        item.appendChild(p);
    }

    if (word.frenchExplanation) {
        const p = document.createElement('p');
        p.style.cssText = 'font-size: 20px; font-style: italic; color: #555; margin: 10px 0; line-height: 1.6;';
        p.innerHTML = `<em>${word.frenchExplanation}</em>`;
        item.appendChild(p);
    }

    if (word.bgExplanation) {
        const p = document.createElement('p');
        p.style.cssText = 'font-size: 20px; margin: 10px 0; line-height: 1.6;';
        p.innerHTML = `<strong>BG:</strong> ${word.bgExplanation}`;
        item.appendChild(p);
    }

    return item;
}

function assetUrl(relativePath) {
    const clean = String(relativePath || '').replace(/^\/+/, '');
    return new URL(clean, window.location.href).toString();
}

function findAudioFile(word) {
    if (!word || !appState.wordsBg || appState.wordsBg.length === 0) return null;

    // Clean the word for matching
    const cleanWord = word.toLowerCase().trim();
        
    console.log(`Looking for audio file for: "${word}" -> clean: "${cleanWord}"`);
        
    // Try exact match first
    const exactMatch = appState.wordsBg.find(w => 
        w && w.toLowerCase().trim() === cleanWord
    );
    if (exactMatch) {
        console.log(`Found exact match: ${exactMatch}`);
        return assetUrl(`audiofiles/${encodeURIComponent(exactMatch.trim())}.wav`);
    }
        
    // Try partial match (first word)
    const firstWord = cleanWord.split(/\s+/)[0];
    const partialMatch = appState.wordsBg.find(w => 
        w && w.toLowerCase().trim().includes(firstWord)
    );
    if (partialMatch) {
        console.log(`Found partial match: ${partialMatch}`);
        return assetUrl(`audiofiles/${encodeURIComponent(partialMatch.trim())}.wav`);
    }
        
    // Try to match if the word contains any of the wordsBg
    const containsMatch = appState.wordsBg.find(w => {
        if (!w) return false;
        const wClean = w.toLowerCase().trim();
        return wClean.includes(cleanWord) || cleanWord.includes(wClean);
    });
    if (containsMatch) {
        console.log(`Found contains match: ${containsMatch}`);
        return assetUrl(`audiofiles/${encodeURIComponent(containsMatch.trim())}.wav`);
    }
        
    console.log(`No audio file found for: ${word}`);
    return null;
}

function tryPlayAudio(word) {
    if (!word) return;
    
    // Try multiple variations
    const variations = [
        word.trim(),
        word.toLowerCase().trim(),
        word.trim().replace(/\s+/g, ' '),
        word.trim().replace(/\s+/g, ''),
        word.split(/\s+/)[0].trim(),
        word.split(/\s+/)[0].toLowerCase().trim()
    ];
    
    let found = false;
    
    for (const variant of variations) {
        if (!variant) continue;
        
        // Check if word exists in wordsBg
        const match = appState.wordsBg.find(w => {
            if (!w) return false;
            const normalized = normalizeWordKey(w);
            return normalized === normalizeWordKey(variant) || 
                   normalized.includes(normalizeWordKey(variant)) ||
                   normalizeWordKey(variant).includes(normalized);
        });
        
        if (match) {
            playAudio({
                mp3: assetUrl(`audiofiles/${encodeURIComponent(match.trim())}.mp3`),
                wav: assetUrl(`audiofiles/${encodeURIComponent(match.trim())}.wav`)
            });
            found = true;
            break;
        }
    }
    
    if (!found) {
        playAudio({
            mp3: assetUrl(`audiofiles/${encodeURIComponent(word.trim())}.mp3`),
            wav: assetUrl(`audiofiles/${encodeURIComponent(word.trim())}.wav`)
        });
    }
}

window.tryPlayAudio = tryPlayAudio;

const audioCache = new Map();
let currentAudio = null;

function getCachedAudio(audioPath) {
    const key = String(audioPath);
    if (!audioCache.has(key)) {
        const audio = new Audio(key);
        audio.preload = 'auto';
        audioCache.set(key, audio);
    }
    return audioCache.get(key);
}

function playAudio(audioPath) {
    const candidates = [];

    if (audioPath && typeof audioPath === 'object') {
        if (audioPath.mp3) candidates.push(String(audioPath.mp3));
        if (audioPath.wav) candidates.push(String(audioPath.wav));
    } else if (audioPath) {
        candidates.push(String(audioPath));
    }

    // Try multiple path formats
    const pathsToTry = candidates.flatMap(p => ([
        p,
        p.replace(/\s+/g, ' '), // Normalize spaces
        p.replace(/\s/g, ''), // Remove all spaces
        p.replace(/^\/audiofiles\//, '/audiofiles/').toLowerCase(),
        p.replace(/^\/audiofiles\//, '/audiofiles/').replace(/^\w/, c => c.toUpperCase()) // Try capitalized
    ]));
    
    let tried = 0;
    
    function tryNext() {
        if (tried >= pathsToTry.length) {
            console.warn('Audio not found:', audioPath);
            return;
        }
        
        const path = pathsToTry[tried];
        const audio = getCachedAudio(path);

        if (currentAudio && currentAudio !== audio) {
            try {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            } catch {
                // ignore
            }
        }
        currentAudio = audio;
        
        audio.play().then(() => {
            // Success!
        }).catch(() => {
            tried++;
            if (tried < pathsToTry.length) {
                tryNext();
            } else {
                // Try direct word match
                const fromString = typeof audioPath === 'string' ? audioPath : (audioPath?.mp3 || audioPath?.wav || '');
                const word = String(fromString).match(/\/([^/]+)\.(wav|mp3)$/i)?.[1];
                if (word) {
                    const directMp3 = assetUrl(`audiofiles/${encodeURIComponent(word)}.mp3`);
                    const directWav = assetUrl(`audiofiles/${encodeURIComponent(word)}.wav`);
                    const directAudio = getCachedAudio(directMp3);
                    directAudio.play().catch(() => {
                        const directAudio2 = getCachedAudio(directWav);
                        directAudio2.play().catch(() => {
                            console.warn('All audio attempts failed for:', word);
                        });
                    });
                }
            }
        });
    }
    
    tryNext();
}

// Games
function setupGames() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.classList.add('clickable');
        card.addEventListener('click', () => {
            const gameType = card.dataset.game;
            openGame(gameType);
        });
    });
}

function openGame(gameType) {
    appState.currentGame = gameType;
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    switch(gameType) {
        case 'match':
            startMatchGame(gameArea);
            break;
        case 'flashcards':
            startFlashcardGame(gameArea);
            break;
        case 'wordsearch':
            startWordSearchGame(gameArea);
            break;
        case 'typing':
            startTypingGame(gameArea);
            break;
        case 'alphabet':
            startAlphabetGame(gameArea);
            break;
        case 'multiplechoice':
            startMultipleChoiceGame(gameArea);
            break;
        case 'hangman':
            startHangmanGame(gameArea);
            break;
    }
    
    document.getElementById('game-modal').classList.add('active');
}

function startMatchGame(container) {
    const words = appState.dictionary.slice(0, 8);
    const pairs = [];
    
    words.forEach(word => {
        pairs.push({ type: 'bg', text: word.word, match: word.frenchTranslation, id: word.word });
        pairs.push({ type: 'fr', text: word.frenchTranslation, match: word.word, id: word.word });
    });
    
    // Shuffle
    pairs.sort(() => Math.random() - 0.5);
    
    container.innerHTML = '<h2 style="font-size: 42px; margin-bottom: 20px;">Match des mots / Съвпадане на думи</h2><div class="match-game" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 20px;"></div>';
    const gameDiv = container.querySelector('.match-game');
    
    let selected = [];
    let matched = 0;
    let connectionColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    let colorIndex = 0;
    const connections = new Map();
    
    pairs.forEach((pair, index) => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.dataset.index = index;
        card.dataset.type = pair.type;
        card.dataset.match = pair.match;
        card.dataset.id = pair.id;
        card.textContent = pair.text;
        card.style.cssText = 'padding: 25px; background: var(--card-bg); border: 4px solid var(--border-color); border-radius: 12px; font-size: 24px; text-align: center; cursor: pointer; transition: all 0.2s ease; font-weight: bold;';
        
        card.addEventListener('click', () => {
            if (card.classList.contains('matched') || card.classList.contains('selected')) return;
            
            card.classList.add('selected');
            card.style.borderColor = 'var(--primary-color)';
            card.style.background = 'rgba(76, 175, 80, 0.2)';
            selected.push(card);
            
            if (selected.length === 2) {
                const [card1, card2] = selected;
                const isMatch = (card1.dataset.type !== card2.dataset.type) && 
                               (card1.dataset.id === card2.dataset.id);
                
                setTimeout(() => {
                    if (isMatch) {
                        const color = connectionColors[colorIndex % connectionColors.length];
                        colorIndex++;
                        
                        card1.classList.remove('selected');
                        card2.classList.remove('selected');
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        card1.style.borderColor = color;
                        card2.style.borderColor = color;
                        card1.style.background = color;
                        card2.style.background = color;
                        card1.style.color = 'white';
                        card2.style.color = 'white';
                        
                        connections.set(card1.dataset.id, color);
                        matched += 2;
                        
                        if (matched === pairs.length) {
                            container.innerHTML += '<div class="test-result success" style="font-size: 32px; padding: 20px; margin-top: 20px;">Bravo! Tous les mots sont appariés! / Браво! Всички думи са съвпаднали!</div>';
                            appState.progress.gamesPlayed++;
                            appState.progress.totalScore += 15;
                            const matchWins = parseInt(localStorage.getItem('matchWins')) || 0;
                            localStorage.setItem('matchWins', (matchWins + 1).toString());
                            const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                            gameTypes.add('match');
                            localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                            saveProgress();
                            updateStats();
                            checkForNewAchievements();
                        }
                    } else {
                        card1.classList.remove('selected');
                        card2.classList.remove('selected');
                        card1.style.borderColor = 'var(--border-color)';
                        card2.style.borderColor = 'var(--border-color)';
                        card1.style.background = 'var(--card-bg)';
                        card2.style.background = 'var(--card-bg)';
                        card1.style.color = '';
                        card2.style.color = '';
                    }
                    selected = [];
                }, 1000);
            }
        });
        
        gameDiv.appendChild(card);
    });
}

function startFlashcardGame(container) {
    const wordsSource = appState.dictionary.filter(w => w.word && w.frenchTranslation);
    const words = getGameWordSet('flashcards', wordsSource, 10);
    if (words.length === 0) {
        container.innerHTML = '<p style="font-size: 28px; padding: 30px;">Aucun mot disponible / Няма налични думи</p>';
        return;
    }
    
    let currentIndex = 0;
    let cardsCompleted = 0;
    
    function renderFlashcard() {
        container.innerHTML = `
            <h2 style="font-size: 42px; margin-bottom: 30px;">Cartes mémoire / Карти за памет</h2>
            <div class="flashcard-container" style="perspective: 1000px; margin: 30px auto; width: 400px; height: 250px;">
                <div class="flashcard" id="flashcard" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s;">
                    <div class="flashcard-front" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.2);">
                        <span id="flashcard-text">${words[currentIndex].word}</span>
                    </div>
                    <div class="flashcard-back" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: linear-gradient(135deg, #f093fb, #f5576c); color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; transform: rotateY(180deg); padding: 25px; text-align: center; border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.2);">
                        <div>
                            <div style="font-size: 28px; font-weight: bold; margin-bottom: 15px;">${words[currentIndex].frenchTranslation}</div>
                            <div style="font-size: 18px; opacity: 0.9;">${words[currentIndex].frenchExplanation || ''}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button class="btn btn-primary" id="flip-card" style="margin: 10px;">Retourner / Обърни</button>
                <button class="btn btn-primary" id="next-card" style="margin: 10px;">Suivant / Следващ</button>
            </div>
            <div style="text-align: center; margin-top: 25px; font-size: 24px; font-weight: bold;">
                <p>Carte ${currentIndex + 1} / ${words.length}</p>
            </div>
        `;
        
        const flashcard = container.querySelector('#flashcard');
        let flipped = false;
        
        container.querySelector('#flip-card').addEventListener('click', () => {
            flipped = !flipped;
            flashcard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
        });
        
        container.querySelector('#next-card').addEventListener('click', () => {
            cardsCompleted++;
            currentIndex = (currentIndex + 1) % words.length;
            flipped = false;
            flashcard.style.transform = 'rotateY(0deg)';
            
            // Update card content
            setTimeout(() => {
                container.querySelector('#flashcard-text').textContent = words[currentIndex].word;
                const backDiv = container.querySelector('.flashcard-back');
                if (backDiv) {
                    backDiv.innerHTML = `
                        <div>
                            <div style="font-size: 28px; font-weight: bold; margin-bottom: 15px;">${words[currentIndex].frenchTranslation}</div>
                            <div style="font-size: 18px; opacity: 0.9;">${words[currentIndex].frenchExplanation || ''}</div>
                        </div>
                    `;
                }
                container.querySelector('p').textContent = `Carte ${currentIndex + 1} / ${words.length}`;
            }, 300);
            
            if (currentIndex === 0 && cardsCompleted >= words.length) {
                setTimeout(() => {
                    container.innerHTML += '<div class="test-result success" style="margin-top: 30px; font-size: 32px;">Félicitations! Vous avez terminé toutes les cartes! / Поздравления! Завършихте всички карти!</div>';
                    appState.progress.gamesPlayed++;
                    appState.progress.totalScore += 20;
                    const flashcardsCompleted = parseInt(localStorage.getItem('flashcardsCompleted')) || 0;
                    localStorage.setItem('flashcardsCompleted', (flashcardsCompleted + words.length).toString());
                    const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                    gameTypes.add('flashcards');
                    localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                    saveProgress();
                    updateStats();
                    checkForNewAchievements();
                }, 500);
            }
        });
    }
    
    renderFlashcard();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

function getGameWordSet(gameKey, sourceWords, count) {
    const source = Array.isArray(sourceWords) ? sourceWords : [];
    if (!appState._gameWordPools) appState._gameWordPools = {};

    const pool = appState._gameWordPools[gameKey];
    const needsReset =
        !pool ||
        pool.sourceLen !== source.length ||
        pool.position + count > pool.order.length;

    if (needsReset) {
        const order = source.map((_, idx) => idx);
        shuffleArray(order);
        appState._gameWordPools[gameKey] = {
            order,
            position: 0,
            sourceLen: source.length
        };
    }

    const activePool = appState._gameWordPools[gameKey];
    const take = Math.min(count, source.length);
    const picked = activePool.order
        .slice(activePool.position, activePool.position + take)
        .map(i => source[i])
        .filter(Boolean);

    activePool.position += picked.length;
    return picked;
}

function startWordSearchGame(container) {
    const words = appState.dictionary.filter(w => w && w.word && w.word.length >= 4 && w.word.length <= 10).slice(0, 8);
    if (words.length === 0) {
        container.innerHTML = '<p style="font-size: 28px; padding: 30px;">Aucun mot disponible / Няма налични думи</p>';
        return;
    }
    
    // Shuffle words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const gridSize = 12;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    const selectedWords = shuffledWords.map(w => w.word.toUpperCase().replace(/\s+/g, ''));
    const foundWords = new Set();
    
    // Place words in grid
    const placedWords = [];
    selectedWords.forEach((word, idx) => {
        if (word.length > gridSize) return;
        let attempts = 0;
        let placed = false;
        
        while (!placed && attempts < 50) {
            const direction = Math.floor(Math.random() * 4); // 0=horizontal, 1=vertical, 2=diagonal-down, 3=diagonal-up
            const row = Math.floor(Math.random() * (gridSize - word.length));
            const col = Math.floor(Math.random() * (gridSize - word.length));
            
            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
                let r = row, c = col;
                if (direction === 0) c = col + i; // horizontal
                else if (direction === 1) r = row + i; // vertical
                else if (direction === 2) { r = row + i; c = col + i; } // diagonal down
                else if (direction === 3) { r = row - i; c = col + i; } // diagonal up
                
                if (r < 0 || r >= gridSize || c < 0 || c >= gridSize || (grid[r][c] && grid[r][c] !== word[i])) {
                    canPlace = false;
                    break;
                }
            }
            
            if (canPlace) {
                const wordData = { word, row, col, direction, found: false };
                for (let i = 0; i < word.length; i++) {
                    let r = row, c = col;
                    if (direction === 0) c = col + i;
                    else if (direction === 1) r = row + i;
                    else if (direction === 2) { r = row + i; c = col + i; }
                    else if (direction === 3) { r = row - i; c = col + i; }
                    grid[r][c] = word[i];
                }
                placedWords.push(wordData);
                placed = true;
            }
            attempts++;
        }
    });
    
    // Fill empty cells with random letters
    const letters = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!grid[r][c]) {
                grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
    
    let isDragging = false;
    let startCell = null;
    let selectedCells = [];
    
    container.innerHTML = `
        <h2 style="font-size: 42px; margin-bottom: 20px;">Mots cachés / Скрити думи</h2>
        <div style="display: flex; gap: 30px; align-items: flex-start; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
                <div id="wordsearch-grid" style="display: grid; grid-template-columns: repeat(${gridSize}, 50px); gap: 4px; padding: 25px; background: var(--card-bg); border: 4px solid var(--border-color); border-radius: 15px; margin: 0 auto; max-width: fit-content;"></div>
            </div>
            <div style="flex: 0 0 300px; background: var(--card-bg); border: 4px solid var(--border-color); border-radius: 15px; padding: 25px;">
                <h3 style="font-size: 32px; margin-bottom: 20px;">Mots à trouver / Думи за намиране:</h3>
                <div id="words-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
                <div style="margin-top: 25px; font-size: 28px; font-weight: bold; text-align: center;">
                    Trouvés: <span id="words-found">0</span> / ${selectedWords.length}
                </div>
            </div>
        </div>
        <div id="wordsearch-result" style="text-align: center; margin-top: 25px; font-size: 28px; font-weight: bold;"></div>
    `;
    
    // Create word list with checkmarks
    const wordsList = container.querySelector('#words-list');
    selectedWords.forEach((word, idx) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.dataset.word = word;
        wordItem.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; background: white; border: 2px solid var(--border-color); border-radius: 8px; font-size: 20px;';
        wordItem.innerHTML = `<span class="checkmark" style="font-size: 24px; color: #ccc;">☐</span><span class="word-text">${word}</span>`;
        wordsList.appendChild(wordItem);
    });
    
    const gridContainer = container.querySelector('#wordsearch-grid');
    
    grid.forEach((row, r) => {
        row.forEach((letter, c) => {
            const cell = document.createElement('div');
            cell.className = 'wordsearch-cell';
            cell.textContent = letter;
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.style.cssText = 'width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; cursor: crosshair; background: white; border: 2px solid var(--border-color); border-radius: 5px; transition: all 0.1s ease; user-select: none;';
            
            cell.addEventListener('mousedown', (e) => {
                if (cell.classList.contains('found')) return;
                isDragging = true;
                startCell = {row: r, col: c, element: cell};
                selectedCells = [{row: r, col: c, element: cell}];
                cell.classList.add('selected');
                cell.style.background = 'var(--primary-color)';
                cell.style.color = 'white';
                e.preventDefault();
            });
            
            cell.addEventListener('mouseenter', (e) => {
                if (isDragging && !cell.classList.contains('found')) {
                    if (!selectedCells.find(sc => sc.row === r && sc.col === c)) {
                        selectedCells.push({row: r, col: c, element: cell});
                        cell.classList.add('selected');
                        cell.style.background = 'var(--primary-color)';
                        cell.style.color = 'white';
                    }
                }
            });
            
            cell.addEventListener('mouseup', () => {
                if (isDragging && selectedCells.length >= 2) {
                    checkWordSelection(selectedCells, placedWords, foundWords, selectedWords, container);
                }
                isDragging = false;
                selectedCells.forEach(sc => {
                    if (!sc.element.classList.contains('found')) {
                        sc.element.classList.remove('selected');
                        sc.element.style.background = 'white';
                        sc.element.style.color = 'black';
                    }
                });
                selectedCells = [];
            });
            
            gridContainer.appendChild(cell);
        });
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            selectedCells.forEach(sc => {
                if (!sc.element.classList.contains('found')) {
                    sc.element.classList.remove('selected');
                    sc.element.style.background = 'white';
                    sc.element.style.color = 'black';
                }
            });
            selectedCells = [];
        }
    });

    /* Touch support for wordsearch on phones */
    function getCellFromTouch(e) {
        const t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
        if (!t) return null;
        const el = document.elementFromPoint(t.clientX, t.clientY);
        return el && el.classList.contains('wordsearch-cell') ? el : null;
    }
    gridContainer.addEventListener('touchstart', (e) => {
        const cell = getCellFromTouch(e);
        if (!cell || cell.classList.contains('found')) return;
        const r = parseInt(cell.dataset.row, 10), c = parseInt(cell.dataset.col, 10);
        e.preventDefault();
        isDragging = true;
        startCell = { row: r, col: c, element: cell };
        selectedCells = [{ row: r, col: c, element: cell }];
        cell.classList.add('selected');
        cell.style.background = 'var(--primary-color)';
        cell.style.color = 'white';
    }, { passive: false });
    gridContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const cell = getCellFromTouch(e);
        if (!cell || cell.classList.contains('found')) return;
        const r = parseInt(cell.dataset.row, 10), c = parseInt(cell.dataset.col, 10);
        if (!selectedCells.find(sc => sc.row === r && sc.col === c)) {
            selectedCells.push({ row: r, col: c, element: cell });
            cell.classList.add('selected');
            cell.style.background = 'var(--primary-color)';
            cell.style.color = 'white';
        }
        e.preventDefault();
    }, { passive: false });
    gridContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        if (selectedCells.length >= 2) {
            checkWordSelection(selectedCells, placedWords, foundWords, selectedWords, container);
        }
        isDragging = false;
        selectedCells.forEach(sc => {
            if (!sc.element.classList.contains('found')) {
                sc.element.classList.remove('selected');
                sc.element.style.background = 'white';
                sc.element.style.color = 'black';
            }
        });
        selectedCells = [];
    }, { passive: true });
    
    function checkWordSelection(selected, placed, found, wordList, cont) {
        if (selected.length < 2) return;
        
        // Get cells in order
        const sorted = [...selected].sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
        });
        
        const selectedWord = sorted.map(s => grid[s.row][s.col]).join('');
        const reversed = selectedWord.split('').reverse().join('');
        
        placed.forEach(wordData => {
            if (wordData.found) return;
            
            if (selectedWord === wordData.word || reversed === wordData.word) {
                // Verify cells are in correct positions
                const cellsInOrder = [];
                for (let i = 0; i < wordData.word.length; i++) {
                    let r = wordData.row, c = wordData.col;
                    if (wordData.direction === 0) c = wordData.col + i;
                    else if (wordData.direction === 1) r = wordData.row + i;
                    else if (wordData.direction === 2) { r = wordData.row + i; c = wordData.col + i; }
                    else if (wordData.direction === 3) { r = wordData.row - i; c = wordData.col + i; }
                    cellsInOrder.push({row: r, col: c});
                }
                
                const isMatch = selected.length === wordData.word.length && 
                    selected.every((sel, idx) => {
                        const expected = cellsInOrder[idx];
                        return sel.row === expected.row && sel.col === expected.col;
                    });
                
                if (isMatch) {
                    wordData.found = true;
                    found.add(wordData.word);
                    
                    selected.forEach(s => {
                        s.element.classList.remove('selected');
                        s.element.classList.add('found');
                        s.element.style.background = 'var(--primary-color)';
                        s.element.style.color = 'white';
                    });
                    
                    // Update checkmark
                    const wordItem = cont.querySelector(`[data-word="${wordData.word}"]`);
                    if (wordItem) {
                        wordItem.querySelector('.checkmark').textContent = '✓';
                        wordItem.querySelector('.checkmark').style.color = 'var(--primary-color)';
                    }
                    
                    const foundCount = found.size;
                    cont.querySelector('#words-found').textContent = foundCount;
                    
                    if (foundCount === wordList.length) {
                        cont.querySelector('#wordsearch-result').innerHTML = '<div class="test-result success" style="font-size: 32px; padding: 20px;">Bravo! Tous les mots trouvés! / Браво! Всички думи намерени!</div>';
                        appState.progress.gamesPlayed++;
                        appState.progress.totalScore += 25;
                        const wordsearchFound = parseInt(localStorage.getItem('wordsearchFound')) || 0;
                        localStorage.setItem('wordsearchFound', (wordsearchFound + foundCount).toString());
                        const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                        gameTypes.add('wordsearch');
                        localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                        saveProgress();
                        updateStats();
                        checkForNewAchievements();
                    }
                }
            }
        });
    }
}

function startTypingGame(container) {
    const words = appState.dictionary.filter(w => w.word && w.frenchTranslation).slice(0, 10);
    if (words.length === 0) {
        container.innerHTML = '<p style="font-size: 28px; padding: 30px;">Aucun mot disponible / Няма налични думи</p>';
        return;
    }
    
    let currentWordIndex = 0;
    let score = 0;
    
    container.innerHTML = `
        <h2 style="font-size: 42px; margin-bottom: 40px;">Frappe rapide / Бързо писане</h2>
        <div style="text-align: center; margin: 40px 0;">
            <div style="font-size: 52px; font-weight: bold; margin-bottom: 40px; color: var(--primary-color); padding: 30px; background: var(--card-bg); border: 6px solid var(--border-color); border-radius: 20px; min-height: 120px; display: flex; align-items: center; justify-content: center;">
                ${words[currentWordIndex].frenchTranslation}
            </div>
            <input type="text" id="typing-input" style="padding: 20px; font-size: 24px; border: 4px solid var(--primary-color); border-radius: 20px; width: 400px; text-align: center; font-family: inherit;" placeholder="Tapez le mot bulgare / Напишете българската дума" autocomplete="off">
            <div style="margin-top: 30px; font-size: 22px;">
                <p style="font-size: 28px; font-weight: bold;">Score: <span id="typing-score">0</span></p>
                <p>Mot ${currentWordIndex + 1} / ${words.length}</p>
            </div>
        </div>
    `;
    
    const input = container.querySelector('#typing-input');
    const scoreSpan = container.querySelector('#typing-score');
    
    input.focus();
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = words[currentWordIndex].word.toLowerCase().trim();
            
            if (userAnswer === correctAnswer) {
                score++;
                scoreSpan.textContent = score;
                appState.progress.totalScore += 5;
                input.value = '';
                input.style.borderColor = 'var(--primary-color)';
                
                currentWordIndex++;
                if (currentWordIndex >= words.length) {
                    container.innerHTML += '<div class="test-result success" style="margin-top: 30px;">Excellent! Score: ' + score + ' / Отлично! Резултат: ' + score + '</div>';
                    appState.progress.gamesPlayed++;
                    appState.progress.totalScore += score * 2;
                    const typingCorrect = parseInt(localStorage.getItem('typingCorrect')) || 0;
                    localStorage.setItem('typingCorrect', (typingCorrect + score).toString());
                    const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                    gameTypes.add('typing');
                    localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                    saveProgress();
                    updateStats();
                    checkForNewAchievements();
                } else {
                    container.querySelector('div[style*="font-size: 52px"]').textContent = words[currentWordIndex].frenchTranslation;
                    container.querySelector('p:last-child').textContent = `Mot ${currentWordIndex + 1} / ${words.length}`;
                    input.focus();
                }
            } else {
                input.style.borderColor = 'var(--danger-color)';
                input.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    input.style.borderColor = 'var(--primary-color)';
                    input.style.animation = '';
                    input.value = '';
                }, 500);
            }
        }
    });
}

function startAlphabetGame(container) {
    // Bulgarian alphabet (Cyrillic)
    const bulgarianAlphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь', 'Ю', 'Я'];
    
    // Shuffle alphabet
    const shuffled = [...bulgarianAlphabet].sort(() => Math.random() - 0.5);
    
    container.innerHTML = `
        <h2 style="font-size: 42px; margin-bottom: 20px;">Alphabet Bulgare / Българска азбука</h2>
        <p style="text-align: center; font-size: 22px; margin: 20px 0;">Glissez les lettres dans le bon ordre! / Плъзнете буквите в правилния ред!</p>
        <div class="alphabet-game">
            <div class="alphabet-container" id="alphabet-slots">
                ${bulgarianAlphabet.map((letter, index) => `
                    <div class="alphabet-slot" data-index="${index}" data-letter="${letter}"></div>
                `).join('')}
            </div>
            <div class="alphabet-container" id="alphabet-letters" style="margin-top: 30px;">
                ${shuffled.map(letter => `
                    <div class="alphabet-letter" draggable="true" data-letter="${letter}">${letter}</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button class="btn btn-primary" id="check-alphabet">Vérifier / Провери</button>
                <div id="alphabet-result" style="margin-top: 20px; font-size: 24px; font-weight: bold;"></div>
            </div>
        </div>
    `;
    
    const slots = container.querySelectorAll('.alphabet-slot');
    const lettersContainer = container.querySelector('#alphabet-letters');
    const letters = container.querySelectorAll('.alphabet-letter');
    
    let draggedElement = null;

    function attachDragHandlers(letter) {
        letter.addEventListener('dragstart', (e) => {
            draggedElement = letter;
            letter.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        letter.addEventListener('dragend', () => {
            letter.classList.remove('dragging');
        });
    }

    function createAlphabetLetter(letterValue) {
        const el = document.createElement('div');
        el.className = 'alphabet-letter';
        el.draggable = true;
        el.dataset.letter = letterValue;
        el.textContent = letterValue;
        attachDragHandlers(el);
        return el;
    }
    
    letters.forEach(letter => {
        attachDragHandlers(letter);
    });
    
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            slot.classList.add('drag-over');
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');

            if (!draggedElement) return;

            const nextLetter = draggedElement.dataset.letter;
            const prevLetter = slot.dataset.filled;
            if (prevLetter && lettersContainer) {
                lettersContainer.appendChild(createAlphabetLetter(prevLetter));
            }

            slot.dataset.filled = nextLetter;
            slot.classList.add('filled');
            slot.textContent = nextLetter;
            draggedElement.remove();
            draggedElement = null;
        });

        slot.addEventListener('click', () => {
            const filledLetter = slot.dataset.filled;
            if (!filledLetter || !lettersContainer) return;
            lettersContainer.appendChild(createAlphabetLetter(filledLetter));
            delete slot.dataset.filled;
            slot.classList.remove('filled');
            slot.textContent = '';
            slot.style.borderColor = '';
            slot.style.background = '';
        });
    });
    
    container.querySelector('#check-alphabet').addEventListener('click', () => {
        let correct = 0;
        let hasEmpty = false;
        
        slots.forEach((slot, index) => {
            const filledLetter = slot.dataset.filled;
            if (!filledLetter) {
                hasEmpty = true;
                slot.style.borderColor = 'var(--danger-color)';
                slot.style.background = 'rgba(244, 67, 54, 0.2)';
            } else if (filledLetter === bulgarianAlphabet[index]) {
                correct++;
                slot.style.borderColor = 'var(--primary-color)';
                slot.style.background = 'var(--primary-color)';
            } else {
                slot.style.borderColor = 'var(--danger-color)';
                slot.style.background = 'rgba(244, 67, 54, 0.2)';
            }
        });
        
        const resultDiv = container.querySelector('#alphabet-result');
        const percentage = Math.round((correct / bulgarianAlphabet.length) * 100);
        
        if (hasEmpty) {
            resultDiv.className = 'test-result error';
            resultDiv.innerHTML = 'Veuillez placer toutes les lettres! / Моля, поставете всички букви!';
        } else if (percentage === 100) {
            resultDiv.className = 'test-result success';
            resultDiv.innerHTML = 'Parfait! / Перфектно!';
            appState.progress.gamesPlayed++;
            appState.progress.totalScore += 20;
            const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
            gameTypes.add('alphabet');
            localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
            saveProgress();
            updateStats();
            checkForNewAchievements();
        } else {
            resultDiv.className = 'test-result error';
            resultDiv.innerHTML = `Correct: ${correct}/${bulgarianAlphabet.length} (${percentage}%) / Правилно: ${correct}/${bulgarianAlphabet.length} (${percentage}%)`;
        }
    });
}

function startMultipleChoiceGame(container) {
    const wordsSource = appState.dictionary.filter(w => w.word && w.frenchTranslation);
    const words = getGameWordSet('multiplechoice', wordsSource, 10);
    if (words.length === 0) {
        container.innerHTML = '<p style="font-size: 28px; padding: 30px;">Aucun mot disponible / Няма налични думи</p>';
        return;
    }
    
    let currentWordIndex = 0;
    let score = 0;
    
    function showQuestion() {
        const word = words[currentWordIndex];
        const allWords = appState.dictionary.filter(w => w.frenchTranslation && w.frenchTranslation !== word.frenchTranslation);
        const wrongOptions = [];
        while (wrongOptions.length < 2 && allWords.length > 0) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!wrongOptions.includes(randomWord.frenchTranslation)) {
                wrongOptions.push(randomWord.frenchTranslation);
            }
        }
        
        const options = [word.frenchTranslation, ...wrongOptions];
        options.sort(() => Math.random() - 0.5);
        
        container.innerHTML = `
            <h2 style="font-size: 42px; margin-bottom: 40px;">Choix multiples / Множествен избор</h2>
            <div style="text-align: center; margin: 40px 0;">
                <div style="font-size: 52px; font-weight: bold; margin-bottom: 40px; color: var(--primary-color); padding: 30px; background: var(--card-bg); border: 6px solid var(--border-color); border-radius: 20px; min-height: 120px; display: flex; align-items: center; justify-content: center;">
                    ${word.word}
                </div>
                <p style="font-size: 32px; margin-bottom: 30px; font-weight: bold;">Choisissez la traduction correcte / Изберете правилния превод:</p>
                <div class="multiple-choice-options" style="display: grid; gap: 25px; max-width: 800px; margin: 0 auto;">
                    ${options.map((opt, idx) => `
                        <button class="choice-option" data-answer="${opt === word.frenchTranslation}" style="padding: 30px; font-size: 32px; border: 5px solid var(--border-color); border-radius: 15px; background: var(--card-bg); cursor: pointer; transition: all 0.3s ease; font-weight: bold; min-height: 90px;">
                            ${String.fromCharCode(65 + idx)}) ${opt}
                        </button>
                    `).join('')}
                </div>
                <div style="margin-top: 40px; font-size: 28px;">
                    <p style="font-size: 36px; font-weight: bold;">Score: <span id="mc-score">${score}</span></p>
                    <p style="font-size: 28px;">Mot ${currentWordIndex + 1} / ${words.length}</p>
                </div>
                <div id="mc-result" style="margin-top: 30px; font-size: 32px; font-weight: bold;"></div>
            </div>
        `;
        
        container.querySelectorAll('.choice-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const isCorrect = this.dataset.answer === 'true';
                const allBtns = container.querySelectorAll('.choice-option');
                allBtns.forEach(b => b.disabled = true);
                
                if (isCorrect) {
                    this.style.background = 'var(--primary-color)';
                    this.style.color = 'white';
                    this.style.borderColor = 'var(--primary-color)';
                    score++;
                    container.querySelector('#mc-score').textContent = score;
                    appState.progress.totalScore += 5;
                    
                    setTimeout(() => {
                        currentWordIndex++;
                        if (currentWordIndex >= words.length) {
                            container.innerHTML += `
                                <div class="test-result success" style="margin-top: 40px; font-size: 36px;">
                                    Excellent! Score: ${score} / ${words.length} / Отлично! Резултат: ${score} / ${words.length}
                                </div>
                            `;
                            appState.progress.gamesPlayed++;
                            appState.progress.totalScore += score * 3;
                            const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                            gameTypes.add('multiplechoice');
                            localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                            saveProgress();
                            updateStats();
                            checkForNewAchievements();
                        } else {
                            showQuestion();
                        }
                    }, 1500);
                } else {
                    this.style.background = 'var(--danger-color)';
                    this.style.color = 'white';
                    this.style.borderColor = 'var(--danger-color)';
                    
                    // Show correct answer
                    allBtns.forEach(b => {
                        if (b.dataset.answer === 'true') {
                            b.style.background = 'var(--primary-color)';
                            b.style.color = 'white';
                            b.style.borderColor = 'var(--primary-color)';
                        }
                    });
                    
                    setTimeout(() => {
                        currentWordIndex++;
                        if (currentWordIndex >= words.length) {
                            container.innerHTML += `
                                <div class="test-result" style="margin-top: 40px; font-size: 36px; background: var(--secondary-color); color: white; padding: 40px;">
                                    Fin du jeu! Score final: ${score} / ${words.length} / Край на играта! Краен резултат: ${score} / ${words.length}
                                </div>
                            `;
                            appState.progress.gamesPlayed++;
                            appState.progress.totalScore += score * 2;
                            saveProgress();
                            updateStats();
                            checkForNewAchievements();
                        } else {
                            showQuestion();
                        }
                    }, 2000);
                }
            });
        });
    }
    
    showQuestion();
}

function startHangmanGame(container) {
    const words = appState.dictionary.filter(w => w.word && w.word.length <= 12 && w.word.length >= 4).slice(0, 10);
    if (words.length === 0) {
        container.innerHTML = '<p style="font-size: 28px; padding: 30px;">Aucun mot disponible / Няма налични думи</p>';
        return;
    }
    
    let currentWordIndex = 0;
    let score = 0;
    let wrongGuesses = 0;
    const maxWrong = 6;
    
    function startNewWord() {
        const word = words[currentWordIndex].word.toUpperCase().replace(/\s+/g, '');
        let guessed = new Set();
        wrongGuesses = 0;
        
        // Bulgarian alphabet
        const alphabet = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'.split('');
        
        function renderGame() {
            const display = word.split('').map(letter => guessed.has(letter) ? letter : '_').join(' ');
            const isWon = word.split('').every(letter => guessed.has(letter));
            const isLost = wrongGuesses >= maxWrong;
            
            let hangmanDisplay = '';
            const parts = ['O', '|', '/', '\\', '/', '\\'];
            for (let i = 0; i < Math.min(wrongGuesses, parts.length); i++) {
                hangmanDisplay += parts[i] + ' ';
            }
            
            container.innerHTML = `
                <h2 style="font-size: 42px; margin-bottom: 40px;">Pendu / Бесеница</h2>
                <div style="text-align: center; margin: 40px 0;">
                    <div style="font-size: 56px; font-weight: bold; letter-spacing: 10px; margin-bottom: 40px; color: var(--primary-color); padding: 30px; background: var(--card-bg); border: 6px solid var(--border-color); border-radius: 20px; min-height: 100px; display: flex; align-items: center; justify-content: center; color: var(--primary-color);">
                        ${display}
                    </div>
                    <p style="font-size: 32px; margin-bottom: 20px; font-weight: bold;">${words[currentWordIndex].frenchTranslation || 'Mot à deviner'}</p>
                    <div style="font-size: 48px; margin: 30px 0; min-height: 80px;">
                        ${hangmanDisplay || '😊'}
                    </div>
                    <p style="font-size: 28px; margin: 20px 0;">Erreurs: ${wrongGuesses} / ${maxWrong} / Грешки: ${wrongGuesses} / ${maxWrong}</p>
                    ${!isWon && !isLost ? `
                        <div class="hangman-alphabet" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 15px; max-width: 900px; margin: 30px auto;">
                            ${alphabet.map(letter => `
                                <button class="hangman-letter" draggable="false" data-letter="${letter}" style="padding: 20px; font-size: 32px; border: 4px solid var(--border-color); border-radius: 10px; background: ${guessed.has(letter) ? '#ccc' : 'var(--card-bg)'}; cursor: ${guessed.has(letter) ? 'not-allowed' : 'pointer'}; transition: all 0.3s ease; font-weight: bold; min-height: 70px; ${guessed.has(letter) ? 'opacity: 0.5;' : ''}">
                                    ${letter}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div style="margin-top: 40px; font-size: 28px;">
                        <p style="font-size: 36px; font-weight: bold;">Score: <span id="hangman-score">${score}</span></p>
                        <p style="font-size: 28px;">Mot ${currentWordIndex + 1} / ${words.length}</p>
                    </div>
                    <div id="hangman-result" style="margin-top: 30px; font-size: 32px; font-weight: bold;"></div>
                </div>
            `;
            
            if (isWon) {
                container.querySelector('#hangman-result').innerHTML = `
                    <div class="test-result success" style="font-size: 36px;">
                        Bravo! Le mot était: ${word} / Браво! Думата беше: ${word}
                    </div>
                `;
                score++;
                container.querySelector('#hangman-score').textContent = score;
                appState.progress.totalScore += 10;
                
                setTimeout(() => {
                    currentWordIndex++;
                    if (currentWordIndex >= words.length) {
                        container.innerHTML += `
                            <div class="test-result success" style="margin-top: 40px; font-size: 36px;">
                                Félicitations! Score final: ${score} / ${words.length} / Поздравления! Краен резултат: ${score} / ${words.length}
                            </div>
                        `;
                        appState.progress.gamesPlayed++;
                        appState.progress.totalScore += score * 5;
                        const hangmanWins = parseInt(localStorage.getItem('hangmanWins')) || 0;
                        localStorage.setItem('hangmanWins', (hangmanWins + score).toString());
                        const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                        gameTypes.add('hangman');
                        localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                        saveProgress();
                        updateStats();
                        checkForNewAchievements();
                    } else {
                        startNewWord();
                    }
                }, 2000);
            } else if (isLost) {
                container.querySelector('#hangman-result').innerHTML = `
                    <div class="test-result error" style="font-size: 36px; background: var(--danger-color); color: white; padding: 40px;">
                        Perdu! Le mot était: ${word} / Изгубено! Думата беше: ${word}
                    </div>
                `;
                
                setTimeout(() => {
                    currentWordIndex++;
                    if (currentWordIndex >= words.length) {
                        container.innerHTML += `
                            <div class="test-result" style="margin-top: 40px; font-size: 36px; background: var(--secondary-color); color: white; padding: 40px;">
                                Fin du jeu! Score final: ${score} / ${words.length} / Край на играта! Краен резултат: ${score} / ${words.length}
                            </div>
                        `;
                        appState.progress.gamesPlayed++;
                        appState.progress.totalScore += score * 2;
                        const gameTypes = new Set(JSON.parse(localStorage.getItem('gameTypesPlayed') || '[]'));
                        gameTypes.add('hangman'); // Fix: changed from 'multiplechoice' to 'hangman'
                        localStorage.setItem('gameTypesPlayed', JSON.stringify([...gameTypes]));
                        saveProgress();
                        updateStats();
                        checkForNewAchievements();
                    } else {
                        startNewWord();
                    }
                }, 2000);
            } else {
                container.querySelectorAll('.hangman-letter').forEach(btn => {
                    if (!guessed.has(btn.dataset.letter)) {
                        btn.addEventListener('click', function() {
                            const letter = this.dataset.letter;
                            guessed.add(letter);
                            btn.disabled = true;
                            btn.style.opacity = '0.5';
                            btn.style.background = '#ccc';
                            
                            if (!word.includes(letter)) {
                                wrongGuesses++;
                            }
                            
                            renderGame();
                        });
                    }
                });
            }
        }
        
        renderGame();
    }
    
    startNewWord();
}

// Settings
function setupSettings() {
    // Username
    document.getElementById('settings-username').value = appState.user.name;
    document.getElementById('save-username').addEventListener('click', () => {
        const newName = document.getElementById('settings-username').value;
        if (newName) {
            appState.user.name = newName;
            appState.user.nameBg = newName; // You could add translation here
            saveSettings();
            document.getElementById('user-name').textContent = newName;
            document.getElementById('user-name-bg').textContent = newName;
        }
    });
    
    // Font Size Slider
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    const applyFontSizeBtn = document.getElementById('apply-font-size');
    const resetFontSizeBtn = document.getElementById('reset-font-size');
    
    // Load saved font size
    const savedFontSize = appState.settings.fontSize || 1.0;
    fontSizeSlider.value = savedFontSize;
    updateFontSizeDisplay(savedFontSize);
    applyFontSize(savedFontSize);
    
    // Update display when slider moves (but don't apply yet)
    fontSizeSlider.addEventListener('input', (e) => {
        const fontSize = parseFloat(e.target.value);
        updateFontSizeDisplay(fontSize);
    });
    
    // Apply font size when button is clicked
    applyFontSizeBtn.addEventListener('click', () => {
        const fontSize = parseFloat(fontSizeSlider.value);
        applyFontSize(fontSize);
        appState.settings.fontSize = fontSize;
        saveSettings();
    });
    
    resetFontSizeBtn.addEventListener('click', () => {
        fontSizeSlider.value = 1.0;
        updateFontSizeDisplay(1.0);
        applyFontSize(1.0);
        appState.settings.fontSize = 1.0;
        saveSettings();
    });
    
    // Theme
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const theme = btn.dataset.theme;
            appState.settings.theme = theme;
            document.body.setAttribute('data-theme', theme);
            saveSettings();
        });
    });
    
    // Show Tutorial (from Settings - show tutorial screen and hide main app)
    const showTutorialBtn = document.getElementById('show-tutorial');
    if (showTutorialBtn) {
        showTutorialBtn.addEventListener('click', () => {
            const mainApp = document.getElementById('main-app');
            const tutorialScreen = document.getElementById('tutorial-screen');
            if (mainApp) mainApp.classList.remove('active');
            if (tutorialScreen) {
                tutorialScreen.classList.add('active');
                currentTutorialStep = 1;
                setupTutorial();
            }
        });
    }

    // Reset
    document.getElementById('reset-data').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr? / Сигурни ли сте?')) {
            localStorage.removeItem('bulgarche-progress');
            localStorage.removeItem('bulgarche-settings');
            localStorage.removeItem('skipTutorial');
            location.reload();
        }
    });
    
    // Apply saved theme
    if (appState.settings.theme) {
        document.body.setAttribute('data-theme', appState.settings.theme);
        document.querySelector(`[data-theme="${appState.settings.theme}"]`)?.classList.add('active');
    }
}

function updateFontSizeDisplay(size) {
    const percentage = Math.round(size * 100);
    document.getElementById('font-size-value').textContent = `${percentage}%`;
}

function applyFontSize(size) {
    // Set the CSS variable on the root element
    document.documentElement.style.setProperty('--font-size-multiplier', size);
    
    // Also directly apply to body for immediate effect
    const body = document.body;
    if (body) {
        const baseSize = 32; // Base font size in pixels
        body.style.fontSize = `${baseSize * size}px`;
    }
    
    // Apply to all text elements for comprehensive coverage
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, button, input, label, li, td, th');
    textElements.forEach(element => {
        const currentSize = window.getComputedStyle(element).fontSize;
        const currentSizeNum = parseFloat(currentSize);
        if (!isNaN(currentSizeNum)) {
            // Calculate the base size and apply multiplier
            const baseElementSize = currentSizeNum / (appState.settings.fontSize || 1.0);
            element.style.fontSize = `${baseElementSize * size}px`;
        }
    });
}

// Progress Management
function saveProgress() {
    localStorage.setItem('bulgarche-progress', JSON.stringify(appState.progress));
}

function loadProgress() {
    const saved = localStorage.getItem('bulgarche-progress');
    if (saved) {
        appState.progress = { ...appState.progress, ...JSON.parse(saved) };
    }
}

function saveSettings() {
    localStorage.setItem('bulgarche-settings', JSON.stringify({
        user: appState.user,
        settings: appState.settings
    }));
}

function loadSettings() {
    const saved = localStorage.getItem('bulgarche-settings');
    if (saved) {
        const data = JSON.parse(saved);
        appState.user = { ...appState.user, ...data.user };
        appState.settings = { ...appState.settings, ...data.settings };
        
        document.getElementById('user-name').textContent = appState.user.name;
        document.getElementById('user-name-bg').textContent = appState.user.nameBg;
        
        // Apply saved font size
        if (appState.settings.fontSize) {
            applyFontSize(appState.settings.fontSize);
        }
    }
}

function updateStats() {
    const lessonsRead = appState.progress.lessonsRead.length;
    const testsCompleted = appState.progress.testsCompleted.length;
    const gamesPlayed = appState.progress.gamesPlayed;
    const totalScore = appState.progress.totalScore || 0;
    
    // Calculate progress percentages
    const totalLessons = appState.lessons.length || 1;
    const totalTests = appState.tests.length || 1;
    const lessonsProgress = Math.min(100, Math.round((lessonsRead / totalLessons) * 100));
    const testsProgress = Math.min(100, Math.round((testsCompleted / totalTests) * 100));
    const gamesProgress = Math.min(100, gamesPlayed * 10); // 10% per game
    const scoreProgress = Math.min(100, Math.round((totalScore / 1000) * 100)); // 1000 = max score
    
    // Update numbers with circular progress
    updateStatWithCircle('lessons-read', lessonsRead, lessonsProgress, 0);
    updateStatWithCircle('tests-completed', testsCompleted, testsProgress, 1);
    updateStatWithCircle('games-played', gamesPlayed, gamesProgress, 2);
    updateStatWithCircle('total-score', totalScore, scoreProgress, 3);
    
    // Update streak display
    const streakEl = document.getElementById('home-streak');
    if (streakEl) {
        streakEl.textContent = appState.streak.currentStreak || 0;
    }
    
    checkForNewAchievements();
}

// Cache DOM elements for better performance
const statCache = {};

function updateStatWithCircle(id, value, percentage, index) {
    const statNumberEl = document.getElementById(id);
    if (!statNumberEl) return;
    
    // Use cached elements if available
    if (!statCache[id]) {
        statCache[id] = {
            parent: statNumberEl, // The stat-number element itself
            numberSpan: null,
            svg: null,
            circleProgress: null
        };
    }
    
    const cache = statCache[id];
    if (!cache.parent) return;
    
    // Ensure stat-number has position relative
    if (statNumberEl.style.position !== 'relative') {
        statNumberEl.style.position = 'relative';
    }
    
    // Update number value efficiently
    if (!cache.numberSpan) {
        statNumberEl.innerHTML = '';
        cache.numberSpan = document.createElement('span');
        cache.numberSpan.className = 'stat-number-value';
        statNumberEl.appendChild(cache.numberSpan);
    }
    cache.numberSpan.textContent = value;
    
    // Create or update SVG - append to stat-number, not parent
    if (!cache.svg) {
        // Determine size based on screen width
        const isMobile = window.innerWidth <= 768;
        const size = isMobile ? 100 : 120;
        const radius = isMobile ? 42 : 52;
        const center = size / 2;
        
        cache.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cache.svg.setAttribute('width', size.toString());
        cache.svg.setAttribute('height', size.toString());
        cache.svg.setAttribute('class', 'stat-progress-circle');
        cache.svg.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); width: ${size}px; height: ${size}px; z-index: 1; pointer-events: none;`;
        
        const centerX = center;
        const centerY = center;
        
        const strokeWidth = isMobile ? '7' : '8';
        
        const circleBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleBg.setAttribute('cx', centerX.toString());
        circleBg.setAttribute('cy', centerY.toString());
        circleBg.setAttribute('r', radius.toString());
        circleBg.setAttribute('fill', 'none');
        circleBg.setAttribute('stroke', 'rgba(255,255,255,0.25)');
        circleBg.setAttribute('stroke-width', strokeWidth);
        
        cache.circleProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cache.circleProgress.setAttribute('cx', centerX.toString());
        cache.circleProgress.setAttribute('cy', centerY.toString());
        cache.circleProgress.setAttribute('r', radius.toString());
        cache.circleProgress.setAttribute('fill', 'none');
        cache.circleProgress.setAttribute('stroke', 'white');
        cache.circleProgress.setAttribute('stroke-width', strokeWidth);
        cache.circleProgress.setAttribute('stroke-linecap', 'round');
        cache.circleProgress.style.transition = 'stroke-dashoffset 0.8s ease-out';
        
        // Store radius for later updates
        cache.radius = radius;
        
        cache.svg.appendChild(circleBg);
        cache.svg.appendChild(cache.circleProgress);
        statNumberEl.appendChild(cache.svg); // Append to stat-number, not parent
    }
    
    // Update progress efficiently
    const radius = cache.radius || 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    cache.circleProgress.setAttribute('stroke-dasharray', circumference);
    cache.circleProgress.setAttribute('stroke-dashoffset', offset);
}


// Make functions globally accessible
window.showPage = showPage;
window.playAudio = playAudio;

// Mascot Character System
const mascotGreetings = {
    morning: {
        fr: "Bonjour! Prêt pour une nouvelle journée d'apprentissage?",
        bg: "Добро утро! Готови ли сте за нов ден на учене?"
    },
    afternoon: {
        fr: "Bonjour! Continuons notre aventure linguistique!",
        bg: "Добър ден! Нека продължим нашето езиково приключение!"
    },
    evening: {
        fr: "Bonsoir! Une petite session avant de dormir?",
        bg: "Добър вечер! Малка сесия преди лягане?"
    },
    achievement: {
        fr: "Félicitations! Vous avez débloqué un nouveau succès!",
        bg: "Поздравления! Отключихте ново постижение!"
    },
    welcome: {
        fr: "Bonjour! Je suis Bulgarche, votre guide d'apprentissage!",
        bg: "Здравейте! Аз съм Българче, вашият водач в ученето!"
    }
};

function initializeMascot() {
    updateMascotGreeting();
    setupMascotInteractions();
}

function updateMascotGreeting() {
    const hour = new Date().getHours();
    let greetingType = 'welcome';
    
    if (hour >= 5 && hour < 12) {
        greetingType = 'morning';
    } else if (hour >= 12 && hour < 18) {
        greetingType = 'afternoon';
    } else if (hour >= 18 && hour < 22) {
        greetingType = 'evening';
    }
    
    const greeting = mascotGreetings[greetingType];
    const speechBubble = document.getElementById('mascot-speech');
    
    if (speechBubble) {
        speechBubble.querySelector('.greeting-fr').textContent = greeting.fr;
        speechBubble.querySelector('.greeting-bg').textContent = greeting.bg;
    }
}

function setupMascotInteractions() {
    const mascot = document.getElementById('mascot-character');
    
    if (mascot) {
        // Click interaction
        mascot.addEventListener('click', () => {
            showMascotMessage();
            animateMascot();
        });
        
        // Hover effects
        mascot.addEventListener('mouseenter', () => {
            mascot.style.cursor = 'pointer';
        });
    }
}

function showMascotMessage() {
    const messages = [
        { fr: "N'oubliez pas de pratiquer tous les jours!", bg: "Не забравяйте да практикувате всеки ден!" },
        { fr: "Chaque mot appris est une victoire!", bg: "Всяка научена дума е победа!" },
        { fr: "La persistance est la clé du succès!", bg: "Упорството е ключът към успеха!" },
        { fr: "Vous êtes incroyable! Continuez ainsi!", bg: "Невероятни сте! Продължавайте така!" },
        { fr: "Apprendre le bulgare, c'est facile avec moi!", bg: "Ученето на български е лесно с мен!" }
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const speechBubble = document.getElementById('mascot-speech');
    
    if (speechBubble) {
        speechBubble.querySelector('.greeting-fr').textContent = randomMessage.fr;
        speechBubble.querySelector('.greeting-bg').textContent = randomMessage.bg;
        
        // Add animation
        speechBubble.style.animation = 'none';
        setTimeout(() => {
            speechBubble.style.animation = 'speechBubbleFloat 0.5s ease-out';
        }, 10);
    }
}

function animateMascot() {
    const mascot = document.getElementById('mascot-character');
    if (mascot) {
        mascot.style.animation = 'none';
        setTimeout(() => {
            mascot.style.animation = 'mascotBounce 0.6s ease-out';
        }, 10);
    }
}

function showMascotAchievement() {
    const speechBubble = document.getElementById('mascot-speech');
    const achievementGreeting = mascotGreetings.achievement;
    
    if (speechBubble) {
        speechBubble.querySelector('.greeting-fr').textContent = achievementGreeting.fr;
        speechBubble.querySelector('.greeting-bg').textContent = achievementGreeting.bg;
        
        // Special animation for achievements
        speechBubble.style.animation = 'none';
        setTimeout(() => {
            speechBubble.style.animation = 'speechBubbleFloat 1s ease-out';
        }, 10);
    }
}

// Achievements System - Comprehensive list
const achievementsList = [
    // First steps
    { id: 'first_lesson', icon: '📖', title: 'Première leçon / Първи урок', description: 'Complétez votre première leçon / Завършете първия си урок', points: 10, category: 'lessons' },
    { id: 'first_test', icon: '✏️', title: 'Premier test / Първи тест', description: 'Réussissez votre premier test / Успейте първия си тест', points: 15, category: 'tests' },
    { id: 'first_game', icon: '🎮', title: 'Premier jeu / Първа игра', description: 'Jouez à votre premier jeu / Играйте първата си игра', points: 10, category: 'games' },
    { id: 'first_word', icon: '📖', title: 'Premier mot / Първа дума', description: 'Recherchez votre premier mot / Търсете първата си дума', points: 5, category: 'dictionary' },
    
    // Streaks
    { id: 'streak_3', icon: '🔥', title: 'Série de 3 jours / Серия от 3 дни', description: 'Utilisez l\'application 3 jours consécutifs / Използвайте приложението 3 поредни дни', points: 20, category: 'streak' },
    { id: 'streak_7', icon: '🔥🔥', title: 'Série de 7 jours / Серия от 7 дни', description: 'Utilisez l\'application 7 jours consécutifs / Използвайте приложението 7 поредни дни', points: 50, category: 'streak' },
    { id: 'streak_14', icon: '🔥🔥🔥', title: 'Série de 14 jours / Серия от 14 дни', description: 'Utilisez l\'application 14 jours consécutifs / Използвайте приложението 14 поредни дни', points: 75, category: 'streak' },
    { id: 'streak_30', icon: '🔥🔥🔥🔥', title: 'Série de 30 jours / Серия от 30 дни', description: 'Utilisez l\'application 30 jours consécutifs / Използвайте приложението 30 поредни дни', points: 100, category: 'streak' },
    { id: 'streak_100', icon: '🏆', title: 'Série de 100 jours / Серия от 100 дни', description: 'Utilisez l\'application 100 jours consécutifs / Използвайте приложението 100 поредни дни', points: 500, category: 'streak' },
    
    // Lessons milestones
    { id: 'lessons_5', icon: '📚', title: '5 leçons / 5 урока', description: 'Complétez 5 leçons / Завършете 5 урока', points: 20, category: 'lessons' },
    { id: 'lessons_10', icon: '📚📚', title: '10 leçons / 10 урока', description: 'Complétez 10 leçons / Завършете 10 урока', points: 30, category: 'lessons' },
    { id: 'lessons_25', icon: '📚📚📚', title: '25 leçons / 25 урока', description: 'Complétez 25 leçons / Завършете 25 урока', points: 75, category: 'lessons' },
    { id: 'lessons_50', icon: '📚📚📚📚', title: '50 leçons / 50 урока', description: 'Complétez 50 leçons / Завършете 50 урока', points: 150, category: 'lessons' },
    { id: 'lessons_100', icon: '📚📚📚📚📚', title: '100 leçons / 100 урока', description: 'Complétez 100 leçons / Завършете 100 урока', points: 300, category: 'lessons' },
    { id: 'lessons_all', icon: '👑', title: 'Maître des leçons / Майстор на уроците', description: 'Complétez toutes les leçons / Завършете всички уроци', points: 500, category: 'lessons' },
    
    // Tests achievements
    { id: 'tests_5', icon: '✏️', title: '5 tests / 5 теста', description: 'Réussissez 5 tests / Успейте 5 теста', points: 30, category: 'tests' },
    { id: 'tests_10', icon: '✏️✏️', title: '10 tests / 10 теста', description: 'Réussissez 10 tests / Успейте 10 теста', points: 60, category: 'tests' },
    { id: 'tests_25', icon: '✏️✏️✏️', title: '25 tests / 25 теста', description: 'Réussissez 25 tests / Успейте 25 теста', points: 150, category: 'tests' },
    { id: 'perfect_test', icon: '💯', title: 'Test parfait / Перфектен тест', description: 'Réussissez un test avec 100% / Успейте тест с 100%', points: 25, category: 'tests' },
    { id: 'perfect_tests_5', icon: '⭐', title: '5 tests parfaits / 5 перфектни теста', description: 'Réussissez 5 tests avec 100% / Успейте 5 теста с 100%', points: 100, category: 'tests' },
    { id: 'test_master', icon: '🎓', title: 'Maître des tests / Майстор на тестовете', description: 'Réussissez tous les tests / Успейте всички тестове', points: 300, category: 'tests' },
    
    // Games achievements
    { id: 'games_5', icon: '🎮', title: '5 jeux / 5 игри', description: 'Jouez à 5 jeux / Играйте 5 игри', points: 25, category: 'games' },
    { id: 'games_10', icon: '🎮🎮', title: '10 jeux / 10 игри', description: 'Jouez à 10 jeux / Играйте 10 игри', points: 50, category: 'games' },
    { id: 'games_50', icon: '🎮🎮🎮', title: '50 jeux / 50 игри', description: 'Jouez à 50 jeux / Играйте 50 игри', points: 200, category: 'games' },
    { id: 'games_100', icon: '🎮🎮🎮🎮', title: '100 jeux / 100 игри', description: 'Jouez à 100 jeux / Играйте 100 игри', points: 400, category: 'games' },
    { id: 'game_champion', icon: '🏆', title: 'Champion des jeux / Шампион на игрите', description: 'Jouez à tous les types de jeux / Играйте всички видове игри', points: 100, category: 'games' },
    { id: 'match_master', icon: '🎯', title: 'Maître du match / Майстор на съвпадането', description: 'Gagnez 10 parties de match / Спечелете 10 мача на съвпадане', points: 50, category: 'games' },
    { id: 'flashcard_master', icon: '🃏', title: 'Maître des cartes / Майстор на картите', description: 'Réussissez 50 cartes mémoire / Успейте 50 карти за памет', points: 75, category: 'games' },
    { id: 'typing_master', icon: '⌨️', title: 'Maître du clavier / Майстор на клавиатурата', description: 'Tapez 100 mots correctement / Напишете 100 думи правилно', points: 100, category: 'games' },
    { id: 'wordsearch_master', icon: '🔍', title: 'Maître des mots cachés / Майстор на скритите думи', description: 'Trouvez 50 mots cachés / Намерете 50 скрити думи', points: 80, category: 'games' },
    { id: 'hangman_master', icon: '🎭', title: 'Maître du pendu / Майстор на бесеницата', description: 'Gagnez 20 parties de pendu / Спечелете 20 мача на бесеница', points: 90, category: 'games' },
    
    // Dictionary achievements
    { id: 'word_10', icon: '📖', title: '10 mots / 10 думи', description: 'Recherchez 10 mots / Търсете 10 думи', points: 15, category: 'dictionary' },
    { id: 'word_50', icon: '📖📖', title: '50 mots / 50 думи', description: 'Recherchez 50 mots / Търсете 50 думи', points: 40, category: 'dictionary' },
    { id: 'word_100', icon: '📖📖📖', title: '100 mots / 100 думи', description: 'Recherchez 100 mots / Търсете 100 думи', points: 80, category: 'dictionary' },
    { id: 'word_500', icon: '📖📖📖📖', title: '500 mots / 500 думи', description: 'Recherchez 500 mots / Търсете 500 думи', points: 200, category: 'dictionary' },
    { id: 'word_master', icon: '📚', title: 'Maître des mots / Майстор на думи', description: 'Recherchez 1000 mots / Търсете 1000 думи', points: 400, category: 'dictionary' },
    
    // Score achievements
    { id: 'score_100', icon: '⭐', title: '100 points / 100 точки', description: 'Atteignez 100 points / Достигнете 100 точки', points: 10, category: 'score' },
    { id: 'score_500', icon: '⭐⭐', title: '500 points / 500 точки', description: 'Atteignez 500 points / Достигнете 500 точки', points: 25, category: 'score' },
    { id: 'score_1000', icon: '⭐⭐⭐', title: '1000 points / 1000 точки', description: 'Atteignez 1000 points / Достигнете 1000 точки', points: 50, category: 'score' },
    { id: 'score_5000', icon: '⭐⭐⭐⭐', title: '5000 points / 5000 точки', description: 'Atteignez 5000 points / Достигнете 5000 точки', points: 200, category: 'score' },
    { id: 'score_10000', icon: '👑', title: '10000 points / 10000 точки', description: 'Atteignez 10000 points / Достигнете 10000 точки', points: 500, category: 'score' },
    
    // Special achievements
    { id: 'daily_user', icon: '📅', title: 'Utilisateur quotidien / Ежедневен потребител', description: 'Utilisez l\'app 7 jours dans une semaine / Използвайте приложението 7 дни в една седмица', points: 100, category: 'special' },
    { id: 'early_bird', icon: '🌅', title: 'Lève-tôt / Ранен птах', description: 'Utilisez l\'app avant 7h / Използвайте приложението преди 7ч', points: 30, category: 'special' },
    { id: 'night_owl', icon: '🦉', title: 'Oiseau de nuit / Нощен птах', description: 'Utilisez l\'app après 22h / Използвайте приложението след 22ч', points: 30, category: 'special' },
    { id: 'dedicated', icon: '💎', title: 'Dévoué / Посветен', description: 'Utilisez l\'app 30 jours / Използвайте приложението 30 дни', points: 150, category: 'special' },
    { id: 'completionist', icon: '🎖️', title: 'Perfectionniste / Перфекционист', description: 'Débloquez tous les succès / Отключете всички постижения', points: 1000, category: 'special' }
];

function initializeAchievements() {
    appState.achievements.unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    appState.achievements.achievementPoints = parseInt(localStorage.getItem('achievementPoints')) || 0;
    appState.achievements.totalAchievements = appState.achievements.unlockedAchievements.length;
    updateAchievementsDisplay();
    checkForNewAchievements();
}

function checkForNewAchievements() {
    const newUnlocks = [];
    const lessonsCount = appState.progress.lessonsRead.length;
    const testsCount = appState.progress.testsCompleted.length;
    const gamesCount = appState.progress.gamesPlayed;
    const totalScore = appState.progress.totalScore || 0;
    const streak = appState.streak.currentStreak || 0;
    const wordsSearched = parseInt(localStorage.getItem('wordsSearched')) || 0;
    const hour = new Date().getHours();

    achievementsList.forEach(achievement => {
        if (!appState.achievements.unlockedAchievements.includes(achievement.id)) {
            let shouldUnlock = false;

            switch (achievement.id) {
                // First steps
                case 'first_lesson':
                    shouldUnlock = lessonsCount >= 1;
                    break;
                case 'first_test':
                    shouldUnlock = testsCount >= 1;
                    break;
                case 'first_game':
                    shouldUnlock = gamesCount >= 1;
                    break;
                case 'first_word':
                    shouldUnlock = wordsSearched >= 1;
                    break;
                
                // Streaks
                case 'streak_3':
                    shouldUnlock = streak >= 3;
                    break;
                case 'streak_7':
                    shouldUnlock = streak >= 7;
                    break;
                case 'streak_14':
                    shouldUnlock = streak >= 14;
                    break;
                case 'streak_30':
                    shouldUnlock = streak >= 30;
                    break;
                case 'streak_100':
                    shouldUnlock = streak >= 100;
                    break;
                
                // Lessons
                case 'lessons_5':
                    shouldUnlock = lessonsCount >= 5;
                    break;
                case 'lessons_10':
                    shouldUnlock = lessonsCount >= 10;
                    break;
                case 'lessons_25':
                    shouldUnlock = lessonsCount >= 25;
                    break;
                case 'lessons_50':
                    shouldUnlock = lessonsCount >= 50;
                    break;
                case 'lessons_100':
                    shouldUnlock = lessonsCount >= 100;
                    break;
                case 'lessons_all':
                    shouldUnlock = appState.lessons.length > 0 && lessonsCount >= appState.lessons.length;
                    break;
                
                // Tests
                case 'tests_5':
                    shouldUnlock = testsCount >= 5;
                    break;
                case 'tests_10':
                    shouldUnlock = testsCount >= 10;
                    break;
                case 'tests_25':
                    shouldUnlock = testsCount >= 25;
                    break;
                case 'perfect_test':
                    shouldUnlock = parseInt(localStorage.getItem('perfectTests')) >= 1;
                    break;
                case 'perfect_tests_5':
                    shouldUnlock = parseInt(localStorage.getItem('perfectTests')) >= 5;
                    break;
                case 'test_master':
                    shouldUnlock = appState.tests.length > 0 && testsCount >= appState.tests.length;
                    break;
                
                // Games
                case 'games_5':
                    shouldUnlock = gamesCount >= 5;
                    break;
                case 'games_10':
                    shouldUnlock = gamesCount >= 10;
                    break;
                case 'games_50':
                    shouldUnlock = gamesCount >= 50;
                    break;
                case 'games_100':
                    shouldUnlock = gamesCount >= 100;
                    break;
                case 'game_champion':
                    shouldUnlock = parseInt(localStorage.getItem('gameTypesPlayed')) >= 7;
                    break;
                case 'match_master':
                    shouldUnlock = parseInt(localStorage.getItem('matchWins')) >= 10;
                    break;
                case 'flashcard_master':
                    shouldUnlock = parseInt(localStorage.getItem('flashcardsCompleted')) >= 50;
                    break;
                case 'typing_master':
                    shouldUnlock = parseInt(localStorage.getItem('typingCorrect')) >= 100;
                    break;
                case 'wordsearch_master':
                    shouldUnlock = parseInt(localStorage.getItem('wordsearchFound')) >= 50;
                    break;
                case 'hangman_master':
                    shouldUnlock = parseInt(localStorage.getItem('hangmanWins')) >= 20;
                    break;
                
                // Dictionary
                case 'word_10':
                    shouldUnlock = wordsSearched >= 10;
                    break;
                case 'word_50':
                    shouldUnlock = wordsSearched >= 50;
                    break;
                case 'word_100':
                    shouldUnlock = wordsSearched >= 100;
                    break;
                case 'word_500':
                    shouldUnlock = wordsSearched >= 500;
                    break;
                case 'word_master':
                    shouldUnlock = wordsSearched >= 1000;
                    break;
                
                // Score
                case 'score_100':
                    shouldUnlock = totalScore >= 100;
                    break;
                case 'score_500':
                    shouldUnlock = totalScore >= 500;
                    break;
                case 'score_1000':
                    shouldUnlock = totalScore >= 1000;
                    break;
                case 'score_5000':
                    shouldUnlock = totalScore >= 5000;
                    break;
                case 'score_10000':
                    shouldUnlock = totalScore >= 10000;
                    break;
                
                // Special
                case 'early_bird':
                    shouldUnlock = hour >= 5 && hour < 7;
                    break;
                case 'night_owl':
                    shouldUnlock = hour >= 22 || hour < 6;
                    break;
                case 'dedicated':
                    shouldUnlock = parseInt(localStorage.getItem('daysActive')) >= 30;
                    break;
                case 'completionist':
                    shouldUnlock = appState.achievements.unlockedAchievements.length + 1 >= achievementsList.length;
                    break;
            }

            if (shouldUnlock) {
                appState.achievements.unlockedAchievements.push(achievement.id);
                appState.achievements.achievementPoints += achievement.points;
                newUnlocks.push(achievement);
            }
        }
    });

    // Save and display new achievements
    if (newUnlocks.length > 0) {
        localStorage.setItem('unlockedAchievements', JSON.stringify(appState.achievements.unlockedAchievements));
        localStorage.setItem('achievementPoints', appState.achievements.achievementPoints.toString());
        appState.achievements.totalAchievements = appState.achievements.unlockedAchievements.length;
        updateAchievementsDisplay();

        // Show notification for new achievements
        newUnlocks.forEach(achievement => {
            showAchievementNotification(achievement);
            showMascotAchievement();
        });
        
        saveProgress();
    }
}

function updateAchievementsDisplay() {
    document.getElementById('total-achievements').textContent = appState.achievements.totalAchievements;
    document.getElementById('achievement-points').textContent = appState.achievements.achievementPoints;

    const achievementsListEl = document.getElementById('achievements-list');
    achievementsListEl.innerHTML = '';

    achievementsList.forEach(achievement => {
        const isUnlocked = appState.achievements.unlockedAchievements.includes(achievement.id);
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        achievementCard.innerHTML = `
            <div class="achievement-card-icon">${achievement.icon}</div>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <div class="achievement-progress">
                <div class="achievement-progress-fill" style="width: ${isUnlocked ? '100%' : '0%'}"></div>
            </div>
            <div class="achievement-points-display">+${achievement.points} pts</div>
        `;

        achievementsListEl.appendChild(achievementCard);
    });
}

function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
            <strong>Succès débloqué! / Постижение отключено!</strong><br>
            ${achievement.title}
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), #45a049);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        max-width: 300px;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 15px;
    `;

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

// Profile Management
function initializeProfile() {
    updateProfileDisplay();
    setupProfileForm();
}

function updateProfileDisplay() {
    document.getElementById('profile-display-name').textContent = appState.user.name;
    document.getElementById('profile-display-name-bg').textContent = appState.user.nameBg;
    document.getElementById('user-level').textContent = appState.user.level;

    // Update stats
    document.getElementById('profile-lessons-completed').textContent = appState.progress.lessonsRead.length;
    document.getElementById('profile-tests-passed').textContent = appState.progress.testsCompleted.length;
    document.getElementById('profile-games-played').textContent = appState.progress.gamesPlayed;
    document.getElementById('profile-current-streak').textContent = `${appState.streak.currentStreak} jours / дни`;
}

function setupProfileForm() {
    document.getElementById('profile-name-input').value = appState.user.name;
    document.getElementById('profile-name-bg-input').value = appState.user.nameBg;
    document.getElementById('profile-language').value = appState.user.language;

    document.getElementById('save-profile').addEventListener('click', saveProfile);
}

function saveProfile() {
    const newName = document.getElementById('profile-name-input').value.trim();
    const newNameBg = document.getElementById('profile-name-bg-input').value.trim();
    const newLanguage = document.getElementById('profile-language').value;

    if (newName) appState.user.name = newName;
    if (newNameBg) appState.user.nameBg = newNameBg;
    appState.user.language = newLanguage;

    saveSettings();
    updateProfileDisplay();
    
    // Update welcome message
    document.getElementById('user-name').textContent = appState.user.name;
    document.getElementById('user-name-bg').textContent = appState.user.nameBg;

    // Show success message
    showNotification('Profil sauvegardé! / Профилът е запазен!', 'success');
}

// Streak Tracking
function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = appState.streak.lastActiveDate;

    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
            appState.streak.currentStreak++;
        } else if (lastActive && lastActive !== today) {
            appState.streak.currentStreak = 1;
        } else {
            appState.streak.currentStreak = 1;
        }

        appState.streak.lastActiveDate = today;
        
        // Track days active
        const daysActive = parseInt(localStorage.getItem('daysActive')) || 0;
        localStorage.setItem('daysActive', (daysActive + 1).toString());
        
        saveProgress();
    }

    // Update streak display
    const streakEl = document.getElementById('home-streak');
    if (streakEl) {
        streakEl.textContent = appState.streak.currentStreak || 0;
    }
    
    // Update profile streak
    const profileStreakEl = document.getElementById('profile-current-streak');
    if (profileStreakEl) {
        profileStreakEl.textContent = `${appState.streak.currentStreak || 0} jours / дни`;
    }

    // Check for streak achievements
    checkForNewAchievements();
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'var(--primary-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--accent-color)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInDown 0.5s ease-out;
        font-size: 18px;
        font-weight: bold;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes slideInDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideOutUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);