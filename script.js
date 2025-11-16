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
  server: document.getElementById('server-name'),
  switchServer: document.getElementById('switch-server'),
  reset: document.getElementById('reset'),
  inputs: {
    pointsToWin: document.getElementById('points-to-win'),
    winBy: document.getElementById('win-by'),
  },
  dialog: document.getElementById('name-dialog'),
  dialogInput: document.getElementById('team-name-input'),
};

const state = {
  server: 'a',
  pointsToWin: Number(elements.inputs.pointsToWin.value),
  winBy: Number(elements.inputs.winBy.value),
  dialogTarget: null,
};

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
  state.server = state.server === 'a' ? 'b' : 'a';
  elements.server.textContent = elements.teamNames[state.server].textContent;
}

function resetGame() {
  scores.a = 0;
  scores.b = 0;
  state.server = 'a';
  elements.server.textContent = elements.teamNames[state.server].textContent;
  state.pointsToWin = Number(elements.inputs.pointsToWin.value) || 11;
  state.winBy = Number(elements.inputs.winBy.value) || 2;
  updateScores();
}

function openNameDialog(team) {
  state.dialogTarget = team;
  elements.dialogInput.value = elements.teamNames[team].textContent;
  elements.dialog.showModal();
  elements.dialogInput.focus();
}

function handleDialogClose(event) {
  if (event.target.returnValue !== 'confirm') return;
  const value = elements.dialogInput.value.trim();
  if (!value) return;
  const target = state.dialogTarget;
  elements.teamNames[target].textContent = value;
  if (state.server === target) {
    elements.server.textContent = value;
  }
  updateGamePointMessage();
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
    openNameDialog(team);
  });
});

elements.dialog.addEventListener('close', handleDialogClose);

// initial state
resetGame();
