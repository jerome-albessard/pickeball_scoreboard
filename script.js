const scores = {
  a: 0,
  b: 0,
};

const elements = {
  teamNameButtons: document.querySelectorAll('.btn-text[data-target]'),
  teamNames: {
    a: document.getElementById('team-a-name'),
    b: document.getElementById('team-b-name'),
  },
  scores: {
    a: document.getElementById('team-a-score'),
    b: document.getElementById('team-b-score'),
  },
  gamePoint: document.getElementById('game-point'),
  serverTeam: document.getElementById('server-team'),
  serverPlayer: document.getElementById('server-player'),
  switchServer: document.getElementById('switch-server'),
  reset: document.getElementById('reset'),
  inputs: {
    pointsToWin: document.getElementById('points-to-win'),
    winBy: document.getElementById('win-by'),
  },
  dialog: document.getElementById('name-dialog'),
  dialogTitle: document.getElementById('dialog-title'),
  dialogInput: document.getElementById('team-name-input'),
};

const playerButtons = {
  a: [
    document.querySelector('[data-player="a-0"]'),
    document.querySelector('[data-player="a-1"]'),
  ],
  b: [
    document.querySelector('[data-player="b-0"]'),
    document.querySelector('[data-player="b-1"]'),
  ],
};

const state = {
  serverTeam: 'a',
  serverIndex: 0,
  pointsToWin: Number(elements.inputs.pointsToWin.value),
  winBy: Number(elements.inputs.winBy.value),
  dialogContext: null,
};

function getServerPlayerElement() {
  return playerButtons[state.serverTeam][state.serverIndex];
}

function updateServerDisplay() {
  elements.serverTeam.textContent = elements.teamNames[state.serverTeam].textContent;
  elements.serverPlayer.textContent = getServerPlayerElement().textContent;
  document.querySelectorAll('.player-name').forEach((button) => {
    button.classList.remove('is-serving');
  });
  getServerPlayerElement().classList.add('is-serving');
}

function updateScores() {
  elements.scores.a.textContent = scores.a;
  elements.scores.b.textContent = scores.b;
  updateGamePointMessage();
}

function updateGamePointMessage() {
  const leader = scores.a === scores.b ? null : scores.a > scores.b ? 'a' : 'b';
  if (!leader) {
    elements.gamePoint.textContent = '';
    return;
  }

  const leaderScore = scores[leader];
  const otherScore = scores[leader === 'a' ? 'b' : 'a'];
  const lead = leaderScore - otherScore;

  if (leaderScore >= state.pointsToWin - 1) {
    if (
      leaderScore >= state.pointsToWin &&
      lead >= state.winBy
    ) {
      elements.gamePoint.textContent = `${elements.teamNames[leader].textContent} gagne !`;
    } else {
      elements.gamePoint.textContent = `${elements.teamNames[leader].textContent} balle de match`;
    }
  } else {
    elements.gamePoint.textContent = '';
  }
}

function handleScoreChange(team, delta) {
  const nextValue = scores[team] + delta;
  if (nextValue < 0) return;
  scores[team] = nextValue;
  updateScores();
  checkWinner(team);
}

function checkWinner(team) {
  const opponent = team === 'a' ? 'b' : 'a';
  const diff = scores[team] - scores[opponent];
  if (scores[team] >= state.pointsToWin && diff >= state.winBy) {
    elements.gamePoint.textContent = `${elements.teamNames[team].textContent} remporte la manche !`;
  }
}

function switchServer() {
  if (state.serverIndex === 0) {
    state.serverIndex = 1;
  } else {
    state.serverTeam = state.serverTeam === 'a' ? 'b' : 'a';
    state.serverIndex = 0;
  }
  updateServerDisplay();
}

function resetGame() {
  scores.a = 0;
  scores.b = 0;
  state.serverTeam = 'a';
  state.serverIndex = 0;
  updateServerDisplay();
  state.pointsToWin = Number(elements.inputs.pointsToWin.value) || 11;
  state.winBy = Number(elements.inputs.winBy.value) || 2;
  updateScores();
}

function openNameDialog({ type, team, playerIndex = null }) {
  state.dialogContext = { type, team, playerIndex };
  const value =
    type === 'team'
      ? elements.teamNames[team].textContent
      : playerButtons[team][playerIndex].textContent;
  elements.dialogTitle.textContent =
    type === 'team' ? "Nom de l'équipe" : 'Nom du joueur/joueuse';
  elements.dialogInput.value = value;
  elements.dialog.showModal();
  elements.dialogInput.focus();
}

function handleDialogClose(event) {
  if (event.target.returnValue !== 'confirm') {
    state.dialogContext = null;
    return;
  }
  const value = elements.dialogInput.value.trim();
  if (!value) return;
  const context = state.dialogContext;
  if (!context) return;
  if (context.type === 'team') {
    elements.teamNames[context.team].textContent = value;
  } else {
    playerButtons[context.team][context.playerIndex].textContent = value;
  }
  updateServerDisplay();
  updateGamePointMessage();
  state.dialogContext = null;
}

// Event listeners
document.querySelectorAll('.btn[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const team = button.dataset.team;
    const action = button.dataset.action;
    handleScoreChange(team, action === 'increment' ? 1 : -1);
  });
});

elements.switchServer.addEventListener('click', switchServer);
elements.reset.addEventListener('click', resetGame);

elements.inputs.pointsToWin.addEventListener('change', (event) => {
  const value = Number(event.target.value);
  if (value >= 1) {
    state.pointsToWin = value;
    updateGamePointMessage();
  }
});

elements.inputs.winBy.addEventListener('change', (event) => {
  const value = Number(event.target.value);
  if (value >= 1) {
    state.winBy = value;
    updateGamePointMessage();
  }
});

elements.teamNameButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const team = button.dataset.target === 'team-a' ? 'a' : 'b';
    openNameDialog({ type: 'team', team });
  });
});

document.querySelectorAll('.player-name').forEach((button) => {
  button.addEventListener('click', () => {
    const [team, index] = button.dataset.player.split('-');
    openNameDialog({ type: 'player', team, playerIndex: Number(index) });
  });
});

elements.dialog.addEventListener('close', handleDialogClose);

// initial state
resetGame();
