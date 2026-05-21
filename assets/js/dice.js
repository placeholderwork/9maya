// Dice Game for 9maya Casino
const DiceGame = {
    selectedBet: null,
    isRolling: false,
    
    init() {
        const rollBtn = document.getElementById('dice-roll');
        const betOptions = document.querySelectorAll('#game-dice .bet-option');
        
        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.roll());
        }
        
        betOptions.forEach(option => {
            option.addEventListener('click', () => {
                betOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedBet = option.dataset.bet;
            });
        });
    },
    
    roll() {
        if (this.isRolling) return;
        if (!this.selectedBet) {
            this.showResult('Выберите ставку!', 'lose');
            return;
        }
        
        const betInput = document.getElementById('dice-bet');
        const bet = parseInt(betInput.value);
        const balance = StorageManager.getBalance();
        
        if (bet <= 0 || bet > balance) {
            this.showResult('Недостаточно средств!', 'lose');
            return;
        }
        
        // Deduct bet
        StorageManager.updateBalance(-bet);
        updateBalanceDisplay();
        
        this.isRolling = true;
        const diceDisplay = document.getElementById('dice-display');
        
        // Animate dice
        let rolls = 0;
        const animation = setInterval(() => {
            const tempRoll = Math.floor(Math.random() * 11) + 2;
            diceDisplay.textContent = `🎲 ${tempRoll}`;
            rolls++;
            
            if (rolls >= 10) {
                clearInterval(animation);
                this.finishRoll(bet);
            }
        }, 100);
    },
    
    finishRoll(bet) {
        // Roll two dice (2-12)
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const total = die1 + die2;
        
        const diceDisplay = document.getElementById('dice-display');
        diceDisplay.textContent = `🎲 ${die1} + ${die2} = ${total}`;
        
        this.checkWin(total, bet);
        this.isRolling = false;
    },
    
    checkWin(total, bet) {
        let winAmount = 0;
        let message = `Выпало ${total} `;
        
        if (this.selectedBet === 'over7' && total > 7) {
            winAmount = bet * 2;
            message += `Победа! +${winAmount} 💰`;
        } else if (this.selectedBet === 'under7' && total < 7) {
            winAmount = bet * 2;
            message += `Победа! +${winAmount} 💰`;
        } else if (this.selectedBet === 'exact7' && total === 7) {
            winAmount = bet * 4;
            message += `ДЖЕКПОТ! +${winAmount} 💰`;
        } else {
            message += 'Попробуй еще раз!';
        }
        
        if (winAmount > 0) {
            StorageManager.updateBalance(winAmount);
            StorageManager.recordGame('dice', bet, winAmount - bet);
            this.showResult(message, 'win');
        } else {
            StorageManager.recordGame('dice', bet, -bet);
            this.showResult(message, 'lose');
        }
        
        updateBalanceDisplay();
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('dice-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => DiceGame.init());
