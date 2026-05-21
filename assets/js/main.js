// Main JavaScript for 9maya Casino
document.addEventListener('DOMContentLoaded', () => {
    // Navigation between games
    const navBtns = document.querySelectorAll('.nav-btn');
    const gamePanels = document.querySelectorAll('.game-panel');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            navBtns.forEach(b => b.classList.remove('active'));
            gamePanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            btn.classList.add('active');
            const gameName = btn.dataset.game;
            document.getElementById(`game-${gameName}`).classList.add('active');
        });
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
                StorageManager.reset();
                updateBalanceDisplay();
                alert('Прогресс сброшен! Баланс: 1000 💰');
            }
        });
    }
    
    // Initialize balance display
    updateBalanceDisplay();
});

// Global helper function to update balance display
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = StorageManager.getBalance();
    }
}

// Prevent accidental page navigation during games
window.addEventListener('beforeunload', (e) => {
    const hasActiveGame = 
        document.querySelector('.game-panel.active') && 
        (document.getElementById('bj-actions') && !document.getElementById('bj-actions').classList.contains('hidden') ||
         MinesGame?.gameActive ||
         CrashGame?.isRunning);
    
    if (hasActiveGame) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to spin/play in active game
    if (e.code === 'Space') {
        const activePanel = document.querySelector('.game-panel.active');
        if (activePanel) {
            const actionBtn = activePanel.querySelector('.btn-action:not(.hidden):not(:disabled)');
            if (actionBtn) {
                e.preventDefault();
                actionBtn.click();
            }
        }
    }
    
    // Number keys 1-8 to switch games
    if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key) - 1;
        const navBtns = document.querySelectorAll('.nav-btn');
        if (navBtns[index]) {
            navBtns[index].click();
        }
    }
});

// Console welcome message
console.log('%c🎰 9maya Casino 🎰', 'font-size: 24px; font-weight: bold; color: #e94560;');
console.log('%cДобро пожаловать в казино 9maya!', 'font-size: 14px; color: #ffd700;');
console.log('%cЭто шуточное казино для развлечения. Удачи! 🍀', 'font-size: 12px; color: #00b894;');
