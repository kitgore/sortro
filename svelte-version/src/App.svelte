<script>
    import { onMount } from 'svelte';
    import { cards, selectedCards, actionBank, actionCount, isWon, cash, startingHands, remainingHands, currentRound, gamePhase } from './lib/gameStore.js';
    import { initializeGame, toggleCardSelection, executeAction, resetGame } from './lib/gameLogic.js';
    import { drawPile, discardPile } from './lib/actionDeckStore.js';
    import GameCard from './lib/GameCard.svelte';
    import ActionCard from './lib/ActionCard.svelte';
    import PileViewerModal from './lib/PileViewerModal.svelte';
    import RewardPhase from './lib/RewardPhase.svelte';
    import ShopPhase from './lib/ShopPhase.svelte';
    
    let selectedCardCount = 0;
    let gameCardComponents = [];
    let showDrawPileModal = false;
    let showDiscardPileModal = false;
    
    // Reactive statements
    $: selectedCardCount = $selectedCards.length;
    $: console.log(`Selected cards count changed to: ${selectedCardCount}`);
    
    // Create a reactive disabled states array
    $: actionDisabledStates = $actionBank.map((actionCard, index) => {
        const disabled = actionCard.requires === 0 ? selectedCardCount === 0 :
                        actionCard.requires === 1 ? selectedCardCount !== 1 :
                        actionCard.requires === 2 ? selectedCardCount < 2 : false;
        
        console.log(`Action ${actionCard.name}: requires=${actionCard.requires}, selected=${selectedCardCount}, disabled=${disabled}`);
        
        return { actionCard, disabled };
    });
    
    // Debug action bank state
    $: console.log('Action bank state:', $actionBank.length, 'cards');
    $: if ($actionBank.length > 0) {
        console.log('Action bank contents:', $actionBank.map(a => a.name));
    }
    
    // Trigger celebration animation when game is won
    $: if ($isWon && gameCardComponents.length > 0) {
        gameCardComponents.forEach((cardComponent, index) => {
            setTimeout(() => {
                if (cardComponent && cardComponent.celebrate) {
                    cardComponent.celebrate();
                }
            }, index * 100);
        });
    }
    
    onMount(() => {
        initializeGame();
        
        // Add keyboard shortcuts
        const handleKeydown = (e) => {
            if (e.key === 'r' || e.key === 'R') {
                resetGame();
            }
            if (e.key === 'Escape') {
                // Deselect all cards - you can implement this if needed
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    });
    
    function handleCardClick(index) {
        console.log(`Card ${index} clicked`);
        toggleCardSelection(index);
    }
    
    function handleActionClick(bankIndex) {
        console.log(`Action clicked: ${bankIndex}`);
        executeAction(bankIndex);
    }
    
    function showDrawPile() {
        showDrawPileModal = true;
    }
    
    function showDiscardPile() {
        showDiscardPileModal = true;
    }
    
    function closeDrawPileModal() {
        showDrawPileModal = false;
    }
    
    function closeDiscardPileModal() {
        showDiscardPileModal = false;
    }
    
</script>

<svelte:head>
    <title>SORTOF</title>
</svelte:head>

<div class="game-container">
    {#if $gamePhase === 'sorting'}
        <header class="game-header">
            <h1>SORTOF</h1>
        </header>
        
        <main class="game-board">
        <div class="cards-container">
            {#each $cards as card (card.index)}
                <GameCard 
                    bind:this={gameCardComponents[card.index]}
                    {card} 
                    onCardClick={handleCardClick}
                />
            {/each}
        </div>
        
        <div class="game-stats">
            <div class="stats-row">
                <div class="stat-item">
                    <span>Round: </span>
                    <span class="count">{$currentRound}</span>
                </div>
                <div class="stat-item">
                    <span>Cash: $</span>
                    <span class="count">{$cash}</span>
                </div>
                <div class="stat-item">
                    <span>Hands: </span>
                    <span class="count">{$remainingHands}/{$startingHands}</span>
                </div>
                <div class="stat-item">
                    <span>Actions: </span>
                    <span class="count">{$actionCount}</span>
                </div>
            </div>
        </div>
        
        <div class="action-cards-container">
            {#each actionDisabledStates as { actionCard, disabled }, index (index)}
                <ActionCard 
                    {actionCard}
                    {disabled}
                    onActionClick={() => handleActionClick(index)}
                />
            {/each}
        </div>
        
        <div class="pile-info">
            <div class="pile-stats">
                <button class="pile-button" on:click={showDrawPile}>
                    <div class="pile-name">Draw Pile</div>
                    <div class="pile-count">{$drawPile.length} cards</div>
                </button>
                <button class="pile-button" on:click={showDiscardPile}>
                    <div class="pile-name">Discard Pile</div>
                    <div class="pile-count">{$discardPile.length} cards</div>
                </button>
            </div>
        </div>
        </main>
    {/if}
    
    {#if $gamePhase === 'reward'}
        <RewardPhase />
    {/if}
    
    {#if $gamePhase === 'shop'}
        <ShopPhase />
    {/if}
    
    <!-- Pile Viewer Modals -->
    <PileViewerModal 
        isOpen={showDrawPileModal}
        pileName="Draw Pile"
        pileCards={$drawPile}
        on:close={closeDrawPileModal}
    />
    
    <PileViewerModal 
        isOpen={showDiscardPileModal}
        pileName="Discard Pile"
        pileCards={$discardPile}
        on:close={closeDiscardPileModal}
    />
</div>

<style>
    .game-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        padding: 30px;
        max-width: 800px;
        width: 100%;
        text-align: center;
        position: relative;
    }

    .game-header {
        text-align: center;
        margin-bottom: 40px;
    }

    .game-header h1 {
        color: #333;
        font-size: 2.5rem;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .game-board {
        margin: 40px 0;
    }

    .cards-container {
        display: flex;
        flex-wrap: nowrap;
        gap: 15px;
        max-width: 800px;
        margin: 0 auto;
        justify-content: center;
        align-items: center;
    }

    .game-stats {
        display: flex;
        justify-content: center;
        margin: 30px 0;
    }

    .stats-row {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .stat-item {
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        padding: 12px 18px;
        font-size: 1rem;
        font-weight: bold;
        color: #2d3748;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        text-align: center;
        min-width: 80px;
    }

    .stat-item .count {
        color: #4299e1;
        font-size: 1.2rem;
    }

    .stat-item:nth-child(2) .count {
        color: #48bb78; /* Green for cash */
    }

    .stat-item:nth-child(3) .count {
        color: #ed8936; /* Orange for hands */
    }


    .action-cards-container {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
        flex-wrap: wrap;
    }

    .pile-info {
        margin-top: 30px;
        display: flex;
        justify-content: center;
    }

    .pile-stats {
        display: flex;
        gap: 20px;
        justify-content: center;
    }

    .pile-button {
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        padding: 15px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        min-width: 120px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .pile-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-color: #cbd5e0;
    }

    .pile-name {
        font-size: 1rem;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 5px;
    }

    .pile-count {
        font-size: 0.9rem;
        color: #4a5568;
    }


    /* Responsive design */
    @media (max-width: 768px) {
        .game-header h1 {
            font-size: 2rem;
        }
        
        .cards-container {
            gap: 10px;
            max-width: 600px;
        }
        
        .action-cards-container {
            gap: 15px;
        }
    }

    @media (max-width: 480px) {
        .game-container {
            padding: 20px;
        }
        
        .cards-container {
            gap: 8px;
            max-width: 400px;
        }
        
        .action-cards-container {
            gap: 10px;
        }
    }
</style>