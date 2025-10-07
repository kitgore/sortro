<script>
    import { cash, goToSortingPhase, nextRound, spendCash } from './gameStore.js';
    import { availableItems, purchasedItems, generateShopItems, purchaseItem, refreshShop, isItemPurchased, shopConfig } from './shopStore.js';
    import { initializeGame } from './gameLogic.js';
    import ShopItem from './ShopItem.svelte';
    
    function handleContinueToGame() {
        console.log('🎮 ShopPhase: handleContinueToGame() called');
        nextRound();
        initializeGame(); // Reset all game state including cards
        goToSortingPhase();
    }
    
    function handlePurchase(event) {
        const item = event.detail;
        console.log('💰 handlePurchase called for:', item.name, 'id:', item.id, 'cost:', item.cost);
        if (spendCash(item.cost)) {
            console.log('💰 Cash spent successfully, calling purchaseItem');
            const result = purchaseItem(item.id);
            console.log('💰 purchaseItem returned:', result);
        } else {
            console.log('❌ Not enough cash');
        }
    }
    
    function handleRefreshShop() {
        if (spendCash(shopConfig.refreshCost)) {
            refreshShop();
        }
    }
    
    // All items are actions now, no filtering needed
    $: filteredItems = $availableItems;
    
    // Utility function to get store value
    function get(store) {
        let value;
        store.subscribe(v => value = v)();
        return value;
    }
</script>

<div class="shop-container">
    <div class="shop-content">
        <header class="shop-header">
            <h1>🛒 Shop</h1>
            <div class="cash-display">
                <span>Cash: $</span>
                <span class="cash-amount">{$cash}</span>
            </div>
        </header>
        
        <div class="shop-controls">
            <div class="shop-header-info">
                <h2>🎴 Action Cards</h2>
                <p>Purchase new action cards to add to your deck</p>
            </div>
            
            <div class="shop-actions">
                <button 
                    class="refresh-button"
                    on:click={handleRefreshShop}
                    disabled={$cash < shopConfig.refreshCost}
                >
                    🔄 Refresh Shop (${shopConfig.refreshCost})
                </button>
            </div>
        </div>
        
        <div class="shop-items">
            {#if filteredItems.length > 0}
                <div class="items-grid">
                    {#each filteredItems as item (item.id)}
                        <ShopItem 
                            {item}
                            isPurchased={isItemPurchased(item.id)}
                            on:purchase={handlePurchase}
                        />
                    {/each}
                </div>
            {:else}
                <div class="empty-category">
                    <div class="empty-icon">📦</div>
                    <h3>No items in this category</h3>
                    <p>Try selecting a different category or refresh the shop.</p>
                </div>
            {/if}
        </div>
        
        {#if $purchasedItems.length > 0}
            <div class="purchased-items">
                <h3>Purchased This Round:</h3>
                <div class="purchased-list">
                    {#each $purchasedItems as item}
                        <div class="purchased-item">
                            <span class="item-icon">🎴</span>
                            <span class="item-name">{item.name}</span>
                            <span class="item-cost">${item.cost}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        
        <div class="shop-actions">
            <button class="action-button primary" on:click={handleContinueToGame}>
                ▶️ Continue to Next Round
            </button>
        </div>
    </div>
</div>

<style>
    .shop-container {
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
    
    .shop-content {
        background: linear-gradient(145deg, #ffffff, #f0f0f0);
        border-radius: 25px;
        padding: 40px;
        max-width: 800px;
        width: 90%;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        text-align: center;
    }
    
    .shop-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .shop-header h1 {
        margin: 0;
        color: #2d3748;
        font-size: 2.5rem;
        font-weight: bold;
    }
    
    .cash-display {
        background: linear-gradient(145deg, #ffd700, #ffed4e);
        color: #744210;
        padding: 10px 20px;
        border-radius: 15px;
        font-size: 1.2rem;
        font-weight: bold;
        border: 2px solid #f6e05e;
    }
    
    .cash-amount {
        font-size: 1.4rem;
    }
    
    .shop-controls {
        margin-bottom: 30px;
    }
    
    .shop-header-info {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .shop-header-info h2 {
        color: #2d3748;
        font-size: 1.8rem;
        margin: 0 0 8px 0;
        font-weight: bold;
    }
    
    .shop-header-info p {
        color: #718096;
        font-size: 1rem;
        margin: 0;
    }
    
    .refresh-button {
        padding: 10px 20px;
        border: 2px solid #4299e1;
        border-radius: 10px;
        background: linear-gradient(145deg, #ebf8ff, #bee3f8);
        color: #2c5282;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .refresh-button:hover:not(:disabled) {
        background: linear-gradient(145deg, #bee3f8, #90cdf4);
        transform: translateY(-2px);
    }
    
    .refresh-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .shop-items {
        margin-bottom: 30px;
    }
    
    .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .empty-category {
        padding: 40px;
        color: #718096;
    }
    
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 15px;
    }
    
    .empty-category h3 {
        color: #4a5568;
        margin-bottom: 10px;
    }
    
    .purchased-items {
        background: linear-gradient(145deg, #f0fff4, #c6f6d5);
        border: 2px solid #9ae6b4;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 30px;
        text-align: left;
    }
    
    .purchased-items h3 {
        color: #22543d;
        margin: 0 0 15px 0;
        text-align: center;
        font-size: 1.2rem;
    }
    
    .purchased-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .purchased-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
    }
    
    .purchased-item .item-icon {
        font-size: 1.2rem;
    }
    
    .purchased-item .item-name {
        flex: 1;
        font-weight: 600;
        color: #2d3748;
    }
    
    .purchased-item .item-cost {
        color: #22543d;
        font-weight: bold;
    }
    
    .shop-actions {
        display: flex;
        justify-content: center;
    }
    
    .action-button {
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
    }
    
    .action-button.primary {
        background: linear-gradient(145deg, #48bb78, #38a169);
        color: white;
        box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
    }
    
    .action-button.primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(72, 187, 120, 0.4);
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .shop-content {
            padding: 30px 20px;
        }
        
        .shop-header {
            flex-direction: column;
            gap: 15px;
        }
        
        .shop-header h1 {
            font-size: 2rem;
        }
    }
</style>
