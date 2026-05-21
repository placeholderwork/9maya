// Roulette Game for 9maya Casino
const RouletteGame = {
    selectedBet: null,
    isSpinning: false,
    
    init() {
        const spinBtn = document.getElementById('roulette-spin');
        const betOptions = document.querySelectorAll('.bet-option[data-bet]');
        
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spin());
        }
        
        betOptions.forEach(option => {
            option.addEventListener('click', () => {
                betOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedBet = option.dataset.bet;
            });
        });
    },
    
    spin() {
        if (this.isSpinning) return;
        if (!this.selectedBet) {
            this.showResult('Выберите ставку!', 'lose');
            return;
        }
        
        const betInput = document.getElementById('roulette-bet');
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
        const wheel = document.getElementById('roulette-wheel');
        wheel.classList.add('spinning');
        
        // Determine result after animation
        setTimeout(() => {
            wheel.classList.remove('spinning');
            
            // Generate random result (0-36)
            const result = Math.floor(Math.random() * 37);
            let color;
            
            if (result === 0) {
                color = 'green';
                wheel.textContent = '🟢';
            } else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(result)) {
                color = 'red';
                wheel.textContent = '🔴';
            } else {
                color = 'black';
                wheel.textContent = '⚫';
            }
            
            this.checkWin(color, result, bet);
            this.isSpinning = false;
        }, 3000);
    },
    
    checkWin(color, number, bet) {
        let winAmount = 0;
        let message = `Выпало ${number} (${color === 'red' ? '🔴' : color === 'black' ? '⚫' : '🟢'}) `;
        
        if (this.selectedBet === color) {
            if (color === 'green') {
                winAmount = bet * 14;
                message += `ДЖЕКПОТ! +${winAmount} 💰`;
            } else {
                winAmount = bet * 2;
                message += `Победа! +${winAmount} 💰`;
            }
        } else {
            message += 'Попробуй еще раз!';
        }
        
        if (winAmount > 0) {
            StorageManager.updateBalance(winAmount);
            StorageManager.recordGame('roulette', bet, winAmount - bet);
            this.showResult(message, 'win');
        } else {
            StorageManager.recordGame('roulette', bet, -bet);
            this.showResult(message, 'lose');
        }
        
        updateBalanceDisplay();
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('roulette-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => RouletteGame.init());
