// Intro Animation for 9maya Casino
document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    const mainContainer = document.getElementById('main-container');
    const introLogo = document.getElementById('introLogo');
    const introText = document.getElementById('introText');
    
    // Set the name before 's work
    const playerName = "9maya";
    introText.textContent = `${playerName}'s work`;
    
    // Timeline for intro animation
    setTimeout(() => {
        // Start fade out after 4 seconds
        intro.classList.add('fade-out');
        
        // Show main container
        setTimeout(() => {
            intro.style.display = 'none';
            mainContainer.classList.remove('hidden');
            mainContainer.classList.add('visible');
            
            // Initialize balance display
            updateBalanceDisplay();
        }, 1000);
    }, 4000);
});

// Helper function to update balance display
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = StorageManager.getBalance();
    }
}
