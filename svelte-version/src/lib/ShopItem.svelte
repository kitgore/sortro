<script>
    import { createEventDispatcher } from 'svelte';
    import { cash, canAfford } from './gameStore.js';
    import { isItemPurchased } from './shopStore.js';
    
    export let item;
    export let isPurchased = false;
    
    const dispatch = createEventDispatcher();
    
    function handlePurchase() {
        if (!isPurchased && canAfford(item.cost)) {
            dispatch('purchase', item);
        }
    }
    
    function getRarityColor(rarity) {
        switch (rarity) {
            case 'common': return '#718096';
            case 'rare': return '#4299e1';
            case 'epic': return '#9f7aea';
            case 'legendary': return '#ed8936';
            default: return '#718096';
        }
    }
    
    function getTypeIcon(type) {
        return '🎴'; // All items are action cards now
    }
    
    function getCategoryColor(category) {
        return '#48bb78'; // All items are actions, so green color
    }
</script>

<div 
    class="shop-item" 
    class:purchased={isPurchased}
    class:affordable={canAfford(item.cost) && !isPurchased}
    class:unaffordable={!canAfford(item.cost) && !isPurchased}
>
    <div class="item-header">
        <div class="item-icon">{getTypeIcon(item.type)}</div>
        <div class="item-info">
            <div class="item-name">{item.name}</div>
            <div class="item-type" style="color: {getCategoryColor('action')}">
                Action Card
            </div>
        </div>
        <div class="item-rarity" style="color: {getRarityColor(item.rarity)}">
            {item.rarity}
        </div>
    </div>
    
    <div class="item-description">
        {item.description}
    </div>
    
    <div class="item-footer">
        <div class="item-cost">
            {#if isPurchased}
                <span class="cost-text purchased">PURCHASED</span>
            {:else}
                <span class="cost-text">${item.cost}</span>
            {/if}
        </div>
        
        <button 
            class="purchase-button"
            class:purchased={isPurchased}
            class:affordable={canAfford(item.cost) && !isPurchased}
            class:unaffordable={!canAfford(item.cost) && !isPurchased}
            on:click={handlePurchase}
            disabled={isPurchased || !canAfford(item.cost)}
        >
            {#if isPurchased}
                ✓ Purchased
            {:else if canAfford(item.cost)}
                Buy
            {:else}
                Too Expensive
            {/if}
        </button>
    </div>
</div>

<style>
    .shop-item {
        background: linear-gradient(145deg, #ffffff, #f0f0f0);
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .shop-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }
    
    .shop-item.affordable {
        border-color: #48bb78;
        box-shadow: 0 4px 15px rgba(72, 187, 120, 0.2);
    }
    
    .shop-item.affordable:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
    }
    
    .shop-item.affordable:hover::before {
        left: 100%;
    }
    
    .shop-item.unaffordable {
        border-color: #e53e3e;
        opacity: 0.7;
    }
    
    .shop-item.purchased {
        border-color: #9f7aea;
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        opacity: 0.8;
    }
    
    .item-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        gap: 15px;
    }
    
    .item-icon {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        border-radius: 10px;
        border: 2px solid #e2e8f0;
    }
    
    .item-info {
        flex: 1;
    }
    
    .item-name {
        font-size: 1.3rem;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 4px;
    }
    
    .item-type {
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: capitalize;
    }
    
    .item-rarity {
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.1);
    }
    
    .item-description {
        color: #4a5568;
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 20px;
        min-height: 40px;
    }
    
    .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .item-cost {
        font-size: 1.2rem;
        font-weight: bold;
    }
    
    .cost-text {
        color: #2d3748;
    }
    
    .cost-text.purchased {
        color: #9f7aea;
    }
    
    .purchase-button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 120px;
    }
    
    .purchase-button.affordable {
        background: linear-gradient(145deg, #48bb78, #38a169);
        color: white;
        box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
    }
    
    .purchase-button.affordable:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
    }
    
    .purchase-button.unaffordable {
        background: linear-gradient(145deg, #e2e8f0, #cbd5e0);
        color: #a0aec0;
        cursor: not-allowed;
    }
    
    .purchase-button.purchased {
        background: linear-gradient(145deg, #9f7aea, #805ad5);
        color: white;
        cursor: default;
    }
    
    .purchase-button:disabled {
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .shop-item {
            padding: 15px;
        }
        
        .item-header {
            gap: 10px;
        }
        
        .item-icon {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
        }
        
        .item-name {
            font-size: 1.1rem;
        }
        
        .item-footer {
            flex-direction: column;
            gap: 10px;
        }
        
        .purchase-button {
            width: 100%;
        }
    }
</style>
