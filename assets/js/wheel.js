// Wheel of Fortune Game for 9maya Casino
const WheelGame = {
    isSpinning: false,
    segments: [
        { value: 0, label: '💀' },
        { value: 2, label: 'x2' },
        { value: 5, label: 'x5' },
        { value: 0, label: '💀' },
        { value: 3, label: 'x3' },
        { value: 10, label: 'x10' },
        { value: 0, label: '💀' },
        { value: 1.5, label: 'x1.5' }
    ],
    
    init() {
        const spinBtn = document.getElementById('wheel-spin');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spin());
        }
    },
    
    spin() {
        if (this.isSpinning) return;
        
        const betInput = document.getElementById('wheel-bet');
        const bet = parseInt(betInput.value);
        const balance = StorageManager.getBalance();
        
        if (bet <= 0 || bet > balance) {
            this.showResult('Недостаточно средств!', 'lose');
            return;
        }
        
        // Deduct bet
        StorageManager.updateBalance(-bet);
        updateBalanceDisplay();
        
        this.isSpinning = true;
        const wheel = document.getElementById('fortune-wheel');
        
        // Random rotation (minimum 3 full rotations + random segment)
        const randomIndex = Math.floor(Math.random() * this.segments.length);
        const segmentAngle = 360 / this.segments.length;
        const totalRotation = 1080 + (randomIndex * segmentAngle);
        
        wheel.style.transform = `rotate(${totalRotation}deg)`;
        wheel.classList.add('spinning');
        
        // Determine result after animation
        setTimeout(() => {
            wheel.classList.remove('spinning');
            const result = this.segments[randomIndex];
            
            let winAmount = 0;
            let message = `${result.label} `;
            
            if (result.value > 0) {
                winAmount = Math.floor(bet * result.value);
                message += `+${winAmount} 💰`;
            } else {
                message += 'Попробуй еще раз!';
            }
            
            if (winAmount > 0) {
                StorageManager.updateBalance(winAmount);
                StorageManager.recordGame('wheel', bet, winAmount - bet);
                this.showResult(message, 'win');
            } else {
                StorageManager.recordGame('wheel', bet, -bet);
                this.showResult(message, 'lose');
            }
            
            updateBalanceDisplay();
            
            // Reset wheel rotation for next spin
            setTimeout(() => {
                wheel.style.transition = 'none';
                wheel.style.transform = 'rotate(0deg)';
                setTimeout(() => {
                    wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
                }, 50);
            }, 1000);
            
            this.isSpinning = false;
        }, 3000);
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('wheel-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => WheelGame.init());
