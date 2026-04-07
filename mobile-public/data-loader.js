// Data loader for Bulgarche app
class DataLoader {
    constructor() {
        this.lessons = [];
        this.tests = [];
        this.dictionary = [];
        this.wordsBg = [];
    }

    assetUrl(relativePath) {
        // Works for http(s) + file:// (Cordova/Electron) without leading slashes
        const clean = String(relativePath || '').replace(/^\/+/, '');
        return new URL(clean, window.location.href).toString();
    }

    async fetchText(relativePath) {
        const response = await fetch(this.assetUrl(relativePath));
        if (!response.ok) {
            throw new Error(`Failed to fetch ${relativePath}: ${response.status}`);
        }
        return await response.text();
    }

    async loadAllData() {
        try {
            console.log('Starting to load all data...');
            
            await this.loadLessons();
            await this.loadTests();
            await this.loadDictionary();
            await this.loadWordsBg();
            
            // Set global app data
            window.appData = {
                lessons: this.lessons,
                tests: this.tests,
                dictionary: this.dictionary,
                wordsBg: this.wordsBg
            };
            
            console.log('Data loaded successfully:', {
                lessons: this.lessons.length,
                tests: this.tests.length,
                dictionary: this.dictionary.length,
                wordsBg: this.wordsBg.length
            });
            
            // Dispatch event after all data is loaded
            window.dispatchEvent(new CustomEvent('dataLoaded'));
            
        } catch (error) {
            console.error('Error loading all data:', error);
            // Still dispatch event so app can continue with partial data
            window.appData = {
                lessons: this.lessons,
                tests: this.tests,
                dictionary: this.dictionary,
                wordsBg: this.wordsBg
            };
            window.dispatchEvent(new CustomEvent('dataLoaded'));
        }
    }

    async loadLessons() {
        try {
            console.log('Loading lessons...');
            const text = await this.fetchText('txt/uroci.txt');
            const lines = text.split('\n').filter(line => line.trim());
            
            let currentLesson = null;
            let lessonId = 1;
            let sectionNumber = 1;
            let lessonNumber = 1;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Detect section headers (like 📘 РАЗДЕЛ 1: ЗВУКОВЕ И БУКВИ)
                if (line.match(/^📘\s+РАЗДЕЛ\s+\d+/i)) {
                    sectionNumber = parseInt(line.match(/\d+/)[0]);
                    lessonNumber = 1; // Reset lesson number for new section
                    continue;
                }
                
                // Detect lesson titles (numbered lessons like "1. История на българската азбука")
                if (line.match(/^(\d+)\.\s+/i)) {
                    // Save previous lesson
                    if (currentLesson) {
                        this.lessons.push(currentLesson);
                    }
                    
                    // Start new lesson
                    currentLesson = {
                        id: lessonId++,
                        section: sectionNumber,
                        lessonNumber: lessonNumber++,
                        title: line,
                        bulgarian: '',
                        french: '',
                        description: line.split('.')[1] || line
                    };
                }
                // Detect Bulgarian content
                else if (line.match(/^Български:/i) && currentLesson) {
                    currentLesson.bulgarian = '';
                    // Collect Bulgarian text until French section or next lesson
                    for (let j = i + 1; j < lines.length; j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine.match(/^Français\s*:/i) || nextLine.match(/^📘\s+РАЗДЕЛ/i) || nextLine.match(/^(\d+)\.\s+/i)) {
                            i = j - 1; // Move back to process French or next lesson
                            break;
                        }
                        if (nextLine && nextLine !== '') {
                            currentLesson.bulgarian += nextLine + ' ';
                        }
                    }
                    currentLesson.bulgarian = currentLesson.bulgarian.trim();
                }
                // Detect French content
                else if (line.match(/^Français\s*:/i) && currentLesson) {
                    currentLesson.french = '';
                    // Collect French text until next lesson or section
                    for (let j = i + 1; j < lines.length; j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine.match(/^📘\s+РАЗДЕЛ/i) || nextLine.match(/^(\d+)\.\s+/i)) {
                            i = j - 1; // Move back to process next lesson
                            break;
                        }
                        if (nextLine && nextLine !== '') {
                            currentLesson.french += nextLine + ' ';
                        }
                    }
                    currentLesson.french = currentLesson.french.trim();
                }
            }
            
            // Add last lesson
            if (currentLesson) {
                this.lessons.push(currentLesson);
            }
            
            console.log(`Loaded ${this.lessons.length} lessons from ${sectionNumber} sections`);
            
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    }

    // Parse tests from a single-language TXT file (same logic as main.js)
    parseTests(text) {
        const content = String(text || '');
        const tests = [];
        const matches = [];

        let урокRegex = /Урок\s+\d+\s*:/g;
        let match;
        while ((match = урокRegex.exec(content)) !== null) {
            matches.push({ index: match.index, text: match[0] });
        }

        if (matches.length === 0) {
            const leçonRegex = /Leçon\s+\d+\s*:/gi;
            while ((match = leçonRegex.exec(content)) !== null) {
                matches.push({ index: match.index, text: match[0] });
            }
        }

        if (matches.length === 0) {
            return [];
        }

        matches.sort((a, b) => a.index - b.index);

        for (let i = 0; i < matches.length; i++) {
            const startIndex = matches[i].index + matches[i].text.length;
            const endIndex = i < matches.length - 1 ? matches[i + 1].index : content.length;
            const block = content.substring(startIndex, endIndex).trim();

            if (!block || block.length < 10) continue;

            const lines = block.split('\n').map(l => l.trim()).filter(l => l && l.length > 0);
            if (lines.length < 3) continue;

            const title = lines[0];
            if (!title || title.length < 3) continue;

            const questions = [];
            let answersLine = null;
            let answersLineIndex = -1;

            for (let j = lines.length - 1; j >= 0; j--) {
                if (lines[j].match(/Réponses\s*:|Отговори\s*:/i)) {
                    answersLine = lines[j];
                    answersLineIndex = j;
                    break;
                }
            }

            const answers = {};
            if (answersLine) {
                const cleanAnswers = answersLine.replace(/Réponses\s*:/i, '').replace(/Отговори\s*:/i, '').trim();
                const answerMatches = cleanAnswers.match(/(\d+)([A-Z])/g);
                if (answerMatches) {
                    answerMatches.forEach(m => {
                        const numMatch = m.match(/(\d+)([A-Z])/);
                        if (numMatch) {
                            const num = parseInt(numMatch[1], 10);
                            const letter = numMatch[2];
                            answers[num] = letter.toUpperCase();
                        }
                    });
                }
            }

            for (let j = 1; j < lines.length && (answersLineIndex === -1 || j < answersLineIndex); j++) {
                const line = lines[j];

                if (line.match(/Réponses\s*:|Отговори\s*:/i)) {
                    continue;
                }

                const allOptions = [];
                const optionRegex = /([A-Z])\)\s*/g;
                const optionMatches = [];
                let optMatch;

                while ((optMatch = optionRegex.exec(line)) !== null) {
                    optionMatches.push({
                        letter: optMatch[1],
                        matchIndex: optMatch.index,
                        textStart: optMatch.index + optMatch[0].length
                    });
                }

                if (optionMatches.length >= 2) {
                    for (let idx = 0; idx < optionMatches.length; idx++) {
                        const textStart = optionMatches[idx].textStart;
                        let textEnd;
                        if (idx < optionMatches.length - 1) {
                            textEnd = optionMatches[idx + 1].matchIndex;
                        } else {
                            textEnd = line.length;
                        }
                        const optText = line.substring(textStart, textEnd).trim();
                        if (optText && optText.length > 0) {
                            allOptions.push(optText);
                        }
                    }
                }

                if (allOptions.length >= 2) {
                    if (j > 0) {
                        const questionText = lines[j - 1];
                        if (
                            questionText &&
                            !questionText.match(/^[A-Z]\)|Réponses|Отговори/i) &&
                            questionText.length > 3 &&
                            !questionText.match(/^\d+[A-Z]/)
                        ) {
                            const alreadyUsed = questions.some(q => q.question === questionText);
                            if (!alreadyUsed) {
                                questions.push({
                                    question: questionText,
                                    options: allOptions.filter(t => t && t.trim().length > 0)
                                });
                            }
                        }
                    }
                }
            }

            if (questions.length > 0) {
                const validQuestions = questions
                    .map((q, qIdx) => {
                        const questionNum = qIdx + 1;
                        return {
                            question: q.question || `Question ${questionNum}`,
                            options: q.options.filter(opt => opt && opt.trim().length > 0),
                            correctAnswer: (answers[questionNum] || answers[qIdx + 1] || 'A').toUpperCase()
                        };
                    })
                    .filter(q => q.options.length >= 2 && q.question.length > 3);

                if (validQuestions.length > 0) {
                    tests.push({
                        id: tests.length,
                        title,
                        questions: validQuestions
                    });
                }
            }
        }

        return tests.filter(t => t.questions && t.questions.length > 0);
    }

    extractLessonNumber(title) {
        const m = String(title || '').match(/(?:Урок|Leçon)\s*(\d+)/i);
        if (!m) return null;
        const n = parseInt(m[1], 10);
        return Number.isFinite(n) ? n : null;
    }

    mergeBilingualTests(bgTests, frTests) {
        // IMPORTANT: keep lessons strictly sequential: 1, 2, 3, ...
        // We ignore any explicit "Урок/Leçon N" numbering inside the files
        // and instead use the physical order of the tests in each TXT.
        const maxLen = Math.max(bgTests?.length || 0, frTests?.length || 0);

        return Array.from({ length: maxLen }).map((_, i) => {
            const bg = (bgTests || [])[i] || {};
            const fr = (frTests || [])[i] || {};

            const bgQuestions = Array.isArray(bg.questions) ? bg.questions : [];
            const frQuestions = Array.isArray(fr.questions) ? fr.questions : [];
            const qCount = Math.max(bgQuestions.length, frQuestions.length);

            const questions = Array.from({ length: qCount }).map((__, qIdx) => {
                const bq = bgQuestions[qIdx] || {};
                const fq = frQuestions[qIdx] || {};
                return {
                    questionBg: bq.question || '',
                    questionFr: fq.question || '',
                    optionsBg: Array.isArray(bq.options) ? bq.options : [],
                    optionsFr: Array.isArray(fq.options) ? fq.options : [],
                    correctAnswer: (bq.correctAnswer || fq.correctAnswer || 'A').toUpperCase()
                };
            });

            return {
                id: i,
                // Sequential lesson index (1, 2, 3, ...) – no gaps
                lesson: i + 1,
                titleBg: bg.title || '',
                titleFr: fr.title || '',
                questions
            };
        });
    }

    async loadTests() {
        console.log('Loading tests...');
        let bgText = '';
        let frText = '';

        // Load Bulgarian tests
        try {
            bgText = await this.fetchText('txt/testpve.txt');
        } catch (error) {
            console.error('Error loading Bulgarian tests (testpve.txt):', error);
        }

        // Load French tests (optional – app should still work without it)
        try {
            frText = await this.fetchText('txt/testove french.txt');
        } catch (error) {
            console.error('Error loading French tests (testove french.txt):', error);
        }

        try {
            const bgTests = bgText ? this.parseTests(bgText) : [];
            const frTests = frText ? this.parseTests(frText) : [];
            this.tests = this.mergeBilingualTests(bgTests, frTests);

            console.log(`Loaded ${this.tests.length} merged tests (BG+FR)`);
        } catch (error) {
            console.error('Error parsing/merging tests:', error);
            this.tests = [];
        }
    }

    async loadDictionary() {
        try {
            console.log('Loading dictionary...');
            const text = await this.fetchText('txt/words.txt');
            const lines = text.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                // Parse format: "дом – noun – жилище – maison – lieu où l'on habite"
                const parts = line.split('–').map(part => part.trim());
                
                if (parts.length >= 5) {
                    const word = parts[0]; // Bulgarian word
                    const type = parts[1]; // noun/verb/etc
                    const bgExplanation = parts[2]; // Bulgarian explanation
                    const frenchTranslation = parts[3]; // French translation
                    const frenchExplanation = parts[4]; // French explanation
                    
                    if (word && word.length > 0) {
                        this.dictionary.push({
                            word: word,
                            type: type || '',
                            bgExplanation: bgExplanation || '',
                            frenchTranslation: frenchTranslation || '',
                            frenchExplanation: frenchExplanation || ''
                        });
                    }
                } else if (parts.length >= 4) {
                    // Handle shorter format: "дом – noun – жилище – maison"
                    const word = parts[0];
                    const type = parts[1];
                    const bgExplanation = parts[2];
                    const frenchTranslation = parts[3];
                    
                    if (word && word.length > 0) {
                        this.dictionary.push({
                            word: word,
                            type: type || '',
                            bgExplanation: bgExplanation || '',
                            frenchTranslation: frenchTranslation || '',
                            frenchExplanation: ''
                        });
                    }
                } else if (parts.length >= 2) {
                    // Handle minimal format: "дом – maison"
                    const word = parts[0];
                    const frenchTranslation = parts[1];
                    
                    if (word && word.length > 0) {
                        this.dictionary.push({
                            word: word,
                            type: '',
                            bgExplanation: '',
                            frenchTranslation: frenchTranslation || '',
                            frenchExplanation: ''
                        });
                    }
                }
            }
            
            console.log(`Loaded ${this.dictionary.length} dictionary entries`);
            
        } catch (error) {
            console.error('Error loading dictionary:', error);
        }
    }

    async loadWordsBg() {
        try {
            console.log('Loading Bulgarian words...');
            const text = await this.fetchText('txt/wordsbg.txt');
            const lines = text.split('\n').filter(line => line.trim());
            
            this.wordsBg = lines.map(line => line.trim()).filter(word => word.length > 0);
            
            console.log(`Loaded ${this.wordsBg.length} Bulgarian words`);
            
        } catch (error) {
            console.error('Error loading Bulgarian words:', error);
        }
    }
}

// Auto-load data when script loads
const dataLoader = new DataLoader();

// Start loading immediately
dataLoader.loadAllData();
