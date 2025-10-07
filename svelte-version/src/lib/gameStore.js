import { writable, get } from 'svelte/store';

// Game configuration
export const gameConfig = {
    numberOfCards: 9,
    cardValues: null
};

// Game state stores
export const cards = writable([]);
export const selectedCards = writable([]);
export const actionBank = writable([]);
export const actionCount = writable(0);
export const isWon = writable(false);

// Cash economy stores
export const cash = writable(0);
export const startingHands = writable(9);
export const remainingHands = writable(9);
export const currentRound = writable(1);
export const gamePhase = writable('sorting'); // 'sorting' | 'reward' | 'shop'

// Enhanced phase management stores
export const roundStats = writable({
    handsUsed: 0,
    handsRemaining: 0,
    cashEarned: 0,
    actionsTaken: 0,
    timeElapsed: 0
});

export const runStats = writable({
    totalRounds: 0,
    totalCashEarned: 0,
    totalActionsUsed: 0,
    bestEfficiency: 0,
    deckSize: 10
});

// Available action types
export const availableActions = [
    {
        id: 'add',
        name: '+1',
        description: 'Add 1',
        requires: 1,
        styleName: 'requires-one'
    },
    {
        id: 'subtract',
        name: '-1',
        description: 'Subtract 1',
        requires: 1,
        styleName: 'requires-one'
    },
    {
        id: 'add2',
        name: '+2',
        description: 'Add 2',
        requires: 1,
        styleName: 'requires-one'
    },
    {
        id: 'subtract2',
        name: '-2',
        description: 'Subtract 2',
        requires: 1,
        styleName: 'requires-one'
    },
    {
        id: 'upshift',
        name: 'Upshift',
        description: 'Shift up by 1',
        requires: 2,
        styleName: 'shift-up'
    },
    {
        id: 'downshift',
        name: 'Downshift',
        description: 'Shift down by 1',
        requires: 2,
        styleName: 'shift-down'
    },
    {
        id: 'reverse',
        name: 'Reverse',
        description: 'Reverse order',
        requires: 2,
        styleName: 'requires-any'
    }
];

// Cash economy functions
export function startNewRound() {
    startingHands.set(gameConfig.numberOfCards);
    remainingHands.set(gameConfig.numberOfCards);
    console.log(`Round ${get(currentRound)} started with ${gameConfig.numberOfCards} hands`);
}

export function useHand() {
    remainingHands.update(hands => {
        if (hands > 0) {
            const newHands = hands - 1;
            console.log(`Used hand, ${newHands} remaining`);
            return newHands;
        }
        return hands;
    });
}

export function completeRound() {
    const remaining = get(remainingHands);
    const starting = get(startingHands);
    const currentCash = get(cash);
    const actionsTaken = get(actionCount);
    const cashEarned = remaining * 1; // Base value of 1 cash per remaining hand
    
    // Update round stats
    const stats = {
        handsUsed: starting - remaining,
        handsRemaining: remaining,
        cashEarned: cashEarned,
        actionsTaken: actionsTaken,
        timeElapsed: Date.now() // Simple time tracking for now
    };
    roundStats.set(stats);
    
    // Update cash
    cash.update(currentCash => {
        const newCash = currentCash + cashEarned;
        console.log(`Round complete! Earned ${cashEarned} cash (${remaining} hands × 1). Total cash: ${newCash}`);
        return newCash;
    });
    
    // Update run stats
    runStats.update(run => ({
        ...run,
        totalRounds: run.totalRounds + 1,
        totalCashEarned: run.totalCashEarned + cashEarned,
        totalActionsUsed: run.totalActionsUsed + actionsTaken,
        bestEfficiency: Math.max(run.bestEfficiency, remaining)
    }));
    
    // Transition to reward phase
    gamePhase.set('reward');
    
    return {
        ...stats,
        totalCash: currentCash + cashEarned
    };
}

export function spendCash(amount) {
    let success = false;
    cash.update(currentCash => {
        if (currentCash >= amount) {
            success = true;
            const newCash = currentCash - amount;
            console.log(`Spent ${amount} cash. Remaining: ${newCash}`);
            return newCash;
        } else {
            console.log(`Insufficient cash! Need ${amount}, have ${currentCash}`);
            return currentCash;
        }
    });
    return success;
}

export function canAfford(amount) {
    return get(cash) >= amount;
}

export function nextRound() {
    currentRound.update(round => round + 1);
    gamePhase.set('sorting');
    // Note: initializeGame will be called from the component that uses nextRound
}

// Phase transition functions
export function goToRewardPhase() {
    gamePhase.set('reward');
}

export function goToShopPhase() {
    gamePhase.set('shop');
    // Generate shop items when entering shop
    import('./shopStore.js').then(({ generateShopItems }) => {
        generateShopItems();
    });
}

export function goToSortingPhase() {
    gamePhase.set('sorting');
}

export function resetRun() {
    currentRound.set(1);
    cash.set(0);
    gamePhase.set('sorting');
    roundStats.set({
        handsUsed: 0,
        handsRemaining: 0,
        cashEarned: 0,
        actionsTaken: 0,
        timeElapsed: 0
    });
    runStats.set({
        totalRounds: 0,
        totalCashEarned: 0,
        totalActionsUsed: 0,
        bestEfficiency: 0,
        deckSize: 10
    });
    console.log('Run reset to start');
}