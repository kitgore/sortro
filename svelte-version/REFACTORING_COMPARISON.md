# Refactoring Comparison: Impure → Pure Functions

## Before: Impure Functions (with side effects)

### Problem: Functions accessed stores directly
```javascript
import { get } from 'svelte/store';
import { cards } from './gameStore.js';

function createModifier(delta) {
    return function modifyCards(selected) {
        if (selected.length !== 1) return;
        
        const card = selected[0];
        const newValue = card.value + delta;
        
        // ❌ SIDE EFFECT: Directly updates store
        cards.update(cardList => 
            cardList.map(c => 
                c.index === card.index ? { ...c, value: newValue } : c
            )
        );
    };
}

function createShifter(direction) {
    return function shiftCards(selected) {
        if (selected.length === 0) return;
        
        // ❌ SIDE EFFECT: Reading from store
        const currentCards = get(cards);
        const selectedIndices = selected.map(card => card.index).sort((a, b) => a - b);
        const selectedValues = selectedIndices.map(index => currentCards[index].value);
        
        // ... rotation logic ...
        
        // ❌ SIDE EFFECT: Directly updates store
        cards.update(cardList => {
            const newCards = [...cardList];
            selectedIndices.forEach((index, i) => {
                newCards[index] = { ...newCards[index], value: shiftedValues[i] };
            });
            return newCards;
        });
    };
}
```

### Issues with Impure Approach:
- ❌ Functions have hidden dependencies on global state
- ❌ Can't test without mocking stores
- ❌ Side effects make reasoning harder
- ❌ Can't compose functions easily
- ❌ Not truly reusable
- ❌ Violates functional programming principles

---

## After: Pure Functions (no side effects)

### Solution: Functions only transform values
```javascript
// NO imports needed! Pure functions don't need stores

function createModifier(delta) {
    return function modifyValues(values) {
        if (values.length !== 1) return null;
        // ✅ PURE: Just returns new values
        return [values[0] + delta];
    };
}

function createShifter(direction) {
    return function shiftValues(values) {
        if (values.length === 0) return null;
        
        // ✅ PURE: Only operates on input
        const absDirection = Math.abs(direction);
        
        if (direction > 0) {
            return [
                ...values.slice(-absDirection),
                ...values.slice(0, -absDirection)
            ];
        } else {
            return [
                ...values.slice(absDirection),
                ...values.slice(0, absDirection)
            ];
        }
    };
}
```

### Benefits of Pure Approach:
- ✅ No side effects - easy to reason about
- ✅ No hidden dependencies
- ✅ Trivial to test (no mocking needed)
- ✅ Can compose functions
- ✅ Truly reusable
- ✅ Follows functional programming principles

---

## Executor Comparison

### Before: Executor just called impure function
```javascript
export function executeAction(bankIndex) {
    const currentBank = get(actionBank);
    const currentSelected = get(selectedCards);
    const actionCard = currentBank[bankIndex];
    
    // ❌ Function handles everything (including side effects)
    actionCard.execute(currentSelected);
    
    // ... rest of action logic
}
```

### After: Executor extracts values, calls pure function, applies results
```javascript
export function executeAction(bankIndex) {
    const currentBank = get(actionBank);
    const currentSelected = get(selectedCards);
    const currentCards = get(cards);
    const actionCard = currentBank[bankIndex];
    
    // 1. Extract values from selected cards
    const selectedIndices = currentSelected
        .map(card => card.index)
        .sort((a, b) => a - b);
    const selectedValues = selectedIndices
        .map(index => currentCards[index].value);
    
    // 2. Call pure function with values
    const newValues = actionCard.execute(selectedValues);
    
    // 3. Apply results to store
    if (newValues && newValues.length === selectedValues.length) {
        cards.update(cardList => {
            const newCards = [...cardList];
            selectedIndices.forEach((index, i) => {
                newCards[index].value = newValues[i];
            });
            return newCards;
        });
    }
    
    // ... rest of action logic
}
```

---

## Testing Comparison

### Before: Required complex mocking
```javascript
import { get } from 'svelte/store';
import { cards } from './gameStore.js';

jest.mock('./gameStore.js');

describe('createModifier', () => {
    it('adds delta to card value', () => {
        // ❌ Complex setup with mocks
        const mockCard = { index: 0, value: 5 };
        const mockCards = [mockCard];
        get.mockReturnValue(mockCards);
        
        const updateFn = jest.fn();
        cards.update = updateFn;
        
        const add1 = createModifier(1);
        add1([mockCard]);
        
        // ❌ Hard to verify - need to inspect mock calls
        expect(updateFn).toHaveBeenCalled();
        const updateCallback = updateFn.mock.calls[0][0];
        const result = updateCallback(mockCards);
        expect(result[0].value).toBe(6);
    });
});
```

### After: Simple, straightforward tests
```javascript
import { createModifier } from './actionDeclarations.js';

// ✅ No mocking needed!

describe('createModifier', () => {
    it('adds delta to card value', () => {
        const add1 = createModifier(1);
        
        // ✅ Simple, direct test
        expect(add1([5])).toEqual([6]);
    });
    
    it('subtracts negative delta', () => {
        const subtract2 = createModifier(-2);
        expect(subtract2([10])).toEqual([8]);
    });
    
    it('returns null for wrong length', () => {
        const add1 = createModifier(1);
        expect(add1([1, 2])).toBeNull();
        expect(add1([])).toBeNull();
    });
});

describe('createShifter', () => {
    it('shifts values up', () => {
        const upshift = createShifter(1);
        expect(upshift([1, 2, 3, 4])).toEqual([4, 1, 2, 3]);
    });
    
    it('shifts values down', () => {
        const downshift = createShifter(-1);
        expect(downshift([1, 2, 3, 4])).toEqual([2, 3, 4, 1]);
    });
});
```

---

## Composition Comparison

### Before: Hard to compose impure functions
```javascript
// ❌ Can't easily compose functions that have side effects
function comboAction(selected) {
    createModifier(1)(selected);  // Mutates store
    createShifter(1)(selected);   // Mutates store again
    // Hard to predict final state
}
```

### After: Easy to compose pure functions
```javascript
// ✅ Trivial to compose pure functions
function comboAction(values) {
    let result = createModifier(1)(values);
    if (result) {
        result = createShifter(1)(result);
    }
    return result;
}

// Usage
const input = [1, 2, 3, 4];
const output = comboAction(input);
// Input: [1, 2, 3, 4]
// After +1: [2, 3, 4, 5]
// After shift: [5, 2, 3, 4]
```

---

## Summary

| Aspect | Before (Impure) | After (Pure) |
|--------|----------------|--------------|
| **Side Effects** | ❌ Yes | ✅ No |
| **Store Access** | ❌ Yes (`get`, `update`) | ✅ No |
| **Testability** | ❌ Needs mocking | ✅ Direct testing |
| **Composability** | ❌ Hard | ✅ Easy |
| **Predictability** | ❌ Depends on state | ✅ Input → Output |
| **Reusability** | ❌ Tied to stores | ✅ Truly reusable |
| **Reasoning** | ❌ Must track state | ✅ Simple logic flow |
| **Dependencies** | ❌ Hidden (stores) | ✅ Explicit (params) |

The pure function approach provides a **cleaner, more maintainable, and more testable architecture** while maintaining all the same functionality!
