// Mines Game for 9maya Casino
const MinesGame = {
    gridSize: 25,
    minesCount: 5,
    mines: [],
    revealed: [],
    gameActive: false,
    currentBet: 0,
    currentMultiplier: 1,
    
    init() {
        const startBtn = document.getElementById('mines-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
    },
    
    start() {
        if (this.gameActive) {
            this.cashout();
            return;
        }
        
        const betInput = document.getElementById('mines-bet');
        this.currentBet = parseInt(betInput.value);
        const balance = StorageManager.getBalance();
        
        if (this.currentBet <= 0 || this.currentBet > balance) {
            this.showResult('Недостаточно средств!', 'lose');
            return;
        }
        
        // Deduct bet
        StorageManager.updateBalance(-this.currentBet);
        updateBalanceDisplay();
        
        // Initialize game
        this.mines = [];
        this.revealed = [];
        this.gameActive = true;
        this.currentMultiplier = 1;
        
        // Place mines randomly
        while (this.mines.length < this.minesCount) {
            const pos = Math.floor(Math.random() * this.gridSize);
            if (!this.mines.includes(pos)) {
                this.mines.push(pos);
            }
        }
        
        // Create grid
        this.renderGrid();
        
        // Update button
        document.getElementById('mines-start').textContent = 'Забрать';
        this.showResult(`Найдено: 0/${this.gridSize - this.minesCount} 💎`, '');
    },
    
    renderGrid() {
        const grid = document.getElementById('mines-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'mine-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.clickCell(i));
            grid.appendChild(cell);
        }
    },
    
    clickCell(index) {
        if (!this.gameActive || this.revealed.includes(index)) return;
        
        const cell = document.querySelector(`.mine-cell[data-index="${index}"]`);
        this.revealed.push(index);
        cell.classList.add('revealed');
        
        if (this.mines.includes(index)) {
            // Hit a mine!
            cell.classList.add('bomb');
            cell.textContent = '💣';
            this.gameOver(false);
        } else {
            // Found a gem!
            cell.classList.add('gem');
            cell.textContent = '💎';
            
            // Increase multiplier
            this.currentMultiplier *= 1.2;
            const potentialWin = Math.floor(this.currentBet * this.currentMultiplier);
            
            this.showResult(`Потенциальный выигрыш: ${potentialWin} 💰`, 'win');
            
            // Check if all gems found
            if (this.revealed.length === this.gridSize - this.minesCount) {
                this.cashout();
            }
        }
    },
    
    cashout() {
        if (!this.gameActive) return;
        
        const winAmount = Math.floor(this.currentBet * this.currentMultiplier);
        StorageManager.updateBalance(winAmount);
        StorageManager.recordGame('mines', this.currentBet, winAmount - this.currentBet);
        
        this.showResult(`Выигрыш: ${winAmount} 💰`, 'win');
        updateBalanceDisplay();
        
        this.revealAll();
        this.gameActive = false;
        document.getElementById('mines-start').textContent = 'Начать';
    },
    
    gameOver(win) {
        this.gameActive = false;
        
        if (!win) {
            StorageManager.recordGame('mines', this.currentBet, -this.currentBet);
            this.showResult('Бум! Вы проиграли!', 'lose');
        }
        
        this.revealAll();
        document.getElementById('mines-start').textContent = 'Начать';
    },
    
    revealAll() {
        const cells = document.querySelectorAll('.mine-cell');
        cells.forEach((cell, index) => {
            cell.classList.add('revealed');
            if (this.mines.includes(index)) {
                cell.classList.add('bomb');
                cell.textContent = '💣';
            } else if (!cell.textContent) {
                cell.classList.add('gem');
                cell.textContent = '💎';
            }
        });
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('mines-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => MinesGame.init());
