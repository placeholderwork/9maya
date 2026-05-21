// Plinko Game for 9maya Casino
const PlinkoGame = {
    rows: 8,
    pegs: [],
    ball: null,
    isDropping: false,
    currentBet: 0,
    multipliers: [10, 5, 2, 1, 0.5, 1, 2, 5, 10],
    
    init() {
        const dropBtn = document.getElementById('plinko-drop');
        if (dropBtn) {
            dropBtn.addEventListener('click', () => this.drop());
        }
        
        this.renderBoard();
    },
    
    renderBoard() {
        const board = document.getElementById('plinko-board');
        board.innerHTML = '';
        
        // Create pegs
        for (let row = 0; row < this.rows; row++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'plinko-row';
            
            for (let col = 0; col <= row; col++) {
                const peg = document.createElement('div');
                peg.className = 'plinko-peg';
                rowEl.appendChild(peg);
            }
            
            board.appendChild(rowEl);
        }
        
        // Create multiplier slots
        const slotsRow = document.createElement('div');
        slotsRow.className = 'plinko-row';
        
        this.multipliers.forEach(mult => {
            const slot = document.createElement('div');
            slot.className = 'plinko-slot';
            slot.textContent = `${mult}x`;
            slot.style.background = mult >= 5 ? 'rgba(0, 184, 148, 0.3)' : 
                                   mult >= 2 ? 'rgba(0, 206, 201, 0.3)' : 
                                   mult >= 1 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(233, 69, 96, 0.3)';
            slotsRow.appendChild(slot);
        });
        
        board.appendChild(slotsRow);
    },
    
    drop() {
        if (this.isDropping) return;
        
        const betInput = document.getElementById('plinko-bet');
        this.currentBet = parseInt(betInput.value);
        const balance = StorageManager.getBalance();
        
        if (this.currentBet <= 0 || this.currentBet > balance) {
            this.showResult('Недостаточно средств!', 'lose');
            return;
        }
        
        // Deduct bet
        StorageManager.updateBalance(-this.currentBet);
        updateBalanceDisplay();
        
        this.isDropping = true;
        
        // Create ball
        const board = document.getElementById('plinko-board');
        this.ball = document.createElement('div');
        this.ball.className = 'plinko-peg';
        this.ball.style.background = '#e94560';
        this.ball.style.position = 'absolute';
        this.ball.style.left = '50%';
        this.ball.style.top = '10px';
        this.ball.style.transform = 'translateX(-50%)';
        this.ball.style.zIndex = '100';
        board.appendChild(this.ball);
        
        // Animate ball dropping
        this.animateBall(0, 0);
    },
    
    animateBall(row, position) {
        if (row >= this.rows) {
            // Ball reached bottom
            this.finishDrop(position);
            return;
        }
        
        setTimeout(() => {
            // Random direction (left or right)
            const direction = Math.random() > 0.5 ? 1 : -1;
            const newPosition = position + (direction * 0.5);
            
            // Update ball position
            const board = document.getElementById('plinko-board');
            const boardRect = board.getBoundingClientRect();
            const slotWidth = boardRect.width / this.multipliers.length;
            
            this.ball.style.top = `${20 + (row * 35)}px`;
            this.ball.style.left = `${50 + (newPosition * 15)}%`;
            
            this.animateBall(row + 1, newPosition);
        }, 200);
    },
    
    finishDrop(finalPosition) {
        // Determine which slot the ball landed in
        const slotIndex = Math.floor((finalPosition + this.multipliers.length / 2));
        const clampedIndex = Math.max(0, Math.min(slotIndex, this.multipliers.length - 1));
        const multiplier = this.multipliers[clampedIndex];
        
        const winAmount = Math.floor(this.currentBet * multiplier);
        
        let message = `${multiplier}x `;
        if (winAmount > 0) {
            message += `+${winAmount} 💰`;
        } else {
            message += 'Попробуй еще раз!';
        }
        
        if (winAmount > 0) {
            StorageManager.updateBalance(winAmount);
            StorageManager.recordGame('plinko', this.currentBet, winAmount - this.currentBet);
            this.showResult(message, 'win');
        } else {
            StorageManager.recordGame('plinko', this.currentBet, -this.currentBet);
            this.showResult(message, 'lose');
        }
        
        updateBalanceDisplay();
        
        // Remove ball
        if (this.ball) {
            this.ball.remove();
            this.ball = null;
        }
        
        this.isDropping = false;
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('plinko-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => PlinkoGame.init());
