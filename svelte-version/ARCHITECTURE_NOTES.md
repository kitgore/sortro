# Action Declarations Architecture - Pure Functions

## Overview
This document describes the **pure function** approach used for action card declarations in Sortro.

## Core Philosophy: Functional Purity

### **All Action Functions Are Pure**
- ✅ **No side effects** - Functions don't modify external state
- ✅ **No store access** - Functions don't call `get()` or `update()`
- ✅ **Deterministic** - Same input always produces same output
- ✅ **Testable** - Easy to test in isolation

### **Separation of Concerns**
1. **Action Functions** - Transform values (pure logic)
2. **Executor** - Handles store interactions (side effects)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Action Declaration (actionDeclarations.js)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Pure Function: (values) => newValues             │  │
│  │  Example: [5, 3, 7] => [6, 4, 8]                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Executor (gameLogic.js)                                │
│  1. Extract values from selected cards                  │
│  2. Call pure function with values                      │
│  3. Update store with returned values                   │
└─────────────────────────────────────────────────────────┘
```

## File Structure

### `/src/lib/actionDeclarations.js`
**Single source of truth** for all action cards.

Contains:
1. **Factory Functions** - Return pure functions
   ```javascript
   function createModifier(delta) {
       return function modifyValues(values) {
           if (values.length !== 1) return null;
           return [values[0] + delta];
       };
   }
   ```

2. **Base Action Functions** - Pure implementations
   ```javascript
   function reverseValues(values) {
       if (values.length === 0) return null;
       return [...values].reverse();
   }
   ```

3. **Action Card Declarations** - Configuration with execute functions
   ```javascript
   add: {
       id: 'add',
       name: '+1',
       execute: createModifier(1)  // Pure function
   }
   ```

### `/src/lib/gameLogic.js`
**Executor** that bridges pure functions and Svelte stores.

```javascript
export function executeAction(bankIndex) {
    // 1. Get current state
    const currentSelected = get(selectedCards);
    const currentCards = get(cards);
    
    // 2. Extract values (pure data)
    const selectedIndices = currentSelected.map(c => c.index).sort();
    const selectedValues = selectedIndices.map(i => currentCards[i].value);
    
    // 3. Call pure function
    const newValues = actionCard.execute(selectedValues);
    
    // 4. Update store with results
    if (newValues) {
        cards.update(cardList => {
            const newCards = [...cardList];
            selectedIndices.forEach((index, i) => {
                newCards[index].value = newValues[i];
            });
            return newCards;
        });
    }
}
```

## Function Signatures

### Factory Functions
All factory functions return pure functions with this signature:
```javascript
(values: number[]) => number[] | null
```

### Examples

**Modifier:**
```javascript
createModifier(1)([5]) => [6]
createModifier(-2)([10]) => [8]
```

**Shifter:**
```javascript
createShifter(1)([1, 2, 3, 4]) => [4, 1, 2, 3]  // Last to front
createShifter(-1)([1, 2, 3, 4]) => [2, 3, 4, 1] // First to back
```

**Multiplier:**
```javascript
createMultiplier(2)([5]) => [10]
createMultiplier(2)([15]) => null  // Out of bounds (1-20)
```

**Reverser:**
```javascript
reverseValues([1, 2, 3]) => [3, 2, 1]
```

**Swapper:**
```javascript
swapValues([1, 2, 3, 4]) => [4, 2, 3, 1]
```

## Benefits of Pure Functions

### 1. **Testability**
```javascript
// Unit test without mocking stores
describe('createModifier', () => {
    it('adds delta to value', () => {
        const add5 = createModifier(5);
        expect(add5([10])).toEqual([15]);
    });
});
```

### 2. **Composability**
```javascript
// Easy to compose actions
function createComboAction() {
    return (values) => {
        let result = createModifier(1)(values);
        return createMultiplier(2)(result);
    };
}
```

### 3. **Predictability**
```javascript
// Always same output for same input
const add1 = createModifier(1);
add1([5]); // Always [6]
add1([5]); // Always [6]
```

### 4. **No Hidden Dependencies**
- Function signature tells you everything
- No surprise side effects
- No global state mutations

### 5. **Easier Debugging**
```javascript
// Log inputs and outputs
const values = [1, 2, 3];
console.log('Input:', values);
const result = reverseValues(values);
console.log('Output:', result);
// No need to inspect store state
```

## Adding New Actions

### Parameterized Action (Factory)
```javascript
// 1. Create factory
function createSquarer() {
    return function squareValues(values) {
        if (values.length !== 1) return null;
        const squared = values[0] * values[0];
        return squared <= 20 ? [squared] : null;
    };
}

// 2. Add to declarations
export const actionCardDeclarations = {
    // ... existing actions ...
    square: {
        id: 'square',
        name: 'x²',
        description: 'Square the selected card value',
        requires: 1,
        styleName: 'requires-one',
        cost: 8,
        rarity: 'epic',
        execute: createSquarer()  // Pure function!
    }
};
```

### Simple Action (Direct Function)
```javascript
// 1. Create pure function
function sortValues(values) {
    if (values.length === 0) return null;
    return [...values].sort((a, b) => a - b);
}

// 2. Add to declarations
export const actionCardDeclarations = {
    // ... existing actions ...
    sort: {
        id: 'sort',
        name: 'Sort',
        description: 'Sort selected cards ascending',
        requires: 2,
        styleName: 'requires-any',
        cost: 6,
        rarity: 'rare',
        execute: sortValues  // Pure function!
    }
};
```

## Return Value Contract

Functions **must** return:
- `number[]` - Array of new values (same length as input)
- `null` - Invalid action, no change should be made

## Factory Functions vs Direct Functions

### Use Factory When:
- Action behavior varies by parameter
- Want to create multiple similar actions
- Example: `createModifier(1)`, `createModifier(2)`

### Use Direct Function When:
- Single, specific behavior
- No parameterization needed
- Example: `reverseValues()`, `sortValues()`

## Current Actions

### Factories
- `createModifier(delta)` → +1, -1, +2, -2
- `createShifter(direction)` → Upshift(1), Downshift(-1), Double Upshift(2), Double Downshift(-2)
- `createMultiplier(factor)` → ×2
- `createDivider(divisor)` → ÷2

### Direct Functions
- `reverseValues()` → Reverse
- `swapValues()` → Swap

## Migration Notes

### Before (Impure - accessed stores)
```javascript
function modifyCards(selected) {
    const card = selected[0];
    cards.update(cardList =>  // ❌ Side effect!
        cardList.map(c => 
            c.index === card.index ? { ...c, value: c.value + 1 } : c
        )
    );
}
```

### After (Pure - transforms values)
```javascript
function modifyValues(values) {
    if (values.length !== 1) return null;
    return [values[0] + 1];  // ✅ Pure transformation!
}
```

## Testing Examples

```javascript
import { createModifier, reverseValues, swapValues } from './actionDeclarations.js';

describe('Action Functions', () => {
    describe('createModifier', () => {
        it('adds positive delta', () => {
            const add3 = createModifier(3);
            expect(add3([5])).toEqual([8]);
        });
        
        it('subtracts negative delta', () => {
            const subtract2 = createModifier(-2);
            expect(subtract2([10])).toEqual([8]);
        });
        
        it('returns null for wrong length', () => {
            const add1 = createModifier(1);
            expect(add1([1, 2])).toBeNull();
        });
    });
    
    describe('reverseValues', () => {
        it('reverses array', () => {
            expect(reverseValues([1, 2, 3])).toEqual([3, 2, 1]);
        });
        
        it('returns null for empty', () => {
            expect(reverseValues([])).toBeNull();
        });
    });
    
    describe('swapValues', () => {
        it('swaps first and last', () => {
            expect(swapValues([1, 2, 3, 4])).toEqual([4, 2, 3, 1]);
        });
        
        it('returns null for less than 2', () => {
            expect(swapValues([1])).toBeNull();
        });
    });
});
```

## Future Enhancements

Possible pure function additions:
- `clampValues(min, max)` → Clamp values to range
- `rollValues(min, max)` → Randomize within range
- `transformValues(fn)` → Apply custom transformation
- `filterValues(predicate)` → Filter and compact
- `sortValues(order)` → Sort ascending/descending

All following the pure function contract: `(values) => newValues | null`
