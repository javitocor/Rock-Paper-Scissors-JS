// Game state
const gameState = {
  playerScore: 0,
  computerScore: 0,
  isGameActive: false,
  currentRound: 1,
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  choiceHistory: {
    player: [],
    computer: []
  },
  choiceCounts: {
    rock: 0,
    paper: 0,
    scissors: 0
  },
  timer: 30,
  timerInterval: null,
  soundEnabled: true,
  isChallengeMode: false,
  sessionHistory: [] // Track recent games
};

// DOM Elements
const elements = {
  startScreen: document.getElementById('start'),
  gameScreen: document.getElementById('game'),
  startBtn: document.getElementById('startBtn'),
  challengeBtn: document.getElementById('challengeBtn'),
  resetBtn: document.getElementById('resetBtn'),
  soundToggle: document.getElementById('soundToggle'),
  rock: document.getElementById('rock'),
  paper: document.getElementById('paper'),
  scissors: document.getElementById('scissors'),
  message: document.getElementById('message'),
  playerScore: document.getElementById('playerScore'),
  computerScore: document.getElementById('computerScore'),
  playerChoice: document.getElementById('playerChoice'),
  computerChoice: document.getElementById('computerChoice'),
  timer: document.getElementById('timer'),
  currentRound: document.getElementById('currentRound'),
  instructionsBtn: document.getElementById('instructionsBtn'),
  instructionsModal: document.getElementById('instructions'),
  closeInstructions: document.getElementById('closeInstructions'),
  historyBtn: document.getElementById('historyBtn'),
  historyModal: document.getElementById('history'),
  closeHistory: document.getElementById('closeHistory'),
  totalWins: document.getElementById('totalWins'),
  totalGames: document.getElementById('totalGames'),
  winRate: document.getElementById('winRate')
};

// Sound effects
const sounds = {
  click: new Audio('https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3')
};

// Initialize sound state
function initializeSound() {
  gameState.soundEnabled = true;
  elements.soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
}

function playSound() {
  if (gameState.soundEnabled) {
    sounds.click.currentTime = 0;
    sounds.click.play();
  }
}

function toggleSound() {
  gameState.soundEnabled = !gameState.soundEnabled;
  elements.soundToggle.innerHTML = gameState.soundEnabled ? 
    '<i class="fas fa-volume-up"></i>' : 
    '<i class="fas fa-volume-mute"></i>';
}

// Game logic
function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function getWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) return 'draw';
  
  const winningCombos = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return winningCombos[playerChoice] === computerChoice ? 'player' : 'computer';
}

function updateScore(winner) {
  if (winner === 'player') {
    gameState.playerScore++;
    elements.playerScore.textContent = gameState.playerScore;
    gameState.totalWins++;
    playSound();
  } else if (winner === 'computer') {
    gameState.computerScore++;
    elements.computerScore.textContent = gameState.computerScore;
    gameState.totalLosses++;
    playSound();
  } else {
    playSound();
  }
  
  gameState.totalGames++;
  updateStats();
}

function displayChoices(playerChoice, computerChoice) {
  elements.playerChoice.innerHTML = `<i class="fas fa-hand-${playerChoice}"></i>`;
  elements.computerChoice.innerHTML = `<i class="fas fa-hand-${computerChoice}"></i>`;
  
  // Add shake animation
  elements.playerChoice.classList.add('shake');
  elements.computerChoice.classList.add('shake');
  
  // Remove animation class after it completes
  setTimeout(() => {
    elements.playerChoice.classList.remove('shake');
    elements.computerChoice.classList.remove('shake');
  }, 500);
  
  // Update choice history
  gameState.choiceHistory.player.push(playerChoice);
  gameState.choiceHistory.computer.push(computerChoice);
  updateChoiceHistory();
  
  // Update choice counts
  gameState.choiceCounts[playerChoice]++;
  updateChoiceBars();
}

function updateChoiceHistory() {
  const maxHistory = 5;
  const playerHistory = gameState.choiceHistory.player.slice(-maxHistory);
  const computerHistory = gameState.choiceHistory.computer.slice(-maxHistory);
  
  elements.playerHistory.innerHTML = playerHistory
    .map(choice => `<i class="fas fa-hand-${choice}"></i>`)
    .join('');
  
  elements.computerHistory.innerHTML = computerHistory
    .map(choice => `<i class="fas fa-hand-${choice}"></i>`)
    .join('');
}

function updateChoiceBars() {
  const total = Object.values(gameState.choiceCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return;
  
  Object.entries(gameState.choiceCounts).forEach(([choice, count]) => {
    const percentage = (count / total) * 100;
    elements.stats[`${choice}Bar`].style.width = `${percentage}%`;
  });
}

function updateMessage(winner) {
  const messages = {
    player: 'You win this round! 🎉',
    computer: 'Computer wins this round! 😢',
    draw: 'It\'s a draw! 🤝'
  };
  
  elements.message.textContent = messages[winner];
  elements.message.style.color = winner === 'draw' ? 'var(--draw-color)' : 
                               winner === 'player' ? 'var(--win-color)' : 
                               'var(--lose-color)';
  elements.message.classList.add('pulse');
  setTimeout(() => elements.message.classList.remove('pulse'), 500);
}

function updateStats() {
  // Update stats modal
  elements.stats.totalGames.textContent = gameState.totalGames;
  elements.stats.wins.textContent = gameState.totalWins;
  elements.stats.losses.textContent = gameState.totalLosses;
  elements.stats.winRate.textContent = 
    Math.round((gameState.totalWins / gameState.totalGames) * 100) || 0;
  
  // Update quick stats
  elements.quickStats.totalWins.textContent = gameState.totalWins;
  elements.quickStats.totalGames.textContent = gameState.totalGames;
  elements.quickStats.winRate.textContent = 
    Math.round((gameState.totalWins / gameState.totalGames) * 100) || 0;

  // Update choice bars
  const total = Object.values(gameState.choiceCounts).reduce((a, b) => a + b, 0);
  if (total > 0) {
    Object.entries(gameState.choiceCounts).forEach(([choice, count]) => {
      const percentage = (count / total) * 100;
      const bar = elements.stats[`${choice}Bar`];
      if (bar) {
        bar.style.width = `${percentage}%`;
      }
    });
  }
}

function checkGameEnd() {
  if (gameState.playerScore === 5 || gameState.computerScore === 5) {
    const winner = gameState.playerScore === 5 ? 'player' : 'computer';
    elements.message.textContent = winner === 'player' ? 
      'Congratulations! You won the game! 🎉' : 
      'Game Over! Computer won! 😢';
    
    // Add to session history
    gameState.sessionHistory.unshift({
      result: winner,
      playerScore: gameState.playerScore,
      computerScore: gameState.computerScore,
      date: new Date().toLocaleTimeString()
    });
    if (gameState.sessionHistory.length > 10) {
      gameState.sessionHistory.length = 10;
    }

    stopTimer();
    setTimeout(() => {
      resetGame();
    }, 3000);
  }
}

function resetGame() {
  gameState.playerScore = 0;
  gameState.computerScore = 0;
  gameState.currentRound = 1;
  gameState.isGameActive = false;
  gameState.isChallengeMode = false;
  
  elements.playerScore.textContent = '0';
  elements.computerScore.textContent = '0';
  elements.currentRound.textContent = '1';
  elements.message.textContent = '';
  elements.playerChoice.innerHTML = '';
  elements.computerChoice.innerHTML = '';
  
  elements.startScreen.classList.remove('hidden');
  elements.gameScreen.classList.add('hidden');
  
  stopTimer();
}

function startTimer(duration) {
  gameState.timer = duration;
  elements.timer.textContent = gameState.timer;
  
  gameState.timerInterval = setInterval(() => {
    gameState.timer--;
    elements.timer.textContent = gameState.timer;
    
    if (gameState.timer <= 0) {
      clearInterval(gameState.timerInterval);
      if (gameState.isGameActive) {
        const computerChoice = getComputerChoice();
        playRound('rock'); // Default choice if time runs out
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(gameState.timerInterval);
}

function playRound(playerChoice) {
  if (!gameState.isGameActive) return;

  const choices = ['rock', 'paper', 'scissors'];
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  
  // Update choices display
  elements.playerChoice.innerHTML = `<i class="fas fa-hand-${playerChoice}"></i>`;
  elements.computerChoice.innerHTML = `<i class="fas fa-hand-${computerChoice}"></i>`;
  
  // Determine winner
  let result;
  if (playerChoice === computerChoice) {
    result = 'draw';
    elements.message.textContent = "It's a draw!";
    elements.message.style.color = 'var(--draw-color)';
    playSound('draw');
  } else if (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'rock') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
  ) {
    result = 'win';
    gameState.playerScore++;
    elements.playerScore.textContent = gameState.playerScore;
    elements.message.textContent = 'You win this round!';
    elements.message.style.color = 'var(--win-color)';
    playSound('win');
  } else {
    result = 'lose';
    gameState.computerScore++;
    elements.computerScore.textContent = gameState.computerScore;
    elements.message.textContent = 'Computer wins this round!';
    elements.message.style.color = 'var(--lose-color)';
    playSound('lose');
  }

  // Update round
  gameState.currentRound++;
  elements.currentRound.textContent = gameState.currentRound;

  // Check for game end
  checkGameEnd();
}

function startChallengeMode() {
  elements.startScreen.classList.add('hidden');
  elements.gameScreen.classList.remove('hidden');
  gameState.isGameActive = true;
  gameState.isChallengeMode = true;
  startTimer(15); // 15 seconds for challenge mode
  playSound('click');
}

// Initialize game
function initGame() {
  // Game buttons
  elements.startBtn.addEventListener('click', () => {
    elements.startScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    gameState.isGameActive = true;
    gameState.isChallengeMode = false;
    startTimer(30);
    playSound('click');
  });

  elements.challengeBtn.addEventListener('click', () => {
    startChallengeMode();
  });

  elements.resetBtn.addEventListener('click', () => {
    resetGame();
    playSound('click');
  });

  elements.soundToggle.addEventListener('click', () => {
    toggleSound();
    playSound('click');
  });

  // Choice buttons
  elements.rock.addEventListener('click', () => {
    if (gameState.isGameActive) {
      playRound('rock');
      playSound('click');
    }
  });

  elements.paper.addEventListener('click', () => {
    if (gameState.isGameActive) {
      playRound('paper');
      playSound('click');
    }
  });

  elements.scissors.addEventListener('click', () => {
    if (gameState.isGameActive) {
      playRound('scissors');
      playSound('click');
    }
  });

  // Modal buttons
  elements.instructionsBtn.addEventListener('click', () => {
    elements.instructionsModal.classList.remove('hidden');
    playSound('click');
  });

  elements.closeInstructions.addEventListener('click', () => {
    elements.instructionsModal.classList.add('hidden');
    playSound('click');
  });

  elements.historyBtn.addEventListener('click', () => {
    updateHistory();
    elements.historyModal.classList.remove('hidden');
    playSound('click');
  });

  elements.closeHistory.addEventListener('click', () => {
    elements.historyModal.classList.add('hidden');
    playSound('click');
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.instructionsModal) {
      elements.instructionsModal.classList.add('hidden');
    }
    if (e.target === elements.historyModal) {
      elements.historyModal.classList.add('hidden');
    }
  });

  // Initialize stats and history
  updateStats();
  updateHistory();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Update history modal
function updateHistory() {
  const historyList = document.getElementById('historyList');
  const sessionWinRate = document.getElementById('sessionWinRate');
  const sessionTotalGames = document.getElementById('sessionTotalGames');
  const sessionWins = document.getElementById('sessionWins');
  const sessionLosses = document.getElementById('sessionLosses');

  let wins = 0, losses = 0;
  gameState.sessionHistory.forEach(h => {
    if (h.result === 'player') wins++;
    if (h.result === 'computer') losses++;
  });
  const total = gameState.sessionHistory.length;
  sessionTotalGames.textContent = total;
  sessionWins.textContent = wins;
  sessionLosses.textContent = losses;
  sessionWinRate.textContent = total ? Math.round((wins / total) * 100) + '%' : '0%';

  historyList.innerHTML = '';
  if (total === 0) {
    historyList.innerHTML = '<li>No games played this session.</li>';
  } else {
    gameState.sessionHistory.forEach((h, i) => {
      const who = h.result === 'player' ? 'You' : h.result === 'computer' ? 'Computer' : 'Draw';
      const color = h.result === 'player' ? 'var(--win-color)' : h.result === 'computer' ? 'var(--lose-color)' : 'var(--draw-color)';
      historyList.innerHTML += `<li><span style='color:${color};font-weight:bold;'>${who}</span> <span>(${h.playerScore} - ${h.computerScore})</span> <span style='font-size:0.9em;color:#888;'>${h.date}</span></li>`;
    });
  }
}

// Initialize the game
initializeSound();