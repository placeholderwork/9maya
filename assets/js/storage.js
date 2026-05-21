// Storage Manager for 9maya Casino
const StorageManager = {
    key: '9maya_casino_data',
    
    // Get all data from localStorage
    getData() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : this.getDefaultData();
    },
    
    // Save data to localStorage
    saveData(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    },
    
    // Get default data structure
    getDefaultData() {
        return {
            balance: 1000,
            gamesPlayed: 0,
            totalWins: 0,
            totalLosses: 0,
            biggestWin: 0,
            history: []
        };
    },
    
    // Update balance
    updateBalance(amount) {
        const data = this.getData();
        data.balance += amount;
        if (data.balance < 0) data.balance = 0;
        this.saveData(data);
        return data.balance;
    },
    
    // Get current balance
    getBalance() {
        return this.getData().balance;
    },
    
    // Record game result
    recordGame(gameName, bet, winAmount) {
        const data = this.getData();
        data.gamesPlayed++;
        
        if (winAmount > 0) {
            data.totalWins++;
            if (winAmount > data.biggestWin) {
                data.biggestWin = winAmount;
            }
        } else {
            data.totalLosses++;
        }
        
        data.history.unshift({
            game: gameName,
            bet: bet,
            win: winAmount,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 games in history
        if (data.history.length > 50) {
            data.history = data.history.slice(0, 50);
        }
        
        this.saveData(data);
    },
    
    // Reset all data
    reset() {
        localStorage.removeItem(this.key);
        return this.getDefaultData();
    },
    
    // Get statistics
    getStats() {
        const data = this.getData();
        return {
            balance: data.balance,
            gamesPlayed: data.gamesPlayed,
            wins: data.totalWins,
            losses: data.totalLosses,
            biggestWin: data.biggestWin,
            winRate: data.gamesPlayed > 0 
                ? ((data.totalWins / data.gamesPlayed) * 100).toFixed(2) 
                : 0
        };
    }
};

// Export for use in other files
window.StorageManager = StorageManager;
