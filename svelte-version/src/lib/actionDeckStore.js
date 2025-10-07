import { writable } from 'svelte/store';
import { actionCardDeclarations, allActionCards, baseDeckComposition } from './actionDeclarations.js';

// Re-export for backwards compatibility
export { allActionCards };

// Stores for deck management
// The player's owned deck (persists across rounds). Draw/Discard are per-round.
export const actionDeck = writable([]);
export const drawPile = writable([]);
export const discardPile = writable([]);
export const deckModifiers = writable([]);

// Utility function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize deck with base actions
export function initializeDeck() {
    let owned = [];
    
    // Seed owned deck if first time
    actionDeck.update(current => {
        if (!current || current.length === 0) {
            // Build deck from baseDeckComposition
            const seeded = baseDeckComposition.map(actionId => {
                const template = actionCardDeclarations[actionId];
                if (!template) {
                    console.error(`❌ Action template not found for ID: ${actionId}`);
                    return null;
                }
                return { ...template };
            }).filter(Boolean); // Remove any null entries
            
            owned = seeded;
            return seeded;
        }
        owned = current;
        return current;
    });

    // New round: draw pile is a shuffled copy of owned deck; discard clears
    const shuffledCopy = shuffleArray(owned.map(a => ({ ...a })));
    drawPile.set(shuffledCopy);
    discardPile.set([]);
    deckModifiers.set([]);

    console.log('✅ Deck initialized with', owned.length, 'owned cards,', shuffledCopy.length, 'in draw pile');
}

// Draw a random action from draw pile
export function drawAction() {
    let drawnAction = null;
    
    drawPile.update(pile => {
        if (pile.length === 0) {
            console.log('Draw pile empty, cannot draw action');
            return pile;
        }
        
        // Draw random card from pile
        const randomIndex = Math.floor(Math.random() * pile.length);
        drawnAction = pile[randomIndex];
        
        // Remove from draw pile
        const newPile = pile.filter((_, index) => index !== randomIndex);
        console.log(`Drew ${drawnAction.name}, ${newPile.length} cards remaining in draw pile`);
        
        return newPile;
    });
    
    return drawnAction;
}

// Discard a used action to discard pile
export function discardAction(action) {
    if (!action) return;
    
    discardPile.update(pile => {
        const newPile = [...pile, { ...action }];
        console.log(`Discarded ${action.name}, ${newPile.length} cards in discard pile`);
        return newPile;
    });
}

// Reshuffle discard pile into draw pile
export function reshuffleDiscardPile() {
    let cardsToReshuffle = [];
    
    discardPile.update(pile => {
        cardsToReshuffle = [...pile];
        console.log(`Reshuffling ${cardsToReshuffle.length} cards from discard pile`);
        return []; // Clear discard pile
    });
    
    if (cardsToReshuffle.length > 0) {
        const shuffledCards = shuffleArray(cardsToReshuffle);
        drawPile.update(pile => [...pile, ...shuffledCards]);
        console.log(`Reshuffled ${shuffledCards.length} cards into draw pile`);
    }
}

// Add new action to deck (from shop purchases)
export function addActionToDeck(actionTemplate) {
    const newAction = { ...actionTemplate };
    console.log('🛒 addActionToDeck() called for:', newAction.name);
    
    // Persist into owned deck
    actionDeck.update(deck => {
        const newDeck = [...deck, newAction];
        console.log('📦 actionDeck updated from', deck.length, 'to', newDeck.length, 'cards');
        console.log('📦 actionDeck now contains:', newDeck.map(a => a.name).join(', '));
        return newDeck;
    });
    
    // Also add to current draw pile so it's usable immediately this round
    drawPile.update(pile => {
        const newPile = [...pile, { ...newAction }];
        console.log('📚 drawPile updated from', pile.length, 'to', newPile.length, 'cards');
        return newPile;
    });
    
    console.log(`✅ Added ${newAction.name} to deck`);
}

// Remove action from deck (future shop feature)
export function removeActionFromDeck(actionId) {
    drawPile.update(pile => {
        const filteredPile = pile.filter(action => action.id !== actionId);
        console.log(`Removed ${actionId} from deck`);
        return filteredPile;
    });
}

// Upgrade existing action (future shop feature)
export function upgradeAction(actionId, upgradeType) {
    // TODO: Implement action upgrades
    console.log(`Upgrading ${actionId} with ${upgradeType}`);
}

// Reset deck to base configuration
export function resetDeckToBase() {
    initializeDeck();
    console.log('Deck reset to base configuration');
}

// Get deck statistics
export function getDeckStats() {
    let stats = {
        drawPileCount: 0,
        discardPileCount: 0,
        totalCards: 0,
        actionTypes: {}
    };
    
    drawPile.subscribe(pile => {
        stats.drawPileCount = pile.length;
        stats.totalCards += pile.length;
        
        // Count action types in draw pile
        pile.forEach(action => {
            stats.actionTypes[action.id] = (stats.actionTypes[action.id] || 0) + 1;
        });
    })();
    
    discardPile.subscribe(pile => {
        stats.discardPileCount = pile.length;
        stats.totalCards += pile.length;
        
        // Count action types in discard pile
        pile.forEach(action => {
            stats.actionTypes[action.id] = (stats.actionTypes[action.id] || 0) + 1;
        });
    })();
    
    return stats;
}
