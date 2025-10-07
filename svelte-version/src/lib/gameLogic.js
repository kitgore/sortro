import { get } from 'svelte/store';
import { cards, selectedCards, actionBank, actionCount, isWon, gameConfig, cash, startingHands, remainingHands, currentRound, gamePhase, startNewRound, useHand, completeRound } from './gameStore.js';
import { drawPile, discardPile, drawAction, discardAction, reshuffleDiscardPile, initializeDeck } from './actionDeckStore.js';
import { generateShopItems } from './shopStore.js';
import { actionCardDeclarations } from './actionDeclarations.js';

// Utility functions
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Game initialization
export function initializeGame() {
    generateCardValues();
    createCards();
    initializeDeck(); // Initialize the action deck system FIRST
    initializeActionBank(); // Then initialize action bank from the deck
    actionCount.set(0);
    isWon.set(false);
    startNewRound(); // Initialize cash economy
    gamePhase.set('sorting'); // Start in sorting phase
}

export function generateCardValues() {
    const allValues = Array.from({ length: 10 }, (_, i) => i + 1);
    const shuffledValues = shuffleArray(allValues);
    gameConfig.cardValues = shuffledValues.slice(0, gameConfig.numberOfCards);
}

export function createCards() {
    const newCards = gameConfig.cardValues.map((value, index) => ({
        value,
        index,
        isSelected: false
    }));
    cards.set(newCards);
}

export function initializeActionBank() {
    console.log('Initializing action bank...');
    const bank = [];
    for (let i = 0; i < 3; i++) {
        const drawnAction = drawAction();
        if (drawnAction) {
            const actionCard = {
                ...drawnAction,
                action: () => executeAction(i)
            };
            bank.push(actionCard);
            console.log(`Action ${i}: ${actionCard.name}, requires: ${actionCard.requires}`);
        } else {
            console.log(`No action drawn for position ${i}, trying reshuffle...`);
            // If draw pile is empty, try to reshuffle discard pile
            reshuffleDiscardPile();
            const reshuffledAction = drawAction();
            if (reshuffledAction) {
                const actionCard = {
                    ...reshuffledAction,
                    action: () => executeAction(i)
                };
                bank.push(actionCard);
                console.log(`Action ${i}: ${actionCard.name} (from reshuffle), requires: ${actionCard.requires}`);
            } else {
                console.log(`Still no action available for position ${i}`);
            }
        }
    }
    console.log(`Setting action bank with ${bank.length} cards:`, bank.map(action => action.name));
    actionBank.set(bank);
    console.log('Action bank initialized:', bank.map(action => `${action.name} (requires: ${action.requires})`));
}

// Card selection
export function toggleCardSelection(cardIndex) {
    cards.update(cardList => {
        const newCards = cardList.map(card => {
            if (card.index === cardIndex) {
                return { ...card, isSelected: !card.isSelected };
            }
            return card;
        });
        updateSelectedCards(newCards);
        return newCards;
    });
}

export function updateSelectedCards(cardList) {
    const selected = cardList.filter(card => card.isSelected);
    selectedCards.set(selected);
}

export function deselectAllCards() {
    cards.update(cardList => 
        cardList.map(card => ({ ...card, isSelected: false }))
    );
    selectedCards.set([]);
}

// Action execution
export function executeAction(bankIndex) {
    const currentBank = get(actionBank);
    const currentSelected = get(selectedCards);
    const currentCards = get(cards);
    const actionCard = currentBank[bankIndex];
    
    console.log(`Executing action: ${actionCard.name} (from position ${bankIndex})`);
    
    // Execute the action using the pure execute function from declarations
    if (actionCard.execute && typeof actionCard.execute === 'function') {
        // Extract values from selected cards (sorted by index)
        const selectedIndices = currentSelected
            .map(card => card.index)
            .sort((a, b) => a - b);
        const selectedValues = selectedIndices
            .map(index => currentCards[index].value);
        
        // Call the pure function with values
        const newValues = actionCard.execute(selectedValues);
        
        // If the action returned new values, apply them to the cards store
        if (newValues && newValues.length === selectedValues.length) {
            cards.update(cardList => {
                const newCards = [...cardList];
                selectedIndices.forEach((index, i) => {
                    newCards[index] = { 
                        ...newCards[index], 
                        value: newValues[i] 
                    };
                });
                return newCards;
            });
        } else if (newValues === null) {
            console.log(`Action ${actionCard.name} returned null (invalid/no change)`);
        } else {
            console.warn(`Action ${actionCard.name} returned mismatched values`);
        }
    } else {
        console.warn(`No execute function defined for action: ${actionCard.name}`);
    }
    
    // Increment action counter and use a hand
    actionCount.update(count => count + 1);
    useHand();
    
    // Discard the used action
    discardAction(actionCard);
    
    // Draw a new action from the deck
    const drawnAction = drawAction();
    let newAction = null;
    
    if (drawnAction) {
        // Create action card with the executeAction callback
        // The drawnAction already has the execute function from actionDeclarations
        newAction = {
            ...drawnAction,
            action: () => executeAction(bankIndex)
        };
    } else {
        // If draw pile is empty, try to reshuffle discard pile
        reshuffleDiscardPile();
        const reshuffledAction = drawAction();
        if (reshuffledAction) {
            newAction = {
                ...reshuffledAction,
                action: () => executeAction(bankIndex)
            };
        }
    }
    
    if (newAction) {
        actionBank.update(bank => {
            const newBank = [...bank];
            newBank[bankIndex] = newAction;
            return newBank;
        });
        console.log(`Replaced action at position ${bankIndex} with: ${newAction.name}`);
    } else {
        console.log(`No actions available to replace position ${bankIndex}`);
    }
    
    // Deselect all cards after action
    deselectAllCards();
    
    // Check for win condition
    checkWinCondition();
}

// Win condition
export function checkWinCondition() {
    const currentCards = get(cards);
    const sorted = currentCards.every((card, index) => {
        if (index === 0) return true;
        return card.value >= currentCards[index - 1].value;
    });
    
    if (sorted) {
        isWon.set(true);
        console.log('🎉 Congratulations! The cards are now sorted in the correct order!');
        
        // Complete the round and calculate rewards after a 2-second delay
        // This allows the card animation to play first
        setTimeout(() => {
            const roundResults = completeRound();
            console.log('Round Results:', roundResults);
        }, 2000);
    }
}


// Reset game
export function resetGame() {
    deselectAllCards();
    actionCount.set(0);
    isWon.set(false);
    initializeGame();
}

// Testing functions - available in browser console
window.testCompleteRound = function(handsRemaining = 0) {
    console.log(`🧪 Testing: Completing round with ${handsRemaining} hands remaining`);

    // Set the cards to be sorted (win condition)
    const sortedValues = Array.from({ length: 9 }, (_, i) => i + 1);
    gameConfig.cardValues = sortedValues;

    // Update the cards store to reflect the sorted values
    // Include `index` because App.svelte keys the each block by `card.index`
    const newCards = sortedValues.map((value, index) => ({
        id: index,
        index: index,
        value: value,
        isSelected: false
    }));
    cards.set(newCards);

    // Set remaining hands and derived action count
    const totalHands = get(startingHands);
    remainingHands.set(handsRemaining);
    actionCount.set(Math.max(0, totalHands - handsRemaining));

    // Trigger normal win path so reward phase shows after animation delay
    checkWinCondition();

    console.log(`✅ Round set to complete. Actions used: ${get(actionCount)}, hands remaining: ${handsRemaining}`);
};

// Add cash for testing
window.testAddCash = function(amount) {
    cash.update(current => current + amount);
    console.log(`💰 Added ${amount} cash. Total: ${get(cash)}`);
};

// Set specific round number
window.testSetRound = function(roundNumber) {
    currentRound.set(roundNumber);
    console.log(`🎯 Set round to ${roundNumber}`);
};

// Show current game state
window.testShowState = function() {
    console.log('🎮 Current Game State:');
    console.log(`Round: ${get(currentRound)}`);
    console.log(`Cash: $${get(cash)}`);
    console.log(`Hands: ${get(remainingHands)}/${get(startingHands)}`);
    console.log(`Actions Used: ${get(actionCount)}`);
    console.log(`Game Phase: ${get(gamePhase)}`);
    console.log(`Cards: [${get(cards).map(c => c.value).join(', ')}]`);
    console.log(`Action Bank: [${get(actionBank).map(a => a.name).join(', ')}]`);
};