// DOM Elements
const testItem = document.getElementById("textDisplay");
const inputItem = document.getElementById("textInput");
const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const correctWordsElement = document.getElementById("correctWords");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const soundToggle = document.getElementById("soundToggle");
const themeToggle = document.getElementById("themeToggle");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const resultsModal = document.getElementById("resultsModal");
const finalWPM = document.getElementById("finalWPM");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalTime = document.getElementById("finalTime");
const closeModal = document.getElementById("closeModal");

// Time buttons
const thirty = document.getElementById("thirty");
const sixty = document.getElementById("sixty");
const oneTwenty = document.getElementById("oneTwenty");

// Difficulty buttons
const beg = document.getElementById("beg");
const pro = document.getElementById("pro");
const expert = document.getElementById("expert");

// Game State
const gameState = {
    wordNo: 1,
    wordsSubmitted: 0,
    wordsCorrect: 0,
    totalChars: 0,
    correctChars: 0,
    timer: 30,
    timeLeft: 30,
    isRunning: false,
    isPaused: false,
    soundEnabled: true,
    difficulty: 1, // 1: Beginner, 2: Advanced, 3: Expert
    timeInterval: null,
    wpmInterval: null,
    startTime: null,
    currentWPM: 0
};

// Initialize the game
function initGame() {
    displayTest(gameState.difficulty);
    setupEventListeners();
    updateStats();
}

// Setup event listeners
function setupEventListeners() {
    // Input handling
    inputItem.addEventListener('input', handleInput);
    
    // Time selection
    thirty.addEventListener("click", () => setTimeLimit(30));
    sixty.addEventListener("click", () => setTimeLimit(60));
    oneTwenty.addEventListener("click", () => setTimeLimit(120));
    
    // Difficulty selection
    beg.addEventListener("click", () => setDifficulty(1));
    pro.addEventListener("click", () => setDifficulty(2));
    expert.addEventListener("click", () => setDifficulty(3));
    
    // Control buttons
    restartBtn.addEventListener("click", restartTest);
    pauseBtn.addEventListener("click", togglePause);
    soundToggle.addEventListener("click", toggleSound);
    themeToggle.addEventListener("click", toggleTheme);
    closeModal.addEventListener("click", closeResultsModal);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        restartTest();
    } else if (e.key === 'Escape') {
        togglePause();
    } else if (e.ctrlKey && e.key === 'm') {
        toggleTheme();
    }
}

// Handle user input
function handleInput(event) {
    if (!gameState.isRunning && !gameState.isPaused) {
        startTest();
    }
    
    if (gameState.isPaused) return;
    
    const charEntered = event.data;
    gameState.totalChars++;
    
    if (charEntered && !/\s/g.test(charEntered)) {
        if (isCorrectChar(charEntered)) {
            gameState.correctChars++;
        }
    }
    
    if (/\s/g.test(charEntered)) {
        checkWord();
    } else {
        currentWord();
    }
    
    updateStats();
}

// Start the test
function startTest() {
    gameState.isRunning = true;
    gameState.startTime = Date.now();
    gameState.timeLeft = gameState.timer;
    
    // Start timer
    gameState.timeInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            timeElement.textContent = gameState.timeLeft;
            updateProgress();
            
            if (gameState.timeLeft <= 0) {
                timeOver();
            }
        }
    }, 1000);
    
    // Start WPM calculation
    gameState.wpmInterval = setInterval(calculateWPM, 100);
    
    limitInvisible();
    inputItem.focus();
}

// Calculate real-time WPM
function calculateWPM() {
    if (gameState.isRunning && !gameState.isPaused) {
        const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
        if (timeElapsed > 0) {
            gameState.currentWPM = Math.round(gameState.wordsCorrect / timeElapsed);
            wpmElement.textContent = gameState.currentWPM;
        }
    }
}

// Update all statistics
function updateStats() {
    const accuracy = gameState.totalChars > 0 
        ? Math.round((gameState.correctChars / gameState.totalChars) * 100)
        : 0;
    
    accuracyElement.textContent = accuracy + '%';
    correctWordsElement.textContent = gameState.wordsCorrect;
}

// Update progress bar
function updateProgress() {
    const progress = ((gameState.timer - gameState.timeLeft) / gameState.timer) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '% Complete';
}

// Set time limit
function setTimeLimit(seconds) {
    gameState.timer = seconds;
    gameState.timeLeft = seconds;
    timeElement.textContent = seconds;
    updateButtonActiveState([thirty, sixty, oneTwenty], event.target);
    updateProgress();
}

// Set difficulty
function setDifficulty(level) {
    gameState.difficulty = level;
    displayTest(level);
    updateButtonActiveState([beg, pro, expert], event.target);
}

// Update active button state
function updateButtonActiveState(buttons, activeButton) {
    buttons.forEach(btn => {
        btn.classList.remove('active', 'yellow');
    });
    activeButton.classList.add('active', 'yellow');
}

// Restart test
function restartTest() {
    clearIntervals();
    
    gameState.wordNo = 1;
    gameState.wordsSubmitted = 0;
    gameState.wordsCorrect = 0;
    gameState.totalChars = 0;
    gameState.correctChars = 0;
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.timeLeft = gameState.timer;
    gameState.currentWPM = 0;
    
    timeElement.textContent = gameState.timeLeft;
    wpmElement.textContent = '0';
    accuracyElement.textContent = '0%';
    correctWordsElement.textContent = '0';
    
    inputItem.disabled = false;
    inputItem.value = '';
    inputItem.focus();
    
    displayTest(gameState.difficulty);
    updateProgress();
    limitVisible();
    closeResultsModal();
    
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
}

// Toggle pause state
function togglePause() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        inputItem.blur();
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        inputItem.focus();
    }
}

// Toggle sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggle.innerHTML = gameState.soundEnabled 
        ? '<i class="fas fa-volume-up"></i> Sound'
        : '<i class="fas fa-volume-mute"></i> Mute';
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' 
        ? '<i class="fas fa-moon"></i> Dark Mode'
        : '<i class="fas fa-sun"></i> Light Mode';
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Time over
function timeOver() {
    clearIntervals();
    gameState.isRunning = false;
    inputItem.disabled = true;
    
    showResults();
}

// Show results modal
function showResults() {
    const accuracy = gameState.totalChars > 0 
        ? Math.round((gameState.correctChars / gameState.totalChars) * 100)
        : 0;
    
    finalWPM.textContent = gameState.currentWPM;
    finalAccuracy.textContent = accuracy + '%';
    finalTime.textContent = gameState.timer + 's';
    
    resultsModal.style.display = 'block';
    
    // Play sound if enabled
    if (gameState.soundEnabled) {
        // Could add celebration sound here
    }
}

// Close results modal
function closeResultsModal() {
    resultsModal.style.display = 'none';
}

// Clear intervals
function clearIntervals() {
    if (gameState.timeInterval) clearInterval(gameState.timeInterval);
    if (gameState.wpmInterval) clearInterval(gameState.wpmInterval);
}

// Check current word
function currentWord() {
    const wordEntered = inputItem.value;
    const currentID = "word " + gameState.wordNo;
    const currentSpan = document.getElementById(currentID);
    
    if (!currentSpan) return;
    
    const curSpanWord = currentSpan.innerText.trim();
    
    if (wordEntered === curSpanWord.substring(0, wordEntered.length)) {
        colorSpan(currentID, 2); // Current
    } else {
        colorSpan(currentID, 3); // Wrong
    }
}

// Check completed word
function checkWord() {
    const wordEntered = inputItem.value.trim();
    inputItem.value = '';
    
    const wordID = "word " + gameState.wordNo;
    const checkSpan = document.getElementById(wordID);
    
    if (!checkSpan) return;
    
    gameState.wordNo++;
    gameState.wordsSubmitted++;
    
    if (checkSpan.innerText.trim() === wordEntered) {
        colorSpan(wordID, 1); // Correct
        gameState.wordsCorrect++;
        playSound('correct');
    } else {
        colorSpan(wordID, 3); // Wrong
        playSound('wrong');
    }
    
    if (gameState.wordNo > 40) {
        displayTest(gameState.difficulty);
    } else {
        const nextID = "word " + gameState.wordNo;
        colorSpan(nextID, 2); // Current
    }
}

// Check if character is correct
function isCorrectChar(charEntered) {
    const currentID = "word " + gameState.wordNo;
    const currentSpan = document.getElementById(currentID);
    
    if (!currentSpan) return false;
    
    const curSpanWord = currentSpan.innerText.trim();
    const currentPos = inputItem.value.length - 1;
    
    return currentPos < curSpanWord.length && charEntered === curSpanWord[currentPos];
}

// Play sound
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // Simple beep sounds using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = type === 'correct' ? 800 : 400;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Color span based on state
function colorSpan(id, color) {
    const span = document.getElementById(id);
    if (!span) return;
    
    span.classList.remove('correct', 'current', 'wrong');
    
    switch (color) {
        case 1: // Correct
            span.classList.add('correct');
            break;
        case 2: // Current
            span.classList.add('current');
            break;
        case 3: // Wrong
            span.classList.add('wrong');
            break;
    }
}

// Display test words
function displayTest(diff) {
    gameState.wordNo = 1;
    testItem.innerHTML = '';
    
    let newTest = randomWords(diff);
    newTest.forEach(function(word, i) {
        let wordSpan = document.createElement('span');
        wordSpan.innerText = word;
        wordSpan.setAttribute("id", "word " + (i + 1));
        testItem.appendChild(wordSpan);
    });
    
    const nextID = "word " + gameState.wordNo;
    colorSpan(nextID, 2);
}

// Generate random words based on difficulty
function randomWords(diff) {
    const wordLists = {
        1: basicWords,    // Beginner
        2: topWords,      // Advanced  
        3: expertWords    // Expert
    };
    
    const wordArray = wordLists[diff] || basicWords;
    const selectedWords = [];
    
    for (let i = 0; i < 40; i++) {
        const randomNumber = Math.floor(Math.random() * wordArray.length);
        selectedWords.push(wordArray[randomNumber] + " ");
    }
    
    return selectedWords;
}

// Limit visibility
function limitVisible() {
    [thirty, sixty, oneTwenty, beg, pro, expert].forEach(el => {
        el.style.visibility = 'visible';
    });
}

function limitInvisible() {
    [thirty, sixty, oneTwenty, beg, pro, expert].forEach(el => {
        el.style.visibility = 'hidden';
    });
}

// Word lists (extended)
const basicWords = ["a", "about", "above", "across", "act", "add", "afraid", "after", "again", "age", "ago", "agree", "air", "all", "alone", "along", "always", "am", "amount", "an", "and", "angry", "another", "answer", "any", "anyone", "appear", "apple", "are", "area", "arm", "army", "around", "arrive", "art", "as", "ask", "at", "aunt", "away", "baby", "back", "bad", "bag", "ball", "bank", "base", "bath", "be", "bean", "bear", "bed", "beer", "before", "begin", "bell", "below", "best", "big", "bird", "birth", "bit", "bite", "black", "bleed", "block", "blood", "blow", "blue", "board", "boat", "body", "boil", "bone", "book", "border", "born", "both", "bowl", "box", "boy", "branch", "brave", "bread", "break", "breathe", "bridge", "bright", "bring", "brother", "brown", "brush", "build", "burn", "bus", "busy", "but", "buy", "by", "cake", "call", "can", "cap", "car", "card", "care", "carry", "case", "cat", "catch", "chair", "chase", "cheap", "cheese", "child", "choice", "circle", "city", "class", "clever", "clean", "clear", "climb", "clock", "cloth", "cloud", "close", "coffee", "coat", "coin", "cold", "colour", "comb", "common", "compare", "come", "control", "cook", "cool", "copper", "corn", "corner", "correct", "cost", "count", "cover", "crash", "cross", "cry", "cup", "cut", "dance", "dark", "day", "dead", "decide", "deep", "deer", "desk", "die", "dirty", "dish", "do", "dog", "door", "down", "draw", "dream", "dress", "drink", "drive", "drop", "dry", "duck", "dust", "duty", "each", "ear", "early", "earn", "earth", "east", "easy", "eat", "effect", "egg", "eight", "else", "empty", "end", "enemy", "enjoy", "enter", "equal", "even", "event", "ever", "every", "exact", "except", "expect", "explain", "eye", "face", "fact", "fail", "fall", "false", "family", "famous", "far", "farm", "fast", "fat", "fault", "fear", "feed", "feel", "fever", "few", "fight", "fill", "film", "find", "fine", "fire", "first", "fish", "fit", "five", "fix", "flag", "flat", "float", "floor", "flour", "fly", "fold", "food", "fool", "foot", "for", "force", "forest", "forget", "fork", "form", "fox", "four", "free", "freeze", "fresh", "friend", "from", "front", "fruit", "full", "fun", "funny", "future", "game", "gate","get", "gift", "give", "glad", "glass", "go", "goat", "god", "gold", "good", "grass", "grave", "great", "green", "gray", "group", "grow", "gun", "hair", "half", "hall", "hand", "happy", "hard", "hat", "hate", "have", "he", "head", "hear", "heavy", "heart", "hello", "help", "hen", "her", "here", "hers", "hide", "high", "hill", "him", "his", "hit", "hobby", "hold", "hole", "home", "hope", "horse", "hot", "hotel", "house", "how", "hour", "hurry", "hurt", "I", "ice", "idea", "if", "in", "into", "invent", "iron", "is", "island", "it", "its", "jelly", "job", "join", "juice", "jump", "just", "keep", "key", "kill", "kind", "king", "knee", "knife", "knock", "know", "lady", "lamp", "land", "large", "last", "late", "laugh", "lazy", "lead", "leaf", "learn", "leave", "leg", "left", "lend", "length", "less", "lesson", "let", "letter", "lie", "life", "light", "like", "lion", "lip", "list", "live", "lock", "lonely", "long", "look", "lose", "lot", "love", "low", "lower", "luck", "main", "make", "male", "man", "many", "map", "mark", "may", "me", "meal", "mean", "meat", "meet", "milk", "mind", "miss", "mix", "model", "money", "month", "moon", "more", "most", "mouth", "move", "much", "music", "must", "my", "name", "near", "neck", "need", "needle", "net", "never", "new", "news", "next", "nice", "night", "nine", "no", "noble", "noise", "none", "nor", "north", "nose", "not", "notice", "now", "obey", "ocean", "of", "off", "offer", "office", "often", "oil", "old", "on", "one", "only", "open", "or", "orange", "order", "other", "our", "out", "over", "own", "page", "pain", "paint", "pair", "pan", "paper", "park", "part", "party", "pass", "past", "path", "pay", "peace", "pen", "per", "piano", "pick", "piece", "pig", "pin", "pink", "place", "plane", "plant", "plate", "play", "please", "plenty", "point", "polite", "pool", "poor", "pour", "power", "press", "pretty", "price", "prince", "prison", "prize", "pull", "punish", "pupil", "push", "put", "queen", "quick", "quiet", "radio", "rain", "rainy", "raise", "reach", "read", "ready", "real", "red", "rent", "reply", "rest", "rice", "rich", "ride", "right", "ring", "rise", "road", "rob", "rock", "room", "round", "rude", "rule", "ruler", "run", "rush", "sad", "safe", "sail", "salt", "same", "sand", "save", "say", "school", "search", "seat", "second", "see", "seem", "sell", "send", "serve", "seven", "sex", "shade", "shake", "shape", "share", "sharp", "she", "sheep", "sheet", "shine", "ship", "shirt", "shoe", "shoot", "shop", "short", "shout", "show", "sick", "side", "silly", "silver", "simple", "single", "since", "sing", "sink", "sister", "sit", "six", "size", "skill", "skin", "skirt", "sky", "sleep", "slip", "slow", "small", "smell", "smile", "smoke", "snow", "so", "soap", "sock", "soft", "some", "son", "soon", "sorry", "sound", "soup", "south", "space", "speak", "speed", "spell", "spend", "spoon", "sport", "spread", "spring", "square", "stamp", "stand", "star", "start", "stay", "steal", "steam", "step", "still", "stone", "stop", "store", "storm", "story", "street", "study", "stupid", "such", "sugar", "sun", "sunny", "sure", "sweet", "swim", "sword", "table", "take", "talk", "tall", "taste", "taxi", "tea", "teach", "team", "tear", "tell", "ten", "tennis", "test", "than", "that", "the", "their", "then", "there", "these", "thick", "thin", "thing", "think", "third", "this", "threat", "three", "tidy", "tie", "title", "to", "today", "toe", "too", "tool", "tooth", "top", "total", "touch", "town", "train", "tram", "tree", "true", "trust", "twice", "try", "turn", "type", "ugly", "uncle", "under", "unit", "until", "up", "use", "useful", "usual", "usually", "very", "voice", "visit", "wait", "wake", "walk", "want", "warm", "was", "wash", "waste", "watch", "water", "way", "we", "weak", "wear", "week", "weight", "were", "well", "west", "wet", "what", "wheel", "when", "where", "which", "while", "white", "who", "why", "wide", "wife", "wild", "will", "win", "wind", "wine", "wire", "wise", "wish", "with", "woman", "word", "work", "world", "worry", "yard", "yell", "yet", "you", "young", "your", "zero", "zoo"];

const topWords = ["ability", "able", "about", "above", "accept", "according", "account", "across", "action", "activity", "actually", "address", "administration", "admit", "adult", "affect", "after", "again", "against", "agency", "agent", "ago", "agree", "agreement", "ahead", "allow", "almost", "alone", "along", "already", "also", "although", "always", "American", "among", "amount", "analysis", "and", "animal", "another", "answer", "anyone", "anything", "appear", "apply", "approach", "area", "argue", "around", "arrive", "article", "artist", "assume", "attack", "attention", "attorney", "audience", "author", "authority", "available", "avoid", "away", "baby", "back", "ball", "bank", "beat", "beautiful", "because", "become", "before", "begin", "behavior", "behind", "believe", "benefit", "best", "better", "between", "beyond", "bill", "billion", "black", "blood", "blue", "board", "body", "book", "born", "both", "break", "bring", "brother", "budget", "build", "building", "business", "call", "camera", "campaign", "cancer", "candidate", "capital", "card", "care", "career", "carry", "case", "catch", "cause", "cell", "center", "central", "century", "certain", "certainly", "chair", "challenge", "chance", "change", "character", "charge", "check", "child", "choice", "choose", "church", "citizen", "city", "civil", "claim", "class", "clear", "clearly", "close", "coach", "cold", "collection", "college", "color", "come", "commercial", "common", "community", "company", "compare", "computer", "concern", "condition", "conference", "congress", "consider", "consumer", "contain", "continue", "control", "cost", "could", "country", "couple", "course", "court", "cover", "create", "crime", "cultural", "culture", "cup", "current", "customer", "dark", "data", "daughter", "dead", "deal", "death", "debate", "decade", "decide", "decision", "deep", "defense", "degree", "Democrat", "democratic", "describe", "design", "despite", "detail", "determine", "develop", "development", "difference", "different", "difficult", "dinner", "direction", "director", "discover", "discuss", "discussion", "disease", "doctor", "door", "down", "draw", "dream", "drive", "drop", "drug", "during", "each", "early", "east", "easy", "economic", "economy", "edge", "education", "effect", "effort", "eight", "either", "election", "else", "employee", "energy", "enjoy", "enough", "enter", "entire", "environment", "environmental", "especially", "establish", "even", "evening", "event", "ever", "every", "everybody", "everyone", "everything", "evidence", "exactly", "example", "executive", "exist", "expect", "experience", "expert", "explain", "eye", "face", "fact", "factor", "fail", "fall", "family", "far", "fast", "father", "fear", "federal", "feel", "feeling", "field", "fight", "figure", "fill", "film", "final", "finally", "financial", "find", "fine", "finger", "finish", "fire", "firm", "first", "fish", "five", "floor", "fly", "focus", "follow", "food", "foot", "force", "foreign", "forget", "form", "former", "forward", "four", "free", "friend", "from", "front", "full", "fund", "future", "game", "garden", "general", "generation", "girl", "give", "glass", "goal", "good", "government", "great", "green", "ground", "group", "grow", "growth", "guess", "guy", "hair", "half", "hand", "hang", "happen", "happy", "hard", "have", "head", "health", "hear", "heart", "heat", "heavy", "help", "here", "herself", "high", "him", "himself", "his", "history", "hold", "home", "hope", "hospital", "hot", "hotel", "hour", "house", "how", "however", "huge", "human", "hundred", "husband", "I", "idea", "identify", "if", "image", "imagine", "impact", "important", "improve", "include", "including", "increase", "indeed", "indicate", "individual", "industry", "information", "inside", "instead", "institution", "interest", "interesting", "international", "interview", "into", "investment", "involve", "issue", "item", "it's", "itself", "join", "just", "keep", "kill", "kind", "kitchen", "know", "knowledge", "land", "language", "large", "last", "late", "later", "laugh", "law", "lawyer", "lead", "leader", "learn", "least", "leave", "left", "legal", "less", "letter", "level", "life", "light", "like", "likely", "line", "list", "listen", "little", "live", "local", "long", "look", "lose", "loss", "love", "machine", "magazine", "main", "maintain", "major", "majority", "make", "man", "manage", "management", "manager", "many", "market", "marriage", "material", "matter", "maybe", "mean", "measure", "media", "medical", "meet", "meeting", "member", "memory", "mention", "message", "method", "middle", "might", "military", "million", "mind", "minute", "miss", "mission", "model", "modern", "moment", "money", "month", "more", "morning", "most", "mother", "mouth", "move", "movement", "movie", "Mr", "Mrs", "much", "music", "must", "my", "myself", "name", "nation", "national", "natural", "nature", "near", "nearly", "necessary", "need", "network", "never", "news", "newspaper", "next", "nice", "night", "none", "north", "note", "nothing", "notice", "number", "occur", "off", "offer", "office", "officer", "official", "often", "once", "only", "onto", "open", "operation", "opportunity", "option", "order", "organization", "other", "others", "outside", "over", "own", "owner", "page", "pain", "painting", "paper", "parent", "part", "participant", "particular", "particularly", "partner", "party", "pass", "past", "patient", "pattern", "peace", "people", "perform", "performance", "perhaps", "period", "person", "personal", "phone", "physical", "pick", "picture", "piece", "place", "plan", "plant", "play", "player", "PM", "point", "police", "policy", "political", "politics", "poor", "popular", "population", "position", "positive", "possible", "power", "practice", "prepare", "present", "president", "pressure", "pretty", "prevent", "price", "private", "probably", "problem", "process", "produce", "product", "production", "professional", "professor", "program", "project", "property", "protect", "prove", "provide", "public", "pull", "purpose", "push", "quality", "question", "quickly", "quite", "race", "radio", "raise", "range", "rate", "rather", "reach", "read", "ready", "real", "reality", "realize", "really", "reason", "receive", "recent", "recently", "recognize", "record", "red", "reduce", "reflect", "region", "relate", "relationship", "religious", "remain", "remember", "remove", "report", "represent", "republican", "require", "research", "resource", "respond", "response", "responsibility", "rest", "result", "return", "reveal", "rich", "right", "rise", "risk", "road", "rock", "role", "room", "rule", "safe", "same", "save", "scene", "school", "science", "scientist", "score", "sea", "season", "seat", "second", "section", "security", "see", "seek", "seem", "sell", "send", "senior", "sense", "series", "serious", "serve", "service", "set", "seven", "several", "sex", "sexual", "shake", "share", "she", "shoot", "short", "shot", "should", "shoulder", "show", "side", "sign", "significant", "similar", "simple", "simply", "since", "sing", "single", "sister", "situation", "size", "skill", "skin", "small", "smile", "social", "society", "soldier", "some", "somebody", "someone", "something", "sometimes", "song", "soon", "sort", "sound", "source", "south", "southern", "space", "speak", "special", "specific", "speech", "spend", "sport", "spring", "staff", "stage", "stand", "standard", "star", "start", "state", "statement", "station", "stay", "step", "still", "stock", "stop", "store", "story", "strategy", "street", "strong", "structure", "student", "study", "stuff", "style", "subject", "success", "successful", "such", "suddenly", "suffer", "suggest", "summer", "support", "sure", "surface", "system", "table", "take", "talk", "task", "tax", "teach", "teacher", "team", "technology", "television", "tell", "tend", "term", "test", "than", "thank", "that", "their", "them", "themselves", "then", "theory", "there", "these", "they", "thing", "think", "third", "this", "those", "though", "thought", "thousand", "threat", "three", "through", "throughout", "throw", "thus", "time", "today", "together", "tonight", "total", "tough", "toward", "town", "trade", "traditional", "training", "travel", "treat", "treatment", "tree", "trial", "trip", "trouble", "true", "truth", "try", "turn", "TV", "type", "under", "understand", "unit", "until", "usually", "value", "various", "very", "victim", "view", "violence", "visit", "voice", "vote", "wait", "walk", "wall", "want", "watch", "water", "weapon", "wear", "week", "weight", "well", "west", "western", "what", "whatever", "when", "where", "whether", "which", "while", "white", "whole", "whom", "whose", "wide", "wife", "will", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "word", "work", "worker", "world", "worry", "would", "write", "writer", "wrong", "yard", "yeah", "year", "young", "your", "yourself"];

const expertWords = ["aberration", "abnegation", "abrogate", "abscond", "accolade", "accretion", "acumen", "admonish", "adumbrate", "alacrity", "anathema", "antithesis", "apotheosis", "ascetic", "assiduous", "bane", "beguile", "blandishment", "cacophony", "capitulate", "carouse", "catalyst", "caustic", "charlatan", "cogent", "commensurate", "conflagration", "contrite", "convoluted", "corpulent", "covet", "cupidity", "dearth", "demagogue", "denouement", "desultory", "diaphanous", "didactic", "dilatory", "dilettante", "dissonant", "eclectic", "egregious", "elegy", "emollient", "empirical", "enervate", "ephemeral", "equanimity", "eschew", "esoteric", "eulogy", "euphoria", "evanescent", "exacerbate", "exhort", "exigent", "extol", "fastidious", "fecund", "garrulous", "grandiloquent", "gregarious", "harangue", "hegemony", "iconoclast", "idiosyncratic", "impetuous", "impervious", "ineffable", "inexorable", "ingenuous", "inimical", "injunction", "insidious", "laconic", "languid", "largess", "legerdemain", "licentious", "limpid", "loquacious", "lucid", "magnanimous", "mendacious", "mercurial", "modicum", "myriad", "nefarious", "obfuscate", "obstreperous", "panacea", "paradigm", "paragon", "pejorative", "perfidious", "perfunctory", "perspicacious", "phlegmatic", "pithy", "platitude", "plethora", "pragmatic", "precipitate", "profligate", "prolific", "propitious", "pugnacious", "quixotic", "recalcitrant", "redolent", "replete", "sagacious", "salient", "sanguine", "sardonic", "solicitous", "sublime", "supercilious", "surfeit", "sycophant", "taciturn", "trenchant", "ubiquitous", "vicarious", "vociferous", "wanton", "winsome", "zeitgeist"];

// Load saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' 
        ? '<i class="fas fa-moon"></i> Dark Mode'
        : '<i class="fas fa-sun"></i> Light Mode';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTheme();
    initGame();
});