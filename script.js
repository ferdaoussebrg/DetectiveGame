// ============================================
// CASE FILES: The Unseen - Game Logic
// ============================================

// Game State
const gameState = {
    currentScreen: 'main-menu',
    solvedCases: [],
    currentCase: null,
    currentWitness: null,
    selectedSuspects: []
};

// Case Solutions
const caseSolutions = {
    1: 3, // Case 1: Witness 3 (Victoria) testimony doesn't match evidence
    2: 2, // Case 2: Suspect 2 (Elena) is lying
    3: [1, 4], // Case 3: SysAdmin (Inside) & ZeroCool (External)
    4: [1, 2, 4] // Case 4: Executive (Mole), Secretary (Broker), Rival CEO (Buyer)
};

// Witness Testimonies
const testimonies = {
    1: {
        name: 'Butler James',
        text: '"I served Lady Ashford tea at 3 PM. The necklace was on her dresser, sparkling in the afternoon light. I left at 3:15 PM and locked the door behind me, as I always do."',
        image: 'butler'
    },
    2: {
        name: 'Maid Catherine',
        text: '"I cleaned the room at 2 PM. The window was open for fresh air - Lady Ashford always insists on it. I closed and latched it securely before leaving at 2:30 PM."',
        image: 'maid'
    },
    3: {
        name: 'Victoria Ashford',
        text: '"I visited my aunt at 4 PM. When I entered, the window was wide open and the necklace was gone! I immediately called the police."',
        image: 'niece'
    }
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 CASE FILES: The Unseen - Initialized');
    loadAllImages();
    initializeParallax();
    loadGameProgress();
});

// ============================================
// IMAGE LOADING
// ============================================

function loadAllImages() {
    // Check if GAME_IMAGES exists
    const imagesArray = window.GAME_IMAGES || GAME_IMAGES;
    if (!imagesArray) {
        console.error('GAME_IMAGES not found!');
        return;
    }

    // Case 1
    const butlerImg = document.getElementById('butler-img');
    const maidImg = document.getElementById('maid-img');
    const nieceImg = document.getElementById('niece-img');
    const necklaceImg = document.getElementById('necklace-img');
    const crimeSceneImg = document.getElementById('crime-scene-img');

    if (butlerImg) butlerImg.src = imagesArray.butler;
    if (maidImg) maidImg.src = imagesArray.maid;
    if (nieceImg) nieceImg.src = imagesArray.niece;
    if (necklaceImg) necklaceImg.src = imagesArray.necklace;
    if (crimeSceneImg) crimeSceneImg.src = imagesArray.crimeScene;

    // Case 2
    const marcusImg = document.getElementById('marcus-img');
    const elenaImg = document.getElementById('elena-img');
    const davidImg = document.getElementById('david-img');

    if (marcusImg) marcusImg.src = imagesArray.marcus;
    if (elenaImg) elenaImg.src = imagesArray.elena;
    if (davidImg) davidImg.src = imagesArray.david;

    // Case 3
    for (let i = 1; i <= 4; i++) {
        const img = document.getElementById(`hacker${i}-img`);
        if (img) img.src = imagesArray[`hacker${i}`];
    }

    // Case 4
    const roles = ['mole', 'broker', 'janitor', 'buyer', 'driver'];
    roles.forEach(role => {
        const img = document.getElementById(`${role}-img`);
        if (img) img.src = imagesArray[role];
    });

    console.log('✓ All images loaded');
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function startGame() {
    switchScreen('case-desk');
}

function backToMenu() {
    switchScreen('main-menu');
}

function backToDesk() {
    // Reset selections
    gameState.selectedSuspects = [];
    document.querySelectorAll('.cyber-suspect, .polaroid').forEach(el => el.classList.remove('selected'));
    const c3Count = document.getElementById('c3-count');
    const c4Count = document.getElementById('c4-count');
    if (c3Count) c3Count.innerText = '0';
    if (c4Count) c4Count.innerText = '0';

    switchScreen('case-desk');
}

function switchScreen(screenId) {
    // Remove active class from all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Add active class to target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        gameState.currentScreen = screenId;
    }
}

// ============================================
// 3D PARALLAX EFFECT FOR DESK
// ============================================

function initializeParallax() {
    const deskContainer = document.getElementById('desk-container');

    if (!deskContainer) return;

    document.addEventListener('mousemove', (e) => {
        // Only apply parallax when on desk screen
        if (gameState.currentScreen !== 'case-desk') return;

        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Calculate rotation values (subtle tilt)
        const rotateY = (mouseX - 0.5) * 15; // -7.5 to 7.5 degrees
        const rotateX = (mouseY - 0.5) * -10; // -5 to 5 degrees

        // Apply transform
        deskContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Parallax effect for desk items
        const deskItems = document.querySelectorAll('.desk-item');
        deskItems.forEach((item, index) => {
            const depth = (index + 1) * 5;
            const moveX = (mouseX - 0.5) * depth;
            const moveY = (mouseY - 0.5) * depth;
            item.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        // Parallax for case files (floating effect)
        const caseFiles = document.querySelectorAll('.case-file');
        caseFiles.forEach((file, index) => {
            const depth = 3;
            const moveX = (mouseX - 0.5) * depth;
            const moveY = (mouseY - 0.5) * depth;

            // Preserve hover state transform
            if (!file.matches(':hover')) {
                file.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
    });
}

// ============================================
// CASE MANAGEMENT
// ============================================

function openCase(caseNumber) {
    const caseFile = document.querySelector(`.case-file[data-case="${caseNumber}"]`);

    // Check if case is locked
    if (caseFile && caseFile.classList.contains('locked')) {
        showNotification('This case is locked. Solve previous cases to unlock it.', 'warning');
        return;
    }

    // Animate file opening
    if (caseFile) {
        caseFile.style.transform = 'scale(1.1) rotateY(10deg)';
        setTimeout(() => {
            caseFile.style.transform = '';
        }, 300);
    }

    // Switch to case screen
    setTimeout(() => {
        gameState.currentCase = caseNumber;
        gameState.selectedSuspects = []; // Reset for new case
        switchScreen(`case-${caseNumber}`);
    }, 400);
}

// ============================================
// CASE 1: SPOT THE INCONSISTENCY
// ============================================

function selectEvidence(caseNumber, evidenceId) {
    const card = document.querySelectorAll('.evidence-card')[evidenceId - 1];

    // Check if already selected
    if (card.classList.contains('selected')) return;

    // Check solution
    if (evidenceId === caseSolutions[caseNumber]) {
        // Correct answer
        card.classList.add('selected');

        setTimeout(() => {
            solveCase(caseNumber, 'Excellent detective work! You spotted the inconsistency: The maid closed the window at 2:30 PM, but the niece found it wide open at 4 PM. Someone opened it from the inside to stage a break-in!');
        }, 500);
    } else {
        // Wrong answer
        card.classList.add('wrong');

        setTimeout(() => {
            card.classList.remove('wrong');
        }, 500);

        showNotification('Not quite right. Review the timeline more carefully...', 'error');
    }
}

// ============================================
// CASE 2: LIE DETECTION
// ============================================

function selectSuspect(caseNumber, suspectId) {
    const card = document.querySelectorAll('.suspect-card')[suspectId - 1];

    // Check if already selected
    if (card.classList.contains('selected')) return;

    // Check solution
    if (suspectId === caseSolutions[caseNumber]) {
        // Correct answer
        card.classList.add('selected');

        setTimeout(() => {
            solveCase(caseNumber, 'Outstanding work! Elena Rodriguez is lying. Her photo metadata shows 8 PM, not midnight. She had no real alibi for the time of the theft!');
        }, 500);
    } else {
        // Wrong answer
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = '';
        }, 10);
        card.style.animation = 'shake 0.5s';

        showNotification('That suspect has a solid alibi. Look more carefully at the evidence...', 'error');
    }
}

// ============================================
// CASE 3 & 4: MULTI-SUSPECT SELECTION
// ============================================

function selectMultiSuspect(caseNumber, suspectId) {
    const element = event.currentTarget;

    // Toggle selection
    if (gameState.selectedSuspects.includes(suspectId)) {
        gameState.selectedSuspects = gameState.selectedSuspects.filter(id => id !== suspectId);
        element.classList.remove('selected');
    } else {
        gameState.selectedSuspects.push(suspectId);
        element.classList.add('selected');
    }

    // Update count UI
    const countSpan = document.getElementById(`c${caseNumber}-count`);
    if (countSpan) countSpan.innerText = gameState.selectedSuspects.length;
}

function submitAccusation(caseNumber) {
    const correctIds = caseSolutions[caseNumber];
    const userIds = gameState.selectedSuspects.sort();

    // Check if lengths match and values match
    const isCorrect = userIds.length === correctIds.length &&
        userIds.every((value, index) => value === correctIds[index]);

    if (isCorrect) {
        let msg = '';
        if (caseNumber === 3) msg = "SYSTEM SECURED. You identified the insider Sarah and the external hacker ZeroCool. Great work tracking the IP logs!";
        if (caseNumber === 4) msg = "CONSPIRACY DISMANTLED. The Executive (Mole), The Secretary (Broker), and The Rival CEO (Buyer) have been arrested. Omega Corp is safe.";

        solveCase(caseNumber, msg);
    } else {
        showNotification('Incorrect suspects selected. Review the evidence carefully.', 'error');
    }
}

// ============================================
// CASE COMPLETION
// ============================================

function solveCase(caseNumber, message) {
    // Mark case as solved
    if (!gameState.solvedCases.includes(caseNumber)) {
        gameState.solvedCases.push(caseNumber);
        saveGameProgress();
        unlockNextCase(caseNumber);
    }

    // Show success modal
    showSuccessModal(message);
}

function unlockNextCase(solvedCaseNumber) {
    const nextCaseNumber = solvedCaseNumber + 1;
    const nextCaseFile = document.querySelector(`.case-file[data-case="${nextCaseNumber}"]`);

    if (nextCaseFile && nextCaseFile.classList.contains('locked')) {
        setTimeout(() => {
            nextCaseFile.classList.remove('locked');
            nextCaseFile.classList.add('unlocked');

            // Update stamp
            const stamp = nextCaseFile.querySelector('.file-stamp');
            if (stamp) {
                stamp.textContent = 'ACTIVE';
                stamp.classList.remove('locked-stamp');
            }

            // Animate unlock
            nextCaseFile.style.animation = 'fadeInUp 0.8s ease';

            showNotification(`Case #${String(nextCaseNumber).padStart(3, '0')} unlocked!`, 'success');
        }, 1500);
    }
}

// ============================================
// MODALS
// ============================================

function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('success-message');

    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.classList.add('active');
    }
}

function showFailureModal() {
    const modal = document.getElementById('failure-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });

    // Return to desk after solving
    setTimeout(() => {
        backToDesk();
    }, 300);
}

// ============================================
// WITNESS INTERROGATION & EVIDENCE EXAMINATION
// ============================================

function interrogateWitness(witnessId, witnessType) {
    gameState.currentWitness = witnessId;
    const testimony = testimonies[witnessId];

    if (!testimony) return;

    // Get modal elements
    const modal = document.getElementById('testimony-modal');
    const portraitImg = document.getElementById('testimony-portrait-img');
    const nameEl = document.getElementById('testimony-name');
    const textEl = document.getElementById('testimony-text');

    // Set content
    portraitImg.src = GAME_IMAGES[testimony.image];
    nameEl.textContent = testimony.name;
    textEl.textContent = testimony.text;

    // Show modal
    modal.classList.add('active');
}

function examineEvidence(evidenceType) {
    const modal = document.getElementById('evidence-modal');
    const zoomImg = document.getElementById('evidence-zoom-img');

    if (evidenceType === 'crime-scene') {
        zoomImg.src = GAME_IMAGES.crimeScene;
    }

    modal.classList.add('active');
}

function accuse() {
    const witnessId = gameState.currentWitness;

    // Close testimony modal
    closeTestimony();

    // Check if correct
    if (witnessId === caseSolutions[gameState.currentCase]) {
        setTimeout(() => {
            solveCase(gameState.currentCase, `Excellent detective work! ${testimonies[witnessId].name}'s testimony doesn't match the evidence. The maid closed the window at 2:30 PM, but it was wide open at 4 PM. Someone opened it from the inside to stage a break-in!`);
        }, 500);
    } else {
        showNotification(`${testimonies[witnessId].name}'s testimony seems consistent with the evidence. Keep investigating...`, 'error');
    }
}

function closeTestimony() {
    const modal = document.getElementById('testimony-modal');
    modal.classList.remove('active');
}

function closeEvidence() {
    const modal = document.getElementById('evidence-modal');
    modal.classList.remove('active');
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#ffaa00',
        color: type === 'success' || type === 'error' ? 'white' : '#0a0a0f',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.95rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// SAVE/LOAD GAME PROGRESS
// ============================================

function saveGameProgress() {
    localStorage.setItem('caseFilesProgress', JSON.stringify(gameState.solvedCases));
}

function loadGameProgress() {
    const saved = localStorage.getItem('caseFilesProgress');
    if (saved) {
        gameState.solvedCases = JSON.parse(saved);

        // Unlock solved cases
        gameState.solvedCases.forEach(caseNumber => {
            unlockNextCase(caseNumber);
        });
    }
}

// ============================================
// CREDITS
// ============================================

function showCredits() {
    const creditsHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h2 style="font-family: 'Crimson Text', serif; font-size: 2.5rem; margin-bottom: 1rem; color: #d4af37;">
                Case Archives
            </h2>
            <p style="color: #a8a8b8; line-height: 1.8; max-width: 600px; margin: 0 auto;">
                Welcome to CASE FILES: The Unseen. Each case is a self-contained mystery 
                designed to challenge your detective skills. Solve cases to unlock new investigations.
            </p>
            <br>
            <p style="color: #6a6a7a; font-size: 0.9rem;">
                Cases Solved: ${gameState.solvedCases.length}
            </p>
        </div>
    `;

    showNotification('Feature coming soon: Full case archive viewer!', 'info');
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // ESC to go back
    if (e.key === 'Escape') {
        if (gameState.currentScreen.startsWith('case-')) {
            backToDesk();
        } else if (gameState.currentScreen === 'case-desk') {
            backToMenu();
        }
    }
});

// ============================================
// CLICK OUTSIDE TO CLOSE MODALS
// ============================================

// Close modals when clicking outside (on the backdrop)
document.addEventListener('click', (e) => {
    // Testimony Modal
    const testimonyModal = document.getElementById('testimony-modal');
    if (testimonyModal && e.target === testimonyModal) {
        closeTestimony();
    }

    // Evidence Modal
    const evidenceModal = document.getElementById('evidence-modal');
    if (evidenceModal && e.target === evidenceModal) {
        closeEvidence();
    }

    // Success Modal
    const successModal = document.getElementById('success-modal');
    if (successModal && e.target === successModal) {
        closeModal();
    }

    // Failure Modal
    const failureModal = document.getElementById('failure-modal');
    if (failureModal && e.target === failureModal) {
        closeModal();
    }
});

// ============================================
// CONSOLE EASTER EGG
// ============================================

console.log('%c🔍 CASE FILES: The Unseen', 'font-size: 24px; font-weight: bold; color: #d4af37;');
console.log('%cEvery shadow hides a secret...', 'font-size: 14px; color: #a8a8b8; font-style: italic;');
console.log('%c\nDeveloper Tools Detected! 🕵️', 'font-size: 12px; color: #00ff88;');
console.log('Tip: Use ESC key to navigate back through screens.');
console.log('Tip: Your progress is automatically saved to localStorage.');
