// ============================================================================
// ACTION DECLARATIONS - Pure Function Approach
// All functions are pure: they take values and return new values
// No side effects, no store access - executor handles store updates
// ============================================================================

// ============================================================================
// FACTORY FUNCTIONS - Return pure functions that transform value arrays
// ============================================================================

/**
 * Factory: Creates a modifier function that adds/subtracts from values
 * @param {number} delta - Amount to add (positive) or subtract (negative)
 * @returns {Function} Pure function: (values) => newValues
 */
function createModifier(delta) {
    return function modifyValues(values) {
        if (values.length !== 1) return null;
        return [values[0] + delta];
    };
}

/**
 * Factory: Creates a shifter function that rotates values
 * @param {number} direction - Positive shifts up (right), negative shifts down (left)
 * @returns {Function} Pure function: (values) => newValues
 */
function createShifter(direction) {
    return function shiftValues(values) {
        if (values.length === 0) return null;
        
        const absDirection = Math.abs(direction);
        
        if (direction > 0) {
            // Shift up (right rotation): last items move to front
            return [
                ...values.slice(-absDirection),
                ...values.slice(0, -absDirection)
            ];
        } else {
            // Shift down (left rotation): first items move to back
            return [
                ...values.slice(absDirection),
                ...values.slice(0, absDirection)
            ];
        }
    };
}

/**
 * Factory: Creates a multiplier function that multiplies values
 * @param {number} factor - Multiplication factor
 * @returns {Function} Pure function: (values) => newValues
 */
function createMultiplier(factor) {
    return function multiplyValues(values) {
        if (values.length !== 1) return null;
        const newValue = values[0] * factor;
        return [newValue];
    };
}

/**
 * Factory: Creates a divider function that divides values
 * @param {number} divisor - Division divisor
 * @returns {Function} Pure function: (values) => newValues
 */
function createDivider(divisor) {
    return function divideValues(values) {
        if (values.length !== 1) return null;
        const newValue = Math.floor(values[0] / divisor);
        return [newValue];
    };
}

// ============================================================================
// BASE ACTION FUNCTIONS - Pure functions that transform value arrays
// ============================================================================

/**
 * Reverses the order of values
 * @param {Array<number>} values - Array of values to reverse
 * @returns {Array<number>|null} Reversed array or null if invalid
 */
function reverseValues(values) {
    if (values.length === 0) return null;
    return [...values].reverse();
}

/**
 * Swaps the first and last values
 * @param {Array<number>} values - Array of values
 * @returns {Array<number>|null} Array with first and last swapped, or null if invalid
 */
function swapValues(values) {
    if (values.length < 2) return null;
    
    const result = [...values];
    const temp = result[0];
    result[0] = result[result.length - 1];
    result[result.length - 1] = temp;
    
    return result;
}

/**
 * Randomly swaps values ensuring no value stays in its original position (derangement)
 * Uses backtracking algorithm to efficiently generate valid derangements
 * @param {Array<number>} values - Array of values to shuffle
 * @returns {Array<number>|null} Randomly shuffled array with all values moved, or null if invalid
 */
function randomSwapValues(values) {
    if (values.length < 2) return null;
    
    const n = values.length;
    const result = new Array(n);
    const availableIndices = new Set(Array.from({length: n}, (_, i) => i)); // Source indices still available
    const triedAtPosition = Array.from({length: n}, () => new Set()); // Track tried indices at each position
    
    let position = 0;
    
    while (position < n) {
        // Get available source indices that:
        // 1. Haven't been used yet
        // 2. Aren't the same as current position (derangement constraint)
        // 3. Haven't been tried at this position yet (for backtracking)
        const validChoices = [...availableIndices].filter(
            idx => idx !== position && !triedAtPosition[position].has(idx)
        );
        
        if (validChoices.length === 0) {
            // No valid choices - need to backtrack
            if (position === 0) {
                // Can't backtrack further (shouldn't happen for n >= 2)
                return [...values.slice(1), values[0]];
            }
            
            // Clear tried choices for current position since we're abandoning it
            triedAtPosition[position].clear();
            
            // Backtrack: undo previous position's assignment
            position--;
            const previousSourceIdx = result[position];
            availableIndices.add(previousSourceIdx); // Make it available again
            triedAtPosition[position].add(previousSourceIdx); // Mark as tried for this position
            result[position] = undefined;
        } else {
            // Pick a random valid choice
            const chosenIdx = validChoices[Math.floor(Math.random() * validChoices.length)];
            result[position] = chosenIdx;
            availableIndices.delete(chosenIdx);
            position++;
        }
    }
    
    // Map indices back to actual values
    return result.map(idx => values[idx]);
}

/**
 * Splits array at halfway point and swaps the halves
 * For odd-length arrays, the middle element moves to the right half
 * @param {Array<number>} values - Array of values
 * @returns {Array<number>|null} Array with halves swapped, or null if invalid
 */
function splitSwapValues(values) {
    if (values.length < 2) return null;
    
    const length = values.length;
    const isOdd = length % 2 === 1;
    
    if (isOdd) {
        // For odd length, middle element goes to right side
        const leftSize = Math.floor(length / 2);
        const leftHalf = values.slice(0, leftSize);
        const rightHalf = values.slice(leftSize); // includes middle element
        return [...rightHalf, ...leftHalf];
    } else {
        // For even length, simple split in half
        const mid = length / 2;
        const leftHalf = values.slice(0, mid);
        const rightHalf = values.slice(mid);
        return [...rightHalf, ...leftHalf];
    }
}

// ============================================================================
// ACTION CARD DECLARATIONS
// Each action has an 'execute' function that takes an array of values
// and returns an array of new values (or null if the action is invalid)
// ============================================================================

export const actionCardDeclarations = {
    add: {
        id: 'add',
        name: '+1',
        description: 'Add 1 to selected card',
        requires: 1,
        styleName: 'requires-one',
        cost: 2,
        rarity: 'common',
        execute: createModifier(1)  // Pure function from factory
    },
    
    subtract: {
        id: 'subtract',
        name: '-1',
        description: 'Subtract 1 from selected card',
        requires: 1,
        styleName: 'requires-one',
        cost: 2,
        rarity: 'common',
        execute: createModifier(-1)  // Pure function from factory
    },
    
    add2: {
        id: 'add2',
        name: '+2',
        description: 'Add 2 to selected card',
        requires: 1,
        styleName: 'requires-one',
        cost: 3,
        rarity: 'common',
        execute: createModifier(2)  // Pure function from factory
    },
    
    subtract2: {
        id: 'subtract2',
        name: '-2',
        description: 'Subtract 2 from selected card',
        requires: 1,
        styleName: 'requires-one',
        cost: 3,
        rarity: 'common',
        execute: createModifier(-2)  // Pure function from factory
    },
    
    upshift: {
        id: 'upshift',
        name: 'Upshift',
        description: 'Shift selected cards up by 1 position',
        requires: 2,
        styleName: 'shift-up',
        cost: 4,
        rarity: 'common',
        execute: createShifter(1)  // Pure function from factory
    },
    
    downshift: {
        id: 'downshift',
        name: 'Downshift',
        description: 'Shift selected cards down by 1 position',
        requires: 2,
        styleName: 'shift-down',
        cost: 4,
        rarity: 'common',
        execute: createShifter(-1)  // Pure function from factory
    },
    
    double_upshift: {
        id: 'double_upshift',
        name: 'Double Upshift',
        description: 'Shift selected cards up by 2 positions',
        requires: 2,
        styleName: 'shift-up',
        cost: 7,
        rarity: 'rare',
        execute: createShifter(2)  // Pure function from factory
    },
    
    double_downshift: {
        id: 'double_downshift',
        name: 'Double Downshift',
        description: 'Shift selected cards down by 2 positions',
        requires: 2,
        styleName: 'shift-down',
        cost: 7,
        rarity: 'rare',
        execute: createShifter(-2)  // Pure function from factory
    },
    
    reverse: {
        id: 'reverse',
        name: 'Reverse',
        description: 'Reverse the order of selected cards',
        requires: 2,
        styleName: 'requires-any',
        cost: 4,
        rarity: 'common',
        execute: reverseValues  // Pure function
    },
    
    swap: {
        id: 'swap',
        name: 'Swap',
        description: 'Swap first and last selected cards',
        requires: 2,
        styleName: 'requires-two',
        cost: -1,  // Not available in shop
        rarity: 'common',
        execute: swapValues  // Pure function
    },
    
    // multiply: {
    //     id: 'multiply',
    //     name: '×2',
    //     description: 'Double selected card value',
    //     requires: 1,
    //     styleName: 'requires-one',
    //     cost: 6,
    //     rarity: 'rare',
    //     execute: createMultiplier(2)  // Pure function from factory
    // },
    
    // divide: {
    //     id: 'divide',
    //     name: '÷2',
    //     description: 'Halve selected card value (rounded down)',
    //     requires: 1,
    //     styleName: 'requires-one',
    //     cost: 6,
    //     rarity: 'rare',
    //     execute: createDivider(2)  // Pure function from factory
    // },
    
    random_swap: {
        id: 'random_swap',
        name: 'Random Swap',
        description: 'Randomly shuffle selected cards',
        requires: 2,
        styleName: 'requires-any',
        cost: 4,
        rarity: 'common',
        execute: randomSwapValues  // Pure function
    },
    
    split_swap: {
        id: 'split_swap',
        name: 'Split Swap',
        description: 'Swap left and right halves of selected cards',
        requires: 2,
        styleName: 'requires-any',
        cost: 4,
        rarity: 'common',
        execute: splitSwapValues  // Pure function
    }
};

// Export array of all action cards for convenience
export const allActionCards = Object.values(actionCardDeclarations);

// Export base deck composition (array of action IDs)
export const baseDeckComposition = [
    'swap',
    'swap',
    'swap',
    'swap',
    'reverse'
];
