<script>
    export let card;
    export let onCardClick;
    
    let cardElement;
    let isCelebrating = false;
    
    function handleClick() {
        onCardClick(card.index);
    }
    
    export function celebrate() {
        isCelebrating = true;
        setTimeout(() => {
            isCelebrating = false;
        }, 2000);
    }
</script>

<div 
    class="card" 
    class:selected={card.isSelected}
    class:celebrate={isCelebrating}
    on:click={handleClick}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
    {card.value}
</div>

<style>
    .card {
        width: 80px;
        height: 80px;
        background: linear-gradient(145deg, #ffffff, #f0f0f0);
        border: 3px solid #ddd;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        color: #333;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        user-select: none;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
    }

    .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.5s;
    }

    .card:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        border-color: #4ecdc4;
    }

    .card:hover::before {
        left: 100%;
    }

    .card.selected {
        background: linear-gradient(145deg, #4ecdc4, #44a08d);
        color: white;
        border-color: #4ecdc4;
        transform: translateY(-8px) scale(1.1);
        box-shadow: 0 20px 40px rgba(78, 205, 196, 0.3);
    }

    .card.celebrate {
        animation: celebration 0.6s ease-in-out infinite;
        background: linear-gradient(145deg, #ffd700, #ffed4e) !important;
        border-color: #ffd700 !important;
        color: #333 !important;
    }

    @keyframes celebration {
        0%, 100% { 
            transform: scale(1) rotate(0deg); 
        }
        25% { 
            transform: scale(1.1) rotate(2deg); 
        }
        50% { 
            transform: scale(1.15) rotate(-2deg); 
        }
        75% { 
            transform: scale(1.1) rotate(1deg); 
        }
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .card {
            width: 70px;
            height: 70px;
            font-size: 1.5rem;
        }
    }

    @media (max-width: 480px) {
        .card {
            width: 60px;
            height: 60px;
            font-size: 1.2rem;
        }
    }
</style>