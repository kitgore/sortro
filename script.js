/**
 * Number Sorting Game - Modular Implementation
 * Features: Configurable number of cards, selection system, action cards (swap, add, subtract, reverse), win detection
 */

// Game Configuration - Easy to modify for different numbers of cards
const GAME_CONFIG = {
    numberOfCards: 9,
    cardValues: null, // Will be generated randomly
    containerSelector: '#cards-container',
    actionCardsSelector: '#action-cards-container',
    instructionSelector: '#instruction-text',
    actionCountSelector: '#action-count'
};

/**
 * Card class for managing individual card behavior
 */
class Card {
    constructor(value, index, container) {
        this.value = value;
        this.index = index;
        this.isSelected = false;
        this.element = null;
        this.container = container;
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'card';
        this.element.textContent = this.value;
        this.element.dataset.index = this.index;
        this.element.addEventListener('click', () => this.toggleSelection());
    }

    toggleSelection() {
        if (this.isSelected) {
            this.deselect();
        } else {
            // Allow unlimited card selection
            this.select();
        }
    }

    select() {
        this.isSelected = true;
        this.element.classList.add('selected');
    }

    deselect() {
        this.isSelected = false;
        this.element.classList.remove('selected');
    }

    updatePosition(newIndex) {
        this.index = newIndex;
        this.element.dataset.index = newIndex;
    }

    celebrate() {
        this.element.classList.add('celebrate');
        setTimeout(() => {
            this.element.classList.remove('celebrate');
        }, 2000);
    }
}

/**
 * Game class for managing the overall game state and logic
 */
class NumberSortingGame {
    constructor(config = GAME_CONFIG) {
        this.config = { ...GAME_CONFIG, ...config };
        this.cards = [];
        this.selectedCards = [];
        this.container = document.querySelector(this.config.containerSelector);
        this.actionCardsContainer = document.querySelector(this.config.actionCardsSelector);
        this.instructionElement = document.querySelector(this.config.instructionSelector);
        this.actionCountElement = document.querySelector(this.config.actionCountSelector);
        this.actionCount = 0;
        this.actionBank = []; // Bank of 3 actions
        
        this.init();
    }

    init() {
        this.generateCardValues();
        this.createCards();
        this.createActionCards();
        this.setupEventListeners();
        this.renderCards();
        this.initializeActionBank();
        this.renderActionCards();
        this.updateActionCards();
        this.updateActionCounter();
    }

    generateCardValues() {
        // Generate array of random numbers from 1 to 20 without repeating
        const allValues = Array.from({ length: 10 }, (_, i) => i + 1);
        const shuffledValues = this.shuffleArray(allValues);
        this.config.cardValues = shuffledValues.slice(0, this.config.numberOfCards);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createCards() {
        this.cards = this.config.cardValues.map((value, index) => 
            new Card(value, index, this.container)
        );
    }

    createActionCards() {
        this.actionCards = [
            // {
            //     id: 'swap',
            //     name: 'Swap',
            //     description: 'Swaps first & last',
            //     requires: 2,
            //     action: () => this.swapSelectedCards(),
            //     className: 'requires-two'
            // },
            {
                id: 'add',
                name: '+1',
                description: 'Add 1',
                requires: 1,
                action: () => this.modifySelectedCards(1),
                className: 'requires-one'
            },
            {
                id: 'subtract',
                name: '-1',
                description: 'Subtract 1',
                requires: 1,
                action: () => this.modifySelectedCards(-1),
                className: 'requires-one'
            },
            {
                id: 'add',
                name: '+2',
                description: 'Add 2',
                requires: 1,
                action: () => this.modifySelectedCards(2),
                className: 'requires-one'
            },
            {
                id: 'subtract',
                name: '-2',
                description: 'Subtract 2',
                requires: 1,
                action: () => this.modifySelectedCards(-2),
                className: 'requires-one'
            },
            {
                id: 'upshift',
                name: 'Upshift',
                description: 'Shift up by 1',
                requires: 0, // Works with any number of cards
                action: () => this.shiftSelectedCards(1),
                className: 'shift-up'
            },
            {
                id: 'downshift',
                name: 'Downshift',
                description: 'Shift down by 1',
                requires: 0, // Works with any number of cards
                action: () => this.shiftSelectedCards(-1),
                className: 'shift-down'
            },
            {
                id: 'upshift',
                name: 'Upshift',
                description: 'Shift up by 1',
                requires: 0, // Works with any number of cards
                action: () => this.shiftSelectedCards(1),
                className: 'shift-up'
            },
            {
                id: 'downshift',
                name: 'Downshift',
                description: 'Shift down by 1',
                requires: 0, // Works with any number of cards
                action: () => this.shiftSelectedCards(-1),
                className: 'shift-down'
            },
            {
                id: 'reverse',
                name: 'Reverse',
                description: 'Reverse order',
                requires: 0, // 0 means any number
                action: () => this.reverseSelectedCards(),
                className: 'requires-any'
            },
            {
                id: 'reverse',
                name: 'Reverse',
                description: 'Reverse order',
                requires: 0, // 0 means any number
                action: () => this.reverseSelectedCards(),
                className: 'requires-any'
            }
        ];
    }

    setupEventListeners() {
        // Add click listener to container for card selection
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('card')) {
                this.updateSelectedCards();
                this.updateActionCards();
                this.updateInstructions();
            }
        });
    }

    renderCards() {
        this.container.innerHTML = '';
        this.cards.forEach(card => {
            this.container.appendChild(card.element);
        });
    }

    initializeActionBank() {
        // Initialize the action bank with 3 random actions
        this.actionBank = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * this.actionCards.length);
            this.actionBank.push(this.actionCards[randomIndex]);
        }
        console.log('Action bank initialized:', this.actionBank.map(action => action.name));
    }

    selectRandomActionCard() {
        // Randomly select one action card from all available actions
        const randomIndex = Math.floor(Math.random() * this.actionCards.length);
        return this.actionCards[randomIndex];
    }

    renderActionCards() {
        this.actionCardsContainer.innerHTML = '';
        
        this.actionBank.forEach((actionCard, index) => {
            const element = document.createElement('div');
            element.className = `action-card ${actionCard.className}`;
            element.dataset.action = actionCard.id;
            element.dataset.bankIndex = index;
            element.innerHTML = `
                <div>${actionCard.name}</div>
                <div style="font-size: 0.7rem; margin-top: 2px;">${actionCard.description}</div>
            `;
            
            // Add click event listener
            element.addEventListener('click', (e) => {
                e.preventDefault();
                if (!element.disabled) {
                    this.executeAction(index);
                }
            });
            
            this.actionCardsContainer.appendChild(element);
        });
    }

    executeAction(bankIndex) {
        const actionCard = this.actionBank[bankIndex];
        console.log(`Executing action: ${actionCard.name} (from position ${bankIndex})`);
        
        // Execute the action
        actionCard.action();
        
        // Increment action counter
        this.actionCount++;
        this.updateActionCounter();
        
        // Replace the used action with a new random one
        const newAction = this.selectRandomActionCard();
        this.actionBank[bankIndex] = newAction;
        console.log(`Replaced action at position ${bankIndex} with: ${newAction.name}`);
        
        // Re-render the action cards
        this.renderActionCards();
        this.updateActionCards();
    }

    updateSelectedCards() {
        this.selectedCards = this.cards.filter(card => card.isSelected);
    }

    updateActionCards() {
        const actionCardElements = this.actionCardsContainer.querySelectorAll('.action-card');
        actionCardElements.forEach((element, index) => {
            const actionCard = this.actionBank[index];
            if (!actionCard) return;
            
            if (actionCard.requires === 0) {
                // Reverse/Upshift/Downshift - works with any number of cards (but at least 1)
                element.disabled = this.selectedCards.length === 0;
            } else if (actionCard.requires === 1) {
                // Add/Subtract - requires exactly 1 card
                element.disabled = this.selectedCards.length !== 1;
            } else if (actionCard.requires === 2) {
                // Swap - works with 2 or more cards (swaps first and last)
                element.disabled = this.selectedCards.length < 2;
            }
        });
    }

    updateActionCounter() {
        this.actionCountElement.textContent = this.actionCount;
    }

    updateInstructions() {
        // Only update instructions if the element exists (it was removed from HTML)
        if (!this.instructionElement) {
            return;
        }
        
        const selectedCount = this.selectedCards.length;
        let instruction = '';
        
        if (this.actionBank.length === 0) {
            instruction = 'Loading actions...';
        } else if (selectedCount === 0) {
            instruction = 'Select cards to use available actions';
        } else {
            const availableActions = this.actionBank.filter(actionCard => {
                if (actionCard.requires === 0) return selectedCount >= 1;
                if (actionCard.requires === 1) return selectedCount === 1;
                if (actionCard.requires === 2) return selectedCount >= 2;
                return false;
            });
            
            if (availableActions.length === 0) {
                instruction = 'No actions available for current selection';
            } else if (availableActions.length === 1) {
                instruction = `Ready to ${availableActions[0].name.toLowerCase()} ${selectedCount} card${selectedCount > 1 ? 's' : ''}`;
            } else {
                instruction = `${availableActions.length} actions available for ${selectedCount} card${selectedCount > 1 ? 's' : ''}`;
            }
        }
        
        this.instructionElement.textContent = instruction;
    }

    swapSelectedCards() {
        if (this.selectedCards.length < 2) {
            return;
        }

        // Get the first and last selected cards (by position)
        const sortedSelectedCards = [...this.selectedCards].sort((a, b) => a.index - b.index);
        const firstCard = sortedSelectedCards[0];
        const lastCard = sortedSelectedCards[sortedSelectedCards.length - 1];
        
        // Swap the values
        [firstCard.value, lastCard.value] = [lastCard.value, firstCard.value];
        
        // Update the displayed values
        firstCard.element.textContent = firstCard.value;
        lastCard.element.textContent = lastCard.value;
        
        // Deselect cards
        this.deselectAllCards();
        this.updateInstructions();
        
        // Check for win condition
        this.checkWinCondition();
    }

    modifySelectedCards(delta) {
        if (this.selectedCards.length !== 1) {
            return;
        }

        const card = this.selectedCards[0];
        const newValue = card.value + delta;
        
        // Ensure the value stays within valid range (1 to 20)
        if (newValue >= 1 && newValue <= 20) {
            card.value = newValue;
            card.element.textContent = card.value;
            
            // Deselect cards
            this.deselectAllCards();
            this.updateInstructions();
            
            // Check for win condition
            this.checkWinCondition();
        }
    }

    shiftSelectedCards(direction) {
        if (this.selectedCards.length === 0) {
            return;
        }

        // Get the indices of selected cards sorted by position
        const selectedIndices = this.selectedCards.map(card => card.index).sort((a, b) => a - b);
        const selectedValues = selectedIndices.map(index => this.cards[index].value);
        
        // Shift the values
        let shiftedValues;
        if (direction === 1) {
            // Upshift: move each value up by 1 position, last wraps to first
            shiftedValues = [selectedValues[selectedValues.length - 1], ...selectedValues.slice(0, -1)];
        } else {
            // Downshift: move each value down by 1 position, first wraps to last
            shiftedValues = [...selectedValues.slice(1), selectedValues[0]];
        }
        
        // Apply the shifted values back to the cards
        selectedIndices.forEach((index, i) => {
            this.cards[index].value = shiftedValues[i];
            this.cards[index].element.textContent = shiftedValues[i];
        });
        
        // Deselect cards
        this.deselectAllCards();
        this.updateInstructions();
        
        // Check for win condition
        this.checkWinCondition();
    }

    reverseSelectedCards() {
        if (this.selectedCards.length === 0) {
            return;
        }

        // Get the indices of selected cards
        const selectedIndices = this.selectedCards.map(card => card.index).sort((a, b) => a - b);
        const selectedValues = selectedIndices.map(index => this.cards[index].value);
        
        // Reverse the values
        const reversedValues = selectedValues.reverse();
        
        // Apply the reversed values back to the cards
        selectedIndices.forEach((index, i) => {
            this.cards[index].value = reversedValues[i];
            this.cards[index].element.textContent = reversedValues[i];
        });
        
        // Deselect cards
        this.deselectAllCards();
        this.updateInstructions();
        
        // Check for win condition
        this.checkWinCondition();
    }

    deselectAllCards() {
        this.cards.forEach(card => card.deselect());
        this.selectedCards = [];
    }

    checkWinCondition() {
        const isSorted = this.cards.every((card, index) => {
            if (index === 0) return true;
            return card.value >= this.cards[index - 1].value;
        });

        if (isSorted) {
            this.handleWin();
        }
    }

    handleWin() {
        console.log('🎉 Congratulations! The cards are now sorted in the correct order!');
        
        // Add celebration effect to all cards
        this.cards.forEach((card, index) => {
            setTimeout(() => {
                card.celebrate();
            }, index * 100);
        });
        
        // Show win message
        this.showWinMessage();
    }

    showWinMessage() {
        // Create a temporary win message
        const winMessage = document.createElement('div');
        winMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                color: #333;
                padding: 30px;
                border-radius: 20px;
                font-size: 1.5rem;
                font-weight: bold;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                text-align: center;
            ">
                🎉 You Win! 🎉<br>
                <small style="font-size: 1rem; margin-top: 10px; display: block;">
                    Cards are sorted correctly!
                </small>
            </div>
        `;
        
        document.body.appendChild(winMessage);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            document.body.removeChild(winMessage);
        }, 3000);
    }

    // Method to reset the game with new random arrangement
    reset() {
        this.deselectAllCards();
        this.actionCount = 0;
        this.generateCardValues();
        this.cards.forEach((card, index) => {
            card.value = this.config.cardValues[index];
            card.element.textContent = card.value;
            card.element.classList.remove('celebrate');
        });
        this.initializeActionBank();
        this.renderActionCards();
        this.updateActionCards();
        this.updateInstructions();
        this.updateActionCounter();
    }

    // Method to change the number of cards (for future expansion)
    setNumberOfCards(newNumber) {
        this.config.numberOfCards = newNumber;
        this.reset();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new NumberSortingGame();
    
    // Optional: Add keyboard shortcuts for better UX
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            game.reset();
        }
        if (e.key === 'Escape') {
            game.deselectAllCards();
            game.updateActionCards();
            game.updateInstructions();
        }
    });
    
    // Add some helpful instructions to console
    console.log('🎮 Number Sorting Game Loaded!');
    console.log('📋 Instructions:');
    console.log('  • Click cards to select them (unlimited selection)');
    console.log('  • Bank of 3 random action cards available at a time');
    console.log('  • Only the action you use gets replaced with a new random one');
    console.log('  • Available actions:');
    console.log('    - Swap: Swaps first and last selected cards');
    console.log('    - +1/-1: Add or subtract 1 from 1 selected card');
    console.log('    - Upshift: Rotate selected cards up by 1 position (last wraps to first)');
    console.log('    - Downshift: Rotate selected cards down by 1 position (first wraps to last)');
    console.log('    - Reverse: Reverse order of any number of selected cards');
    console.log('  • Goal: Sort cards in ascending order with minimal actions');
    console.log('  • Values range from 1-20 (randomly selected, no repeats)');
    console.log('  • Press "R" to reset the game');
    console.log('  • Press "Escape" to deselect all cards');
    console.log('  • Watch the console for win messages!');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NumberSortingGame, Card };
}
