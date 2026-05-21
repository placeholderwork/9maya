// Slots Game for 9maya Casino
const SlotsGame = {
    symbols: ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '7️⃣'],
    isSpinning: false,
    
    init() {
        const spinBtn = document.getElementById('slots-spin');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spin());
        }
    },
    
    spin() {
        if (this.isSpinning) return;
        
        const betInput = document.getElementById('slots-bet');
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
        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        
        // Add spinning animation
        reels.forEach(reel => reel.classList.add('spinning'));
        
        // Stop reels one by one
        const results = [];
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning');
                const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                reel.textContent = symbol;
                results.push(symbol);
                
                if (index === 2) {
                    this.checkWin(results, bet);
                    this.isSpinning = false;
                }
            }, 500 + (index * 500));
        });
    },
    
    checkWin(results, bet) {
        let winAmount = 0;
        let message = '';
        
        // Check for wins
        if (results[0] === results[1] && results[1] === results[2]) {
            // Three of a kind
            const symbol = results[0];
            if (symbol === '7️⃣') {
                winAmount = bet * 50;
                message = 'ДЖЕКПОТ! 777! ';
            } else if (symbol === '💎') {
                winAmount = bet * 30;
                message = 'Алмазы! ';
            } else if (symbol === '⭐') {
                winAmount = bet * 20;
                message = 'Звезды! ';
            } else {
                winAmount = bet * 10;
                message = 'Отлично! ';
            }
            message += `+${winAmount} 💰`;
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            // Two of a kind
            winAmount = bet * 2;
            message = `Пара! +${winAmount} 💰`;
        } else {
            message = 'Попробуй еще раз!';
        }
        
        if (winAmount > 0) {
            StorageManager.updateBalance(winAmount);
            StorageManager.recordGame('slots', bet, winAmount - bet);
            this.showResult(message, 'win');
        } else {
            StorageManager.recordGame('slots', bet, -bet);
            this.showResult(message, 'lose');
        }
        
        updateBalanceDisplay();
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('slots-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => SlotsGame.init());
