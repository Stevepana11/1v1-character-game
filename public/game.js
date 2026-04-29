// Socket connection
const socket = io();

// Game state
let currentRoom = null;
let currentUsername = null;
let selectedCharacter = null;
let gameState = null;

// Character data
const characters = {
    warrior: {
        name: 'Warrior',
        emoji: '⚔️',
        hp: 150,
        abilities: ['heavy_attack', 'shield_block'],
        description: 'Tanky with strong attacks'
    },
    mage: {
        name: 'Mage',
        emoji: '🔥',
        hp: 100,
        abilities: ['fireball', 'teleport'],
        description: 'High damage spells'
    },
    archer: {
        name: 'Archer',
        emoji: '🏹',
        hp: 120,
        abilities: ['power_shot', 'rapid_fire'],
        description: 'Balanced fighter'
    },
    rogue: {
        name: 'Rogue',
        emoji: '🗡️',
        hp: 110,
        abilities: ['backstab', 'evasion'],
        description: 'Fast and deadly'
    }
};

const abilities = {
    heavy_attack: { name: 'Heavy Attack', cooldown: 2 },
    shield_block: { name: 'Shield Block', cooldown: 3 },
    fireball: { name: 'Fireball', cooldown: 2.5 },
    teleport: { name: 'Teleport', cooldown: 3 },
    power_shot: { name: 'Power Shot', cooldown: 2 },
    rapid_fire: { name: 'Rapid Fire', cooldown: 2 },
    backstab: { name: 'Backstab', cooldown: 3 },
    evasion: { name: 'Evasion', cooldown: 2.5 }
};

// UI Functions
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
}

function selectCharacter(charKey, element) {
    selectedCharacter = charKey;
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    if (element) element.classList.add('selected');
    
    // Enable confirm button if username is filled
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = !selectedCharacter;
    }
}

// Menu Navigation
function showCreateRoom() {
    selectedCharacter = null;
    showScreen('createRoomScreen');
}

function showJoinRoom() {
    selectedCharacter = null;
    showScreen('joinRoomScreen');
}

function showMenu() {
    selectedCharacter = null;
    showScreen('menuScreen');
}

// Create Room
function createRoom() {
    const username = document.getElementById('createUsername').value.trim();
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    if (!selectedCharacter) {
        alert('Please select a character');
        return;
    }

    currentUsername = username;
    socket.emit('create_room', {
        username: username,
        character: selectedCharacter
    });
}

// Join Room
function joinRoom() {
    const roomId = document.getElementById('roomIdInput').value.trim().toUpperCase();
    const username = document.getElementById('joinUsername').value.trim();
    
    if (!roomId) {
        alert('Please enter a room ID');
        return;
    }
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    if (!selectedCharacter) {
        alert('Please select a character');
        return;
    }

    currentUsername = username;
    currentRoom = roomId;
    
    socket.emit('join_room', {
        roomId: roomId,
        username: username,
        character: selectedCharacter
    });
}

// Game Display Functions
function updateGameDisplay(data) {
    const player1 = data.player1;
    const player2 = data.player2;

    // Update player 1
    document.getElementById('player1Name').textContent = `${player1.character.emoji || ''} ${player1.username}`;
    document.getElementById('player1HP').textContent = `HP: ${player1.hp}/${player1.maxHp}`;
    const healthPercent1 = (player1.hp / player1.maxHp) * 100;
    const healthBar1 = document.getElementById('player1Health');
    healthBar1.style.width = healthPercent1 + '%';
    if (healthPercent1 <= 30) {
        healthBar1.classList.add('low');
    } else {
        healthBar1.classList.remove('low');
    }

    // Update player 2
    document.getElementById('player2Name').textContent = `${player2.character.emoji || ''} ${player2.username}`;
    document.getElementById('player2HP').textContent = `HP: ${player2.hp}/${player2.maxHp}`;
    const healthPercent2 = (player2.hp / player2.maxHp) * 100;
    const healthBar2 = document.getElementById('player2Health');
    healthBar2.style.width = healthPercent2 + '%';
    if (healthPercent2 <= 30) {
        healthBar2.classList.add('low');
    } else {
        healthBar2.classList.remove('low');
    }

    // Update battle log
    if (data.log && data.log.length > 0) {
        const battleLog = document.getElementById('battleLog');
        battleLog.innerHTML = '';
        data.log.forEach(entry => {
            const logEntry = document.createElement('p');
            logEntry.className = 'log-entry';
            
            if (entry.includes('damage')) {
                logEntry.classList.add('damage');
            } else if (entry.includes('Dodged') || entry.includes('Teleport')) {
                logEntry.classList.add('dodge');
            }
            
            logEntry.textContent = entry;
            battleLog.appendChild(logEntry);
        });
        battleLog.scrollTop = battleLog.scrollHeight;
    }
}

function displayAbilities(charKey) {
    const charAbilities = characters[charKey].abilities;
    const container = document.getElementById('abilitiesContainer');
    container.innerHTML = '';

    charAbilities.forEach(abilityKey => {
        const ability = abilities[abilityKey];
        const btn = document.createElement('button');
        btn.className = 'ability-btn';
        btn.innerHTML = `
            <span class="ability-name">${ability.name}</span>
            <span class="ability-cooldown">CD: ${ability.cooldown}s</span>
        `;
        btn.onclick = () => useAbility(abilityKey);
        container.appendChild(btn);
    });
}

function useAbility(abilityKey) {
    if (!currentRoom) return;

    socket.emit('use_ability', {
        roomId: currentRoom,
        abilityKey: abilityKey
    });
}

function returnToMenu() {
    currentRoom = null;
    currentUsername = null;
    selectedCharacter = null;
    showMenu();
}

// Socket Events
socket.on('room_created', (data) => {
    currentRoom = data.roomId;
    document.getElementById('displayRoomId').textContent = data.roomId;
    showScreen('waitingScreen');
    console.log('Room created:', data.roomId);
});

socket.on('player_joined', (data) => {
    console.log('Player joined');
});

socket.on('game_started', (data) => {
    console.log('Game started');
    gameState = data;
    
    const charKey = selectedCharacter;
    displayAbilities(charKey);
    updateGameDisplay(data);
    showScreen('gameScreen');
});

socket.on('game_update', (data) => {
    gameState = data;
    updateGameDisplay(data);
});

socket.on('game_over', (data) => {
    const isWinner = data.winner === currentUsername;
    const gameOverContent = document.getElementById('gameOverContent');
    
    if (isWinner) {
        gameOverContent.className = 'game-over-content victory';
        gameOverContent.innerHTML = `
            <h2>🎉 Victory!</h2>
            <p>You defeated ${data.loser}!</p>
        `;
    } else {
        gameOverContent.className = 'game-over-content defeat';
        gameOverContent.innerHTML = `
            <h2>💔 Defeat</h2>
            <p>${data.winner} defeated you!</p>
        `;
    }
    
    showScreen('gameOverScreen');
});

socket.on('error_message', (data) => {
    alert('Error: ' + data.message);
    showMenu();
});

// Initialize character selection grids
function initializeCharacterSelections() {
    const createScreen = document.getElementById('createRoomScreen');
    const joinScreen = document.getElementById('joinRoomScreen');

    [createScreen, joinScreen].forEach(screen => {
        const grid = screen.querySelector('.character-grid');
        if (grid && grid.children.length === 0) {
            Object.entries(characters).forEach(([key, char]) => {
                const card = document.createElement('div');
                card.className = 'character-card';
                card.innerHTML = `
                    <h3>${char.emoji} ${char.name}</h3>
                    <p><strong>Health:</strong> ${char.hp}</p>
                    <p><strong>Type:</strong> ${char.description}</p>
                `;
                card.onclick = () => selectCharacter(key, card);
                grid.appendChild(card);
            });
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCharacterSelections();
    showScreen('menuScreen');
});
