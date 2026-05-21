// Crash Game for 9maya Casino
const CrashGame = {
    multiplier: 1.00,
    crashPoint: 0,
    isRunning: false,
    currentBet: 0,
    cashedOut: false,
    animationFrame: null,
    
    init() {
        const startBtn = document.getElementById('crash-start');
        const cashoutBtn = document.getElementById('crash-cashout');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        if (cashoutBtn) {
            cashoutBtn.addEventListener('click', () => this.cashout());
        }
    },
    
    start() {
        if (this.isRunning) return;
        
        const betInput = document.getElementById('crash-bet');
        this.currentBet = parseInt(betInput.value);
        const balance = StorageManager.getBalance();
        
        if (this.currentBet <= 0 || this.currentBet > balance) {
            this.showResult('Недостаточно средств!', 'lose');
            return;
        }
        
        // Deduct bet
        StorageManager.updateBalance(-this.currentBet);
        updateBalanceDisplay();
        
        // Generate crash point (weighted towards lower numbers)
        this.crashPoint = this.generateCrashPoint();
        console.log('Crash point:', this.crashPoint); // For debugging
        
        this.multiplier = 1.00;
        this.isRunning = true;
        this.cashedOut = false;
        
        // Update UI
        document.getElementById('crash-start').disabled = true;
        document.getElementById('crash-cashout').classList.remove('hidden');
        document.getElementById('crash-cashout').disabled = false;
        
        const multiplierEl = document.getElementById('crash-multiplier');
        multiplierEl.textContent = '1.00x';
        multiplierEl.classList.remove('crashed');
        
        this.showResult('Нажми "Забрать" до краша!', '');
        
        // Start animation
        this.animate();
    },
    
    generateCrashPoint() {
        // Generate crash point with house edge
        // Most crashes happen early, but can go very high
        const r = Math.random();
        
        // 1% chance of instant crash at 1.00
        if (r < 0.01) return 1.00;
        
        // Use inverse distribution for realistic crash curve
        const crash = 0.99 / (1 - r);
        
        // Cap at reasonable maximum but allow big wins
        return Math.min(Math.max(1.00, crash), 100);
    },
    
    animate() {
        if (!this.isRunning) return;
        
        // Increase multiplier exponentially
        this.multiplier += 0.01 + (this.multiplier * 0.008);
        
        const multiplierEl = document.getElementById('crash-multiplier');
        multiplierEl.textContent = `${this.multiplier.toFixed(2)}x`;
        
        // Check for crash
        if (this.multiplier >= this.crashPoint) {
            this.crash();
        } else {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    },
    
    cashout() {
        if (!this.isRunning || this.cashedOut) return;
        
        this.cashedOut = true;
        const winAmount = Math.floor(this.currentBet * this.multiplier);
        
        StorageManager.updateBalance(winAmount);
        StorageManager.recordGame('crash', this.currentBet, winAmount - this.currentBet);
        
        this.showResult(`Вы забрали ${winAmount} 💰`, 'win');
        updateBalanceDisplay();
        
        document.getElementById('crash-cashout').disabled = true;
    },
    
    crash() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrame);
        
        const multiplierEl = document.getElementById('crash-multiplier');
        multiplierEl.textContent = `${this.crashPoint.toFixed(2)}x`;
        multiplierEl.classList.add('crashed');
        
        if (!this.cashedOut) {
            StorageManager.recordGame('crash', this.currentBet, -this.currentBet);
            this.showResult(`Краш на ${this.crashPoint.toFixed(2)}x! Вы проиграли!`, 'lose');
        } else {
            this.showResult(`Краш на ${this.crashPoint.toFixed(2)}x! Вы успели!`, 'win');
        }
        
        // Reset UI
        document.getElementById('crash-start').disabled = false;
        document.getElementById('crash-cashout').classList.add('hidden');
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('crash-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => CrashGame.init());
