<script>
    import { roundStats, runStats, cash, currentRound, goToShopPhase, goToSortingPhase, nextRound } from './gameStore.js';
    import { initializeGame } from './gameLogic.js';
    
    function handleContinueToShop() {
        goToShopPhase();
    }
    
    function handleNextRound() {
        console.log('🎮 RewardPhase: handleNextRound() called');
        nextRound();
        initializeGame(); // Reset all game state including cards
        goToSortingPhase();
    }
    
    function handleSkipShop() {
        console.log('🎮 RewardPhase: handleSkipShop() called');
        nextRound();
        initializeGame(); // Reset all game state including cards
        goToSortingPhase();
    }
</script>

<div class="reward-container">
    <div class="reward-content">
        <header class="reward-header">
            <h1>✨ Round Complete! ✨</h1>
            <div class="round-info">Round {$currentRound} - Cards Sorted Successfully!</div>
        </header>
        
        <div class="reward-stats">
            <div class="stat-grid">
                <div class="stat-card hands-used">
                    <div class="stat-icon">👋</div>
                    <div class="stat-value">{$roundStats.handsUsed}</div>
                    <div class="stat-label">Hands Used</div>
                </div>
                
                <div class="stat-card hands-remaining">
                    <div class="stat-icon">✋</div>
                    <div class="stat-value">{$roundStats.handsRemaining}</div>
                    <div class="stat-label">Hands Saved</div>
                </div>
                
                <div class="stat-card cash-earned">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">${$roundStats.cashEarned}</div>
                    <div class="stat-label">Cash Earned</div>
                </div>
                
                <div class="stat-card actions-taken">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">{$roundStats.actionsTaken}</div>
                    <div class="stat-label">Actions Used</div>
                </div>
            </div>
            
            <div class="total-cash">
                <div class="total-label">Total Cash</div>
                <div class="total-value">${$cash}</div>
            </div>
        </div>
        
        <div class="run-summary">
            <h3>Run Summary</h3>
            <div class="summary-stats">
                <div class="summary-item">
                    <span>Rounds Completed:</span>
                    <span>{$runStats.totalRounds}</span>
                </div>
                <div class="summary-item">
                    <span>Total Cash Earned:</span>
                    <span>${$runStats.totalCashEarned}</span>
                </div>
                <div class="summary-item">
                    <span>Best Efficiency:</span>
                    <span>{$runStats.bestEfficiency} hands saved</span>
                </div>
                <div class="summary-item">
                    <span>Deck Size:</span>
                    <span>{$runStats.deckSize} cards</span>
                </div>
            </div>
        </div>
        
        <div class="reward-actions">
            <button class="action-button primary" on:click={handleContinueToShop}>
                🛒 Continue to Shop
            </button>
            <button class="action-button secondary" on:click={handleSkipShop}>
                ⏭️ Skip Shop & Next Round
            </button>
        </div>
    </div>
</div>

<style>
    .reward-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(8px);
    }
    
    .reward-content {
        background: linear-gradient(145deg, #ffffff, #f0f0f0);
        border-radius: 25px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        text-align: center;
    }
    
    .reward-header {
        margin-bottom: 30px;
    }
    
    .reward-header h1 {
        margin: 0 0 10px 0;
        color: #2d3748;
        font-size: 2.5rem;
        font-weight: bold;
    }
    
    .round-info {
        font-size: 1.2rem;
        color: #718096;
        font-weight: 600;
    }
    
    .reward-stats {
        margin-bottom: 30px;
    }
    
    .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 25px;
    }
    
    .stat-card {
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        padding: 20px;
        transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-3px);
    }
    
    .stat-icon {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 5px;
    }
    
    .stat-label {
        font-size: 0.9rem;
        color: #718096;
        font-weight: 600;
    }
    
    .hands-used .stat-value {
        color: #e53e3e;
    }
    
    .hands-remaining .stat-value {
        color: #48bb78;
    }
    
    .cash-earned .stat-value {
        color: #ed8936;
    }
    
    .actions-taken .stat-value {
        color: #4299e1;
    }
    
    .total-cash {
        background: linear-gradient(145deg, #ffd700, #ffed4e);
        border: 3px solid #f6e05e;
        border-radius: 20px;
        padding: 20px;
        margin-top: 20px;
    }
    
    .total-label {
        font-size: 1.1rem;
        color: #744210;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .total-value {
        font-size: 3rem;
        font-weight: bold;
        color: #744210;
    }
    
    .run-summary {
        background: linear-gradient(145deg, #edf2f7, #e2e8f0);
        border: 2px solid #cbd5e0;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 30px;
        text-align: left;
    }
    
    .run-summary h3 {
        margin: 0 0 20px 0;
        color: #2d3748;
        font-size: 1.3rem;
        text-align: center;
    }
    
    .summary-stats {
        display: grid;
        gap: 12px;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #cbd5e0;
    }
    
    .summary-item:last-child {
        border-bottom: none;
    }
    
    .summary-item span:first-child {
        color: #4a5568;
        font-weight: 500;
    }
    
    .summary-item span:last-child {
        color: #2d3748;
        font-weight: bold;
    }
    
    .reward-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .action-button {
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 180px;
    }
    
    .action-button.primary {
        background: linear-gradient(145deg, #667eea, #764ba2);
        color: white;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .action-button.primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
    }
    
    .action-button.secondary {
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        color: #4a5568;
        border: 2px solid #e2e8f0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .action-button.secondary:hover {
        transform: translateY(-2px);
        border-color: #cbd5e0;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .reward-content {
            padding: 30px 20px;
        }
        
        .stat-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .reward-actions {
            flex-direction: column;
            align-items: center;
        }
        
        .action-button {
            width: 100%;
            max-width: 250px;
        }
    }
</style>
