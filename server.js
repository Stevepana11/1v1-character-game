const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Character definitions
const characters = {
    warrior: {
        name: 'Warrior',
        hp: 150,
        maxHp: 150,
        abilities: ['heavy_attack', 'shield_block'],
        emoji: '⚔️'
    },
    mage: {
        name: 'Mage',
        hp: 100,
        maxHp: 100,
        abilities: ['fireball', 'teleport'],
        emoji: '🔥'
    },
    archer: {
        name: 'Archer',
        hp: 120,
        maxHp: 120,
        abilities: ['power_shot', 'rapid_fire'],
        emoji: '🏹'
    },
    rogue: {
        name: 'Rogue',
        hp: 110,
        maxHp: 110,
        abilities: ['backstab', 'evasion'],
        emoji: '🗡️'
    }
};

// Ability definitions
const abilities = {
    heavy_attack: { name: 'Heavy Attack', damage: 25, cooldown: 2 },
    shield_block: { name: 'Shield Block', damage: 0, cooldown: 3, block: true },
    fireball: { name: 'Fireball', damage: 35, cooldown: 2.5 },
    teleport: { name: 'Teleport', damage: 0, cooldown: 3, dodge: true },
    power_shot: { name: 'Power Shot', damage: 30, cooldown: 2 },
    rapid_fire: { name: 'Rapid Fire', damage: 20, cooldown: 2 },
    backstab: { name: 'Backstab', damage: 40, cooldown: 3 },
    evasion: { name: 'Evasion', damage: 0, cooldown: 2.5, dodge: true }
};

// Game room class
class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = {};
        this.playerData = {};
        this.gameState = 'waiting'; // waiting, playing, ended
        this.battleLog = [];
        this.cooldowns = {};
        this.blocking = {};
        this.dodging = {};
    }

    addPlayer(socketId, username, character) {
        const charData = characters[character];
        this.players[socketId] = {
            socketId,
            username,
            character,
            characterEmoji: charData.emoji
        };
        this.playerData[socketId] = {
            hp: charData.hp,
            maxHp: charData.maxHp,
            abilities: charData.abilities
        };
        this.cooldowns[socketId] = {};
        this.blocking[socketId] = false;
        this.dodging[socketId] = false;

        charData.abilities.forEach(ability => {
            this.cooldowns[socketId][ability] = 0;
        });
    }

    isFull() {
        return Object.keys(this.players).length >= 2;
    }

    startGame() {
        this.gameState = 'playing';
        this.battleLog = [];
        this.battleLog.push('Battle started!');
    }

    getOpponent(socketId) {
        const playerIds = Object.keys(this.players);
        return playerIds.find(id => id !== socketId);
    }

    useAbility(socketId, abilityKey) {
        const opponent = this.getOpponent(socketId);
        if (!opponent) return { success: false };

        const ability = abilities[abilityKey];
        if (!ability) return { success: false };

        // Check cooldown
        if (this.cooldowns[socketId][abilityKey] > 0) {
            return { success: false, message: 'Ability on cooldown' };
        }

        const player = this.players[socketId];
        let damage = ability.damage;
        let message = `${player.username} used ${ability.name}!`;

        // Reset blocking and dodging
        this.blocking[socketId] = false;
        this.dodging[socketId] = false;
        this.blocking[opponent] = false;
        this.dodging[opponent] = false;

        // Handle ability effects
        if (ability.dodge) {
            message += ' (Dodged incoming attacks!)';
            this.dodging[socketId] = true;
        } else if (ability.block) {
            message += ' (Blocking!)';
            this.blocking[socketId] = true;
        } else if (damage > 0) {
            // Apply damage with modifications
            if (this.blocking[opponent]) {
                damage = Math.ceil(damage * 0.5);
                message += ` dealt ${damage} damage (Blocked!)`;
            } else if (this.dodging[opponent]) {
                message += ' (Dodged!)';
                damage = 0;
            } else {
                message += ` dealt ${damage} damage!`;
            }

            if (damage > 0) {
                this.playerData[opponent].hp = Math.max(0, this.playerData[opponent].hp - damage);
            }
        }

        // Set cooldown
        this.cooldowns[socketId][abilityKey] = ability.cooldown;

        // Check for game end
        if (this.playerData[opponent].hp <= 0) {
            this.gameState = 'ended';
            message += ` 🎉 ${player.username} wins!`;
        }

        this.battleLog.push(message);

        // Update cooldowns
        this.updateCooldowns();

        return {
            success: true,
            message,
            player1: {
                username: this.players[Object.keys(this.players)[0]].username,
                character: this.players[Object.keys(this.players)[0]].character,
                ...this.playerData[Object.keys(this.players)[0]]
            },
            player2: {
                username: this.players[Object.keys(this.players)[1]].username,
                character: this.players[Object.keys(this.players)[1]].character,
                ...this.playerData[Object.keys(this.players)[1]]
            }
        };
    }

    updateCooldowns() {
        Object.keys(this.cooldowns).forEach(socketId => {
            Object.keys(this.cooldowns[socketId]).forEach(abilityKey => {
                if (this.cooldowns[socketId][abilityKey] > 0) {
                    this.cooldowns[socketId][abilityKey] -= 0.1;
                }
            });
        });
    }

    getState() {
        const playerIds = Object.keys(this.players);
        if (playerIds.length < 2) return null;

        return {
            player1: {
                username: this.players[playerIds[0]].username,
                character: this.players[playerIds[0]].character,
                ...this.playerData[playerIds[0]]
            },
            player2: {
                username: this.players[playerIds[1]].username,
                character: this.players[playerIds[1]].character,
                ...this.playerData[playerIds[1]]
            },
            log: this.battleLog,
            gameState: this.gameState
        };
    }
}

// Store rooms
const rooms = new Map();

// Helper function to generate room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (data) => {
        const { username, character } = data;
        
        let roomId;
        do {
            roomId = generateRoomId();
        } while (rooms.has(roomId));

        const room = new GameRoom(roomId);
        room.addPlayer(socket.id, username, character);
        rooms.set(roomId, room);

        socket.join(roomId);
        socket.emit('room_created', { roomId });

        console.log(`Room ${roomId} created by ${username}`);
    });

    socket.on('join_room', (data) => {
        const { roomId, username, character } = data;
        const room = rooms.get(roomId.toUpperCase());

        if (!room) {
            socket.emit('error_message', { message: 'Room not found!' });
            return;
        }

        if (room.isFull()) {
            socket.emit('error_message', { message: 'Room is full!' });
            return;
        }

        room.addPlayer(socket.id, username, character);
        socket.join(roomId);

        // Notify both players
        const playerIds = Object.keys(room.players);
        const player1Data = room.players[playerIds[0]];
        const player2Data = room.players[playerIds[1]];

        io.to(roomId).emit('player_joined', {
            player1: { username: player1Data.username, character: player1Data.character },
            player2: { username: player2Data.username, character: player2Data.character }
        });

        // Start game
        room.startGame();
        io.to(roomId).emit('game_started', room.getState());

        console.log(`${username} joined room ${roomId}`);
    });

    socket.on('use_ability', (data) => {
        const { roomId, abilityKey } = data;
        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('error_message', { message: 'Room not found!' });
            return;
        }

        const result = room.useAbility(socket.id, abilityKey);

        if (result.success) {
            io.to(roomId).emit('game_update', {
                player1: result.player1,
                player2: result.player2,
                log: room.battleLog
            });

            if (room.gameState === 'ended') {
                const playerIds = Object.keys(room.players);
                const winner = room.playerData[socket.id].hp > 0 ? socket.id : room.getOpponent(socket.id);
                io.to(roomId).emit('game_over', {
                    winner: room.players[winner].username,
                    loser: room.players[room.getOpponent(winner)].username
                });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find and clean up room
        for (const [roomId, room] of rooms.entries()) {
            if (room.players[socket.id]) {
                io.to(roomId).emit('error_message', { message: 'Opponent disconnected!' });
                rooms.delete(roomId);
                break;
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 Game server running on http://localhost:${PORT}`);
    console.log('Ready for players to connect!');
});
