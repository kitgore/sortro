<script>
    import { createEventDispatcher } from 'svelte';
    
    export let isOpen = false;
    export let pileName = '';
    export let pileCards = [];
    
    const dispatch = createEventDispatcher();
    
    function closeModal() {
        dispatch('close');
    }
    
    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
    
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div 
        class="modal-backdrop" 
        on:click={handleBackdropClick}
        on:keydown={(e) => e.key === 'Escape' && closeModal()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-title">{pileName}</h2>
                <button 
                    class="close-button" 
                    on:click={closeModal}
                    aria-label="Close modal"
                >
                    ✕
                </button>
            </div>
            
            <div class="modal-body">
                <div class="pile-count">
                    {pileCards.length} card{pileCards.length !== 1 ? 's' : ''}
                </div>
                
                <div class="pile-grid">
                    {#each pileCards as card, index (index)}
                        <div class="pile-card" class:unknown={true}>
                            <div class="card-name">{card.name}</div>
                            <div class="card-description">{card.description}</div>
                            <div class="card-rarity" class:rarity-common={card.rarity === 'common'} class:rarity-rare={card.rarity === 'rare'} class:rarity-epic={card.rarity === 'epic'} class:rarity-legendary={card.rarity === 'legendary'}>
                                {card.rarity}
                            </div>
                        </div>
                    {/each}
                </div>
                
                {#if pileCards.length === 0}
                    <div class="empty-pile">
                        <p>No cards in this pile</p>
                    </div>
                {/if}
            </div>
            
            <div class="modal-footer">
                <button class="close-modal-button" on:click={closeModal}>
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }
    
    .modal-content {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-bottom: 2px solid #e2e8f0;
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
    }
    
    .modal-header h2 {
        margin: 0;
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: bold;
    }
    
    .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #718096;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .close-button:hover {
        background: #e2e8f0;
        color: #2d3748;
    }
    
    .modal-body {
        padding: 20px 30px;
        flex: 1;
        overflow-y: auto;
    }
    
    .pile-count {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.1rem;
        color: #4a5568;
        font-weight: 600;
    }
    
    .pile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .pile-card {
        background: linear-gradient(145deg, #ffffff, #f0f0f0);
        border: 2px solid #ddd;
        border-radius: 12px;
        padding: 12px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
    }
    
    .pile-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .pile-card.unknown {
        background: linear-gradient(145deg, #f7fafc, #edf2f7);
        border-color: #cbd5e0;
        opacity: 0.8;
    }
    
    .card-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 4px;
    }
    
    .card-description {
        font-size: 0.8rem;
        color: #718096;
        margin-bottom: 6px;
    }
    
    .card-rarity {
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 8px;
        display: inline-block;
    }
    
    .rarity-common {
        background: #e2e8f0;
        color: #4a5568;
    }
    
    .rarity-rare {
        background: #bee3f8;
        color: #2c5282;
    }
    
    .rarity-epic {
        background: #e9d8fd;
        color: #553c9a;
    }
    
    .rarity-legendary {
        background: #fed7d7;
        color: #c53030;
    }
    
    .empty-pile {
        text-align: center;
        padding: 40px 20px;
        color: #718096;
    }
    
    .modal-footer {
        padding: 20px 30px;
        border-top: 2px solid #e2e8f0;
        display: flex;
        justify-content: center;
    }
    
    .close-modal-button {
        background: linear-gradient(145deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .close-modal-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            max-height: 90vh;
        }
        
        .pile-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
        }
        
        .pile-card {
            padding: 8px;
        }
        
        .card-name {
            font-size: 1rem;
        }
        
        .card-description {
            font-size: 0.7rem;
        }
    }
</style>
