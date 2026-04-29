# ⚔️ 1v1 Character Battle Game

An epic online multiplayer 1v1 character battle game where players choose unique fighters with different abilities and compete in real-time combat!

## 🎮 Game Features

### **4 Unique Characters:**

- **⚔️ Warrior** (150 HP)
  - Heavy Attack: 25 damage
  - Shield Block: Reduces damage by 50%
  
- **🔥 Mage** (100 HP)
  - Fireball: 35 damage  
  - Teleport: Dodge incoming attacks
  
- **🏹 Archer** (120 HP)
  - Power Shot: 30 damage
  - Rapid Fire: 20 damage
  
- **🗡️ Rogue** (110 HP)
  - Backstab: 40 damage
  - Evasion: Dodge incoming attacks

### **Core Features:**
✅ **Online Multiplayer** - Real-time battles using Socket.io  
✅ **Room System** - Create or join rooms with unique codes  
✅ **Ability Cooldowns** - Strategic ability management  
✅ **Real-time Health Tracking** - Visual HP bars  
✅ **Battle Log** - Live action feed  
✅ **Dynamic Combat** - Block, dodge, and deal damage mechanics  
✅ **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Stevepana11/1v1-character-game.git
cd 1v1-character-game
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm start
```

4. **Open in your browser:**
```
http://localhost:3000
```

## 🎯 How to Play

### Creating a Game
1. Click **"Create Room"**
2. Enter your username
3. Select your character
4. Share the room code with a friend
5. Wait for them to join

### Joining a Game
1. Click **"Join Room"**
2. Enter your username
3. Enter the room code from your friend
4. Select your character
5. Battle!

### Battle Mechanics
- **Abilities**: Each character has 2 unique abilities
- **Cooldowns**: Abilities go on cooldown after use
- **Blocking**: Some abilities reduce incoming damage by 50%
- **Dodging**: Some abilities completely avoid attacks
- **Damage**: Direct attacks deal full damage unless blocked/dodged

## 📁 Project Structure

```
1v1-character-game/
├── server.js              # Express + Socket.io backend
├── package.json           # Project dependencies
├── public/
│   ├── index.html        # Game UI
│   ├── game.js           # Client-side game logic
│   └── styles.css        # Styling
└── README.md             # This file
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript
- **Communication**: WebSocket (real-time multiplayer)

## 🎮 Game Mechanics

### Character Balance
- **Warrior**: High HP, medium damage, strong defense
- **Mage**: Low HP, highest damage, can dodge attacks
- **Archer**: Medium HP, medium damage, balanced abilities
- **Rogue**: Medium HP, high burst damage, fast abilities

### Combat System
1. Both players can use abilities simultaneously
2. Ability effects are calculated server-side for fairness
3. Blocking reduces 50% of incoming damage
4. Dodging completely negates incoming attack
5. First player to reach 0 HP loses

### Ability Types
- **Damage Abilities**: Deal direct damage to opponent
- **Block Abilities**: Reduce incoming damage by 50%
- **Dodge Abilities**: Completely avoid incoming attacks

## 📡 Real-Time Updates

All game events are synchronized in real-time:
- Health updates
- Ability usage and cooldowns
- Battle log entries
- Game state changes

## 🔐 Security Notes

- Game logic runs server-side to prevent cheating
- All damage calculations are verified by server
- Player states are managed securely
- Room codes are random and unique

## 🎨 UI/UX Highlights

- **Beautiful Gradients**: Modern color scheme
- **Smooth Animations**: Fade and slide effects
- **Health Bars**: Visual HP representation
- **Battle Log**: Color-coded action feed
- **Character Cards**: Interactive selection UI
- **Responsive**: Mobile-friendly design

## 🐛 Debugging Tips

### Connection Issues
- Make sure server is running on port 3000
- Check browser console for Socket.io errors
- Verify firewall allows localhost:3000

### Game Issues
- Refresh page if abilities don't update
- Check battle log for ability cooldown status
- Ensure opponent is still connected

## 🚀 Future Enhancements

- [ ] Player accounts and rankings
- [ ] More characters (10+)
- [ ] Item shop and cosmetics
- [ ] Chat functionality
- [ ] Spectate matches
- [ ] Tournaments and events
- [ ] Sound effects and music
- [ ] Mobile app
- [ ] Replay system

## 📝 License

This project is open source under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Ready to battle? Pick your character and crush your opponents! ⚔️🔥🏹🗡️**
