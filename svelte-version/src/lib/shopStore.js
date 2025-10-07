import { writable } from 'svelte/store';
import { addActionToDeck } from './actionDeckStore.js';
import { actionCardDeclarations } from './actionDeclarations.js';

// Shop inventory - built from action card declarations
// Filter to only include cards that have a positive cost (cost >= 0 means available in shop)
const shopableActions = Object.values(actionCardDeclarations)
    .filter(action => action.cost >= 0)
    .map(action => ({
        ...action,
        type: 'action' // Add type field for shop system
    }));

export const shopInventory = writable(shopableActions);

// Currently available items in shop (randomized each round)
export const availableItems = writable([]);

// Items purchased this round
export const purchasedItems = writable([]);

// Active modifiers and upgrades
export const activeUpgrades = writable([]);
export const activeModifiers = writable([]);

// Shop configuration
export const shopConfig = {
    itemsPerRound: 4, // Show 4 action cards per round
    maxRarityPerRound: 'epic', // Maximum rarity that can appear
    refreshCost: 2 // Cost to refresh shop (2 cash)
};

// Generate available items for current round
export function generateShopItems() {
    const inventory = get(shopInventory);
    const available = [];
    
    // Filter items by max rarity
    const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
    const maxRarityIndex = rarityOrder.indexOf(shopConfig.maxRarityPerRound);
    const eligibleItems = inventory.filter(item => {
        const itemRarityIndex = rarityOrder.indexOf(item.rarity);
        return itemRarityIndex <= maxRarityIndex;
    });
    
    // Randomly select items
    const shuffled = [...eligibleItems].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, shopConfig.itemsPerRound);
    
    availableItems.set(selected);
    purchasedItems.set([]);
    
    console.log(`Shop generated with ${selected.length} items:`, selected.map(item => `${item.name} (${item.rarity})`));
}

// Purchase an item
export function purchaseItem(itemId) {
    console.log('🛍️ purchaseItem() called with itemId:', itemId);
    const items = get(availableItems);
    console.log('🛍️ Available items:', items.map(i => `${i.id}:${i.name}`).join(', '));
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
        console.log(`❌ Item ${itemId} not found in shop`);
        return false;
    }
    
    console.log('✅ Found item:', item.name, 'id:', item.id);
    
    // Check if already purchased
    const purchased = get(purchasedItems);
    if (purchased.some(p => p.id === itemId)) {
        console.log(`❌ Item ${itemId} already purchased`);
        return false;
    }
    
    // Add to purchased items
    purchasedItems.update(items => [...items, item]);
    console.log('📝 Added to purchased items');
    
    // Apply item effect
    console.log('🎁 About to call applyItemEffect for:', item.name);
    applyItemEffect(item);
    
    console.log(`✅ Purchased ${item.name} for $${item.cost}`);
    return true;
}

// Apply the effect of a purchased item
export function applyItemEffect(item) {
    console.log('🎁 applyItemEffect() called for:', item.name, 'type:', item.type);
    switch (item.type) {
        case 'action':
            // Get the full template from declarations
            const template = actionCardDeclarations[item.id] || item;
            console.log('🔍 Found template:', template.name, 'id:', template.id);
            addActionToDeck(template);
            console.log(`✅ Action card ${item.name} added to deck`);
            break;
            
        case 'upgrade':
            activeUpgrades.update(upgrades => [...upgrades, item]);
            console.log(`Applied upgrade: ${item.name}`);
            break;
            
        case 'modifier':
            activeModifiers.update(modifiers => [...modifiers, item]);
            console.log(`Applied modifier: ${item.name}`);
            break;
            
        case 'consumable':
            // Consumables are applied immediately
            console.log(`Used consumable: ${item.name}`);
            break;
    }
}

// Refresh shop (costs money)
export function refreshShop() {
    generateShopItems();
    console.log('Shop refreshed');
}

// All items are actions now, no need for category filtering

// Check if item is purchased
export function isItemPurchased(itemId) {
    const purchased = get(purchasedItems);
    return purchased.some(item => item.id === itemId);
}

// Get active upgrade by effect
export function getActiveUpgrade(effect) {
    const upgrades = get(activeUpgrades);
    return upgrades.find(upgrade => upgrade.effect === effect);
}

// Get active modifier by effect
export function getActiveModifier(effect) {
    const modifiers = get(activeModifiers);
    return modifiers.find(modifier => modifier.effect === effect);
}

// Clear round-specific items
export function clearRoundItems() {
    purchasedItems.set([]);
    activeModifiers.set([]); // Modifiers expire each round
    console.log('Cleared round-specific shop items');
}

// Utility function to get store value (needed for reactive statements)
function get(store) {
    let value;
    store.subscribe(v => value = v)();
    return value;
}
