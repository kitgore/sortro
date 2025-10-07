<script>
    export let actionCard;
    export let disabled;
    export let onActionClick;
    
    function handleClick() {
        console.log(`ActionCard clicked: ${actionCard.name}, disabled: ${disabled}`);
        if (!disabled) {
            onActionClick();
        } else {
            console.log(`Action ${actionCard.name} is disabled, not executing`);
        }
    }
</script>

<div 
    class="action-card {actionCard.styleName}" 
    class:disabled={disabled}
    on:click={handleClick}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Enter' && handleClick()}
    title={disabled ? 'Select cards first' : `Click to use ${actionCard.name}`}
>
    <div class="action-name">{actionCard.name}</div>
    <div class="action-description">{actionCard.description}</div>
</div>

<style>
    .action-card {
        width: 90px;
        height: 90px;
        background: linear-gradient(145deg, #667eea, #764ba2);
        border: 3px solid #5a67d8;
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: bold;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        user-select: none;
        position: relative;
        overflow: hidden;
        text-align: center;
        line-height: 1.2;
        flex-shrink: 0;
    }

    .action-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }

    .action-card:hover:not(.disabled) {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
    }

    .action-card:hover:not(.disabled)::before {
        left: 100%;
    }

    .action-card:active:not(.disabled) {
        transform: translateY(-2px) scale(1.02);
    }

    .action-card.disabled {
        /* background: linear-gradient(145deg, #ccc, #999);
        border-color: #999; */
        cursor: not-allowed;
        /* box-shadow: none;
        transform: none; */
    }

    .disabled-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        opacity: 0.7;
        z-index: 1;
    }

    .action-name {
        font-size: 1rem;
        margin-bottom: 2px;
    }

    .action-description {
        font-size: 0.7rem;
        opacity: 0.9;
    }

    /* Action type specific styles */
    .requires-one {
        background: linear-gradient(145deg, #48bb78, #38a169);
        border-color: #48bb78;
        box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
    }

    .requires-one:hover:not(.disabled) {
        box-shadow: 0 15px 30px rgba(72, 187, 120, 0.4);
    }

    .shift-up {
        background: linear-gradient(145deg, #4299e1, #3182ce);
        border-color: #4299e1;
        box-shadow: 0 8px 20px rgba(66, 153, 225, 0.3);
    }

    .shift-up:hover:not(.disabled) {
        box-shadow: 0 15px 30px rgba(66, 153, 225, 0.4);
    }

    .shift-down {
        background: linear-gradient(145deg, #e53e3e, #c53030);
        border-color: #e53e3e;
        box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
    }

    .shift-down:hover:not(.disabled) {
        box-shadow: 0 15px 30px rgba(229, 62, 62, 0.4);
    }

    .requires-any {
        background: linear-gradient(145deg, #9f7aea, #805ad5);
        border-color: #9f7aea;
        box-shadow: 0 8px 20px rgba(159, 122, 234, 0.3);
    }

    .requires-any:hover:not(.disabled) {
        box-shadow: 0 15px 30px rgba(159, 122, 234, 0.4);
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .action-card {
            width: 75px;
            height: 75px;
            font-size: 0.8rem;
        }
    }

    @media (max-width: 480px) {
        .action-card {
            width: 65px;
            height: 65px;
            font-size: 0.7rem;
        }
    }
</style>