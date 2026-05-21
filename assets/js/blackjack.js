// Blackjack Game for 9maya Casino
const BlackjackGame = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    currentBet: 0,
    gameActive: false,
    
    cards: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    suits: ['♠', '♥', '♦', '♣'],
    
    init() {
        const dealBtn = document.getElementById('blackjack-deal');
        const hitBtn = document.getElementById('bj-hit');
        const standBtn = document.getElementById('bj-stand');
        
        if (dealBtn) dealBtn.addEventListener('click', () => this.deal());
        if (hitBtn) hitBtn.addEventListener('click', () => this.hit());
        if (standBtn) standBtn.addEventListener('click', () => this.stand());
    },
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let card of this.cards) {
                this.deck.push({ card, suit });
            }
        }
        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },
    
    getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.card)) return 10;
        if (card.card === 'A') return 11;
        return parseInt(card.card);
    },
    
    calculateHand(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            value += this.getCardValue(card);
            if (card.card === 'A') aces++;
        }
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    },
    
    renderCard(card, container) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = `${card.card}${card.suit}`;
        container.appendChild(cardEl);
    },
    
    deal() {
        if (this.gameActive) return;
        
        const betInput = document.getElementById('blackjack-bet');
        this.currentBet = parseInt(betInput.value);
        const balance = StorageManager.getBalance();
        
        if (this.currentBet <= 0 || this.currentBet > balance) {
            this.showResult('Недостаточно средств!', 'lose');
            return;
        }
        
        // Deduct bet
        StorageManager.updateBalance(-this.currentBet);
        updateBalanceDisplay();
        
        this.createDeck();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        this.gameActive = true;
        
        // Render hands
        const playerCards = document.getElementById('player-cards');
        const dealerCards = document.getElementById('dealer-cards');
        playerCards.innerHTML = '';
        dealerCards.innerHTML = '';
        
        this.playerHand.forEach(card => this.renderCard(card, playerCards));
        // Show only first dealer card
        this.renderCard(this.dealerHand[0], dealerCards);
        
        // Update scores
        document.getElementById('player-score').textContent = this.calculateHand(this.playerHand);
        document.getElementById('dealer-score').textContent = '?';
        
        // Show action buttons
        document.getElementById('bj-actions').classList.remove('hidden');
        document.getElementById('blackjack-deal').disabled = true;
        
        // Check for blackjack
        if (this.calculateHand(this.playerHand) === 21) {
            this.stand();
        }
        
        this.showResult('Ваш ход!', '');
    },
    
    hit() {
        if (!this.gameActive) return;
        
        this.playerHand.push(this.deck.pop());
        
        const playerCards = document.getElementById('player-cards');
        playerCards.innerHTML = '';
        this.playerHand.forEach(card => this.renderCard(card, playerCards));
        
        const playerScore = this.calculateHand(this.playerHand);
        document.getElementById('player-score').textContent = playerScore;
        
        if (playerScore > 21) {
            this.endGame('Перебор! Вы проиграли!', 'lose');
        }
    },
    
    stand() {
        if (!this.gameActive) return;
        
        // Dealer plays
        let dealerScore = this.calculateHand(this.dealerHand);
        
        const dealerCards = document.getElementById('dealer-cards');
        dealerCards.innerHTML = '';
        this.dealerHand.forEach(card => this.renderCard(card, dealerCards));
        
        while (dealerScore < 17) {
            this.dealerHand.push(this.deck.pop());
            dealerScore = this.calculateHand(this.dealerHand);
            
            dealerCards.innerHTML = '';
            this.dealerHand.forEach(card => this.renderCard(card, dealerCards));
        }
        
        document.getElementById('dealer-score').textContent = dealerScore;
        
        // Determine winner
        const playerScore = this.calculateHand(this.playerHand);
        
        if (dealerScore > 21) {
            this.endGame('Дилер перебрал! Вы выиграли!', 'win', this.currentBet * 2);
        } else if (playerScore > dealerScore) {
            this.endGame('Победа!', 'win', this.currentBet * 2);
        } else if (playerScore === dealerScore) {
            this.endGame('Ничья!', '', this.currentBet);
        } else {
            this.endGame('Дилер выиграл!', 'lose');
        }
    },
    
    endGame(message, type, winAmount = 0) {
        this.gameActive = false;
        
        if (winAmount > 0) {
            StorageManager.updateBalance(winAmount);
            StorageManager.recordGame('blackjack', this.currentBet, winAmount - this.currentBet);
        } else {
            StorageManager.recordGame('blackjack', this.currentBet, -this.currentBet);
        }
        
        this.showResult(message, type);
        updateBalanceDisplay();
        
        document.getElementById('bj-actions').classList.add('hidden');
        document.getElementById('blackjack-deal').disabled = false;
    },
    
    showResult(message, type) {
        const resultElement = document.getElementById('blackjack-result');
        resultElement.textContent = message;
        resultElement.className = 'game-result ' + type;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => BlackjackGame.init());
