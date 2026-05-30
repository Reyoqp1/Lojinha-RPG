// Game State
const gameState = {
    points: 1000,
    selectedItem: null,
    purchasedItems: new Set(),
    hasNegotiatedPrice: false,
    discountedItems: new Map(),
    playerHP: 100,
    maxPlayerHP: 100,
    inCombat: false
};

// Items Database
const items = [
    { id: 1, name: 'Espada de Ferro', emoji: '⚔️', price: 100, combat: 15, rarity: 'comum' },
    { id: 2, name: 'Escudo de Ouro', emoji: '🛡️', price: 150, defense: 20, rarity: 'raro' },
    { id: 3, name: 'Poção de Vida', emoji: '🧪', price: 50, heal: 50, rarity: 'comum' },
    { id: 4, name: 'Anel de Magia', emoji: '💍', price: 200, magic: 25, rarity: 'épico' },
    { id: 5, name: 'Pocao Misteriosa', emoji: '🌌', price: 300, mystery: true, rarity: 'lendário' },
    { id: 6, name: 'Arco Élfico', emoji: '🏹', price: 120, combat: 18, rarity: 'raro' },
    { id: 7, name: 'Mantos Sombrios', emoji: '🌑', price: 180, stealth: 30, rarity: 'épico' },
    { id: 8, name: 'Maça Divina', emoji: '⚡', price: 250, combat: 30, rarity: 'épico' },
    { id: 9, name: 'Elixir Antigo', emoji: '⚗️', price: 400, power: 50, rarity: 'lendário' },
    { id: 10, name: 'Pedra da Sabedoria', emoji: '💎', price: 350, wisdom: 40, rarity: 'lendário' }
];

// Enemy Encounters
const enemies = [
    { name: 'Goblin', emoji: '👹', hp: 30, damage: 5, exp: 50 },
    { name: 'Orc', emoji: '💪', hp: 60, damage: 12, exp: 100 },
    { name: 'Dragão Pequeno', emoji: '🐉', hp: 100, damage: 20, exp: 200 },
    { name: 'Bruxa Malvada', emoji: '🧙‍♀️', hp: 70, damage: 15, exp: 150 }
];

// UI Elements
const characterEmoji = document.getElementById('characterEmoji');
const speechBubble = document.getElementById('speechBubble');
const negotiateBtn = document.getElementById('negotiateBtn');
const itemsContainer = document.getElementById('itemsContainer');
const pointsDisplay = document.getElementById('pointsDisplay');
const dialogOverlay = document.getElementById('dialogOverlay');
const combatOverlay = document.getElementById('combatOverlay');

// Initialize particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Render items
function renderItems() {
    itemsContainer.innerHTML = '';
    items.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'item-slot';
        if (gameState.selectedItem === item.id) slot.classList.add('selected');
        if (gameState.purchasedItems.has(item.id)) slot.classList.add('purchased');
        
        let finalPrice = item.price;
        if (gameState.discountedItems.has(item.id)) {
            finalPrice = Math.floor(item.price * gameState.discountedItems.get(item.id));
        }
        
        slot.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-name">${item.name}</div>
            ${gameState.discountedItems.has(item.id) ? `
                <div class="item-price discounted">${item.price}</div>
                <div class="item-price-final">${finalPrice}</div>
            ` : `
                <div class="item-price">${finalPrice}</div>
            `}
        `;
        
        slot.addEventListener('click', () => selectItem(item.id));
        itemsContainer.appendChild(slot);
    });
}

// Select item
function selectItem(itemId) {
    if (gameState.purchasedItems.has(itemId)) return;
    
    if (gameState.selectedItem === itemId) {
        // Try to buy
        const item = items.find(i => i.id === itemId);
        let price = item.price;
        if (gameState.discountedItems.has(itemId)) {
            price = Math.floor(item.price * gameState.discountedItems.get(itemId));
        }
        
        if (gameState.points >= price) {
            buyItem(itemId);
        } else {
            showDialog('Sem ouro! 😢', `Você precisa de ${price} ouro.`, 'fail', '🧙');
        }
    } else {
        gameState.selectedItem = itemId;
        renderItems();
    }
}

// Buy item
function buyItem(itemId) {
    const item = items.find(i => i.id === itemId);
    let price = item.price;
    if (gameState.discountedItems.has(itemId)) {
        price = Math.floor(item.price * gameState.discountedItems.get(itemId));
    }
    
    gameState.points -= price;
    gameState.purchasedItems.add(itemId);
    gameState.selectedItem = null;
    pointsDisplay.textContent = gameState.points;
    
    characterEmoji.classList.remove('idle');
    characterEmoji.classList.add('happy');
    setTimeout(() => characterEmoji.classList.remove('happy'), 2000);
    
    showDialog('Ótima escolha! ✨', `Você comprou ${item.name}!`, 'success', '🧙');
    renderItems();
}

// Negotiate price
function negotiatePrice() {
    const isSuccess = Math.random() > 0.3;
    gameState.hasNegotiatedPrice = true;
    negotiateBtn.disabled = true;
    
    if (isSuccess) {
        characterEmoji.classList.add('happy');
        const discount = 0.7 + Math.random() * 0.2; // 70-90% discount
        items.forEach(item => {
            gameState.discountedItems.set(item.id, discount);
        });
        showDialog('Boa sorte, aventureiro!', `Todos os itens com 30% de desconto! 😄`, 'success', '🧙');
        renderItems();
    } else {
        characterEmoji.classList.add('angry');
        showDialog('Não tenho tempo!', `Biruta recusou negociar. Tente sua sorte em combate! ⚔️`, 'fail', '🧙', [
            { text: 'Aceitar Desafio', class: 'danger', action: () => startCombat() },
            { text: 'Voltar', class: 'success', action: () => closeDialog() }
        ]);
    }
    
    setTimeout(() => characterEmoji.classList.remove('happy', 'angry'), 2000);
}

// Combat system
function startCombat() {
    closeDialog();
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    gameState.inCombat = true;
    gameState.playerHP = gameState.maxPlayerHP;
    
    const combatState = {
        playerHP: gameState.maxPlayerHP,
        enemyHP: enemy.hp,
        maxEnemyHP: enemy.hp,
        enemy: enemy,
        playerDefending: false
    };
    
    combatOverlay.classList.add('active');
    document.getElementById('enemyEmoji').textContent = enemy.emoji;
    document.getElementById('enemyName').textContent = enemy.name;
    updateCombatUI(combatState);
    
    document.getElementById('attackBtn').onclick = () => playerAttack(combatState);
    document.getElementById('defendBtn').onclick = () => playerDefend(combatState);
}

function updateCombatUI(state) {
    const playerHpPercent = (state.playerHP / gameState.maxPlayerHP) * 100;
    const enemyHpPercent = (state.enemyHP / state.maxEnemyHP) * 100;
    
    document.getElementById('playerHp').textContent = Math.max(0, state.playerHP);
    document.getElementById('enemyHp').textContent = Math.max(0, state.enemyHP);
    document.getElementById('playerHpFill').style.width = playerHpPercent + '%';
    document.getElementById('enemyHpFill').style.width = enemyHpPercent + '%';
}

function playerAttack(state) {
    const damage = Math.floor(Math.random() * 20) + 10;
    state.enemyHP -= damage;
    state.playerDefending = false;
    
    addCombatLog(`⚔️ Você atacou e causou ${damage} de dano!`);
    
    if (state.enemyHP <= 0) {
        endCombat(state, true);
        return;
    }
    
    enemyTurn(state);
}

function playerDefend(state) {
    state.playerDefending = true;
    addCombatLog(`🛡️ Você se defendeu!`);
    enemyTurn(state);
}

function enemyTurn(state) {
    setTimeout(() => {
        const damage = Math.floor(Math.random() * state.enemy.damage) + 5;
        const actualDamage = state.playerDefending ? Math.floor(damage / 2) : damage;
        
        state.playerHP -= actualDamage;
        state.playerDefending = false;
        
        addCombatLog(`😱 ${state.enemy.name} atacou você! Dano: ${actualDamage}`);
        updateCombatUI(state);
        
        if (state.playerHP <= 0) {
            endCombat(state, false);
        }
    }, 1000);
}

function addCombatLog(message) {
    const log = document.getElementById('combatLog');
    log.innerHTML = message + '<br>' + log.innerHTML.split('<br>')[0];
}

function endCombat(state, playerWon) {
    combatOverlay.classList.remove('active');
    gameState.inCombat = false;
    
    if (playerWon) {
        const reward = state.enemy.exp;
        gameState.points += reward;
        pointsDisplay.textContent = gameState.points;
        showDialog('Vitória! 🎉', `Você ganhou ${reward} ouro!`, 'success', '🧙');
    } else {
        showDialog('Derrota! 💀', `Você foi derrotado! Perdeu 100 ouro.`, 'fail', '😰');
        gameState.points = Math.max(0, gameState.points - 100);
        pointsDisplay.textContent = gameState.points;
    }
}

// Dialog system
function showDialog(title, text, type = 'normal', character = '🧙', buttons = null) {
    document.getElementById('dialogCharacter').textContent = character;
    document.getElementById('dialogText').textContent = text;
    
    const result = document.getElementById('dialogResult');
    result.textContent = title;
    result.className = 'dialog-result ' + type;
    
    const dialogButtons = document.getElementById('dialogButtons');
    dialogButtons.innerHTML = '';
    
    if (buttons) {
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `dialog-btn ${btn.class}`;
            button.textContent = btn.text;
            button.onclick = btn.action;
            dialogButtons.appendChild(button);
        });
    } else {
        const button = document.createElement('button');
        button.className = 'dialog-btn primary';
        button.textContent = 'Continuar';
        button.onclick = closeDialog;
        dialogButtons.appendChild(button);
    }
    
    dialogOverlay.classList.add('active');
}

function closeDialog() {
    dialogOverlay.classList.remove('active');
}

// Event listeners
negotiateBtn.addEventListener('click', negotiatePrice);
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    renderItems();
    showDialog('Bem-vindo! 🎮', 'Escolha seus itens ou negocie os preços!', 'normal', '🧙');
});

// Close dialog on overlay click
dialogOverlay.addEventListener('click', (e) => {
    if (e.target === dialogOverlay) closeDialog();
});