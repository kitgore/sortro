# Shop System Implementation Plan

## Overview
Transform the number sorting game into a roguelike experience with persistent progression, purchasable actions, and strategic deck building.

## Core Concepts

### 1. Action Deck System
- **Base Deck**: Starting set of actions available to the player
- **Persistent State**: Deck modifications carry over between rounds
- **Dynamic Actions**: Actions can be added, removed, or modified

### 2. Cash Economy
- **Starting Swaps**: Begin each round with 9 "hands" (equal to card count)
- **Cash Reward**: Earn money based on remaining unused hands
- **Shop Purchases**: Spend cash on deck improvements and modifiers

### 3. Round Progression
- **Sorting Phase**: Play the current round with available actions
- **Reward Phase**: Calculate cash based on remaining hands
- **Shop Phase**: Purchase upgrades for next round
- **Repeat**: Start next round with improved deck

## Implementation Steps

### Phase 1: Action Deck Foundation
**Priority: HIGH | Estimated Time: 2-3 hours**

#### 1.1 Create Action Deck Store
```javascript
// src/lib/actionDeckStore.js
- actionDeck (writable) - Current deck of actions
- drawPile (writable) - Available actions to draw from
- discardPile (writable) - Used actions that can be reshuffled
- baseActions (constant) - Starting action templates
- deckModifiers (writable) - Applied upgrades/buffs
```

#### 1.2 Action Templates System
```javascript
// Enhanced action structure
{
  id: 'add',
  name: '+1',
  description: 'Add 1',
  requires: 1,
  styleName: 'requires-one',
  cost: 0,           // Shop cost (-1 indicates card will not show in the shop)
  rarity: 'common',   // common/rare/epic/legendary
  effects: []         // Additional effects (future)
}
```

#### 1.3 Deck Management Functions
- `initializeDeck()` - Start with base deck, create draw pile
- `drawAction()` - Draw random action from draw pile
- `discardAction(action)` - Move used action to discard pile
- `reshuffleDiscardPile()` - Shuffle discard pile into draw pile
- `addActionToDeck(actionTemplate)` - Add new action to draw pile
- `removeActionFromDeck(actionId)` - Remove action from deck
- `upgradeAction(actionId, upgradeType)` - Modify existing action
- `resetDeckToBase()` - Return to starting deck

#### 1.4 Pile Viewer System
- `showDrawPile()` - Display available actions (order hidden)
- `showDiscardPile()` - Display used actions
- `PileViewerModal.svelte` - Modal component for viewing piles
- Dark overlay with pile contents display

### Phase 2: Cash Economy System
**Priority: HIGH | Estimated Time: 2-3 hours**

#### 2.1 Game Store
```javascript
// src/lib/gameStore.js
- cash (writable) - Current money
- startingHands (writable) - Hands available this round
- remainingHands (writable) - Hands left after completion
```

#### 2.2 Hand Management
- Start each round with `startingHands = numberOfCards` (9)
- Track actions used during round
- Calculate `remainingHands = startingHands - actionsUsed`
- Award cash: `cashEarned = remainingHands * baseValue * cashMultiplier`

#### 2.3 Cash Calculation Functions
- `startNewRound()` - Reset hands, keep cash
- `useAction()` - Decrement remaining hands
- `completeRound()` - Calculate and award cash
- `spendCash(amount)` - Deduct from total

### Phase 3: Game State Management
**Priority: MEDIUM | Estimated Time: 2-3 hours**

#### 3.1 Enhanced Game Store
```javascript
// src/lib/gameStore.js (enhanced)
- currentRound (writable) - Round number
- gamePhase (writable) - 'sorting' | 'shop' | 'reward'
- roundStats (writable) - Performance metrics
- runStats (writable) - Overall run data
```

#### 3.2 Phase Transitions
- **Sorting Phase**: Play the sorting game
- **Reward Phase**: Show results, calculate cash
- **Shop Phase**: Browse and purchase upgrades
- **Transition**: Start next round with new deck

#### 3.3 Navigation System
- Add routing between game phases
- Create phase-specific components
- Implement navigation controls

### Phase 4: Shop Interface
**Priority: MEDIUM | Estimated Time: 3-4 hours**

#### 4.1 Shop Store
```javascript
// src/lib/shopStore.js
- availableItems (writable) - Items for sale this round
- shopInventory (writable) - Full shop catalog
- purchasedItems (writable) - Items bought this round
```

#### 4.2 Shop Categories
- **Actions**: New action cards
- **Upgrades**: Enhance existing actions
- **Modifiers**: Game rule changes
- **Consumables**: One-time effects

#### 4.3 Shop Components
- `ShopPage.svelte` - Main shop interface
- `ShopItem.svelte` - Individual purchasable item
- `ShopCategory.svelte` - Category tabs
- `PurchaseConfirmation.svelte` - Buy confirmation

### Phase 5: Action Variants & Upgrades
**Priority: MEDIUM | Estimated Time: 2-3 hours**

#### 5.1 Action Variants
```javascript
// Example variants
+1 (Common) → +2 (Rare) → +3 (Epic)
Upshift (Common) → Double Upshift (Rare)
Reverse (Common) → Reverse + Shuffle (Epic)
```

#### 5.2 Upgrade System
- **Power**: Increase effect magnitude
- **Efficiency**: Reduce hand cost
- **Versatility**: Change requirements
- **Special**: Add unique effects

#### 5.3 Action Generation
- Procedural action creation
- Rarity-based generation
- Balanced pricing system

### Phase 6: Advanced Features
**Priority: LOW | Estimated Time: 3-4 hours**

#### 6.1 Persistence
- Save run progress
- Resume interrupted games
- High score tracking

#### 6.2 Progression System
- Unlock new action types
- Difficulty scaling
- Achievement system

#### 6.3 Balance & Polish
- Playtesting and tuning
- UI/UX improvements
- Performance optimization

## Technical Implementation Details

### Store Architecture
```javascript
// Centralized store imports
import { cashStore } from './lib/cashStore.js'
import { actionDeckStore } from './lib/actionDeckStore.js'
import { shopStore } from './lib/shopStore.js'
import { gameStore } from './lib/gameStore.js'
```

### Component Structure
```
src/
├── lib/
│   ├── stores/
│   │   ├── cashStore.js
│   │   ├── actionDeckStore.js
│   │   ├── shopStore.js
│   │   └── gameStore.js
│   └── components/
│       ├── GameCard.svelte
│       ├── ActionCard.svelte
│       ├── ShopItem.svelte
│       └── PhaseTransition.svelte
├── pages/
│   ├── GamePage.svelte
│   ├── ShopPage.svelte
│   └── RewardPage.svelte
└── App.svelte
```

### Data Flow
1. **Game Start**: Initialize deck, set starting hands
2. **Action Use**: Decrement hands, check win condition
3. **Round Complete**: Calculate cash reward
4. **Shop Phase**: Display available purchases
5. **Purchase**: Update deck, deduct cash
6. **Next Round**: Start with modified deck

## Success Metrics

### Phase 1 Success
- [ ] Action deck persists between rounds
- [ ] Can add/remove actions from deck
- [ ] Base deck initializes correctly

### Phase 2 Success
- [ ] Cash system tracks hands correctly
- [ ] Rewards calculated properly
- [ ] Can spend cash on items

### Phase 3 Success
- [ ] Smooth transitions between phases
- [ ] Game state persists correctly
- [ ] Navigation works intuitively

### Phase 4 Success
- [ ] Shop displays available items
- [ ] Purchases update deck correctly
- [ ] Cash transactions work properly

## Future Enhancements

### Long-term Features
- **Multiplayer**: Compete with friends
- **Campaign Mode**: Story-driven progression
- **Daily Challenges**: Special rounds with unique rules
- **Leaderboards**: Global high scores
- **Mod Support**: Community-created content

### Advanced Mechanics
- **Action Synergies**: Combo effects between actions
- **Risk/Reward**: High-risk high-reward actions
- **Environmental Effects**: Round-specific modifiers
- **Boss Rounds**: Special challenging levels

## Development Timeline

### Week 1: Foundation
- Phase 1: Action Deck System
- Phase 2: Cash Economy
- Basic store setup and testing

### Week 2: Core Features
- Phase 3: Game State Management
- Phase 4: Shop Interface
- End-to-end functionality

### Week 3: Polish & Enhancement
- Phase 5: Action Variants
- Phase 6: Advanced Features
- Testing and refinement

## Risk Mitigation

### Technical Risks
- **Store Complexity**: Keep stores focused and simple
- **State Management**: Use clear data flow patterns
- **Performance**: Optimize reactive updates

### Design Risks
- **Balance**: Start simple, iterate based on playtesting
- **Complexity**: Ensure new players can understand the system
- **Progression**: Make sure upgrades feel meaningful

## Next Steps

1. **Start with Phase 1**: Implement action deck store
2. **Create simple test**: Verify deck persistence works
3. **Iterate quickly**: Get basic functionality working first
4. **Playtest early**: Ensure the core loop is fun
5. **Build incrementally**: Add features one phase at a time

---

*This plan provides a roadmap for transforming the sorting game into a compelling roguelike experience. Each phase builds upon the previous one, ensuring a solid foundation while allowing for iterative development and testing.*
