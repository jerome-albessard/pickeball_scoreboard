const elements = {
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
  status: {
    score: document.getElementById('status-score'),
    server: document.getElementById('status-server'),
    side: document.getElementById('status-side'),
    call: document.getElementById('status-call'),
    lastAction: document.getElementById('last-action'),
    message: document.getElementById('status-message'),
  },
  inputs: {
    pointsToWin: document.getElementById('points-to-win'),
    winBy: document.getElementById('win-by'),
  },
  reset: document.getElementById('reset'),
  modeButtons: document.querySelectorAll('[data-mode]'),
  actionButtons: document.querySelectorAll('[data-action]'),
  dialog: document.getElementById('name-dialog'),
  dialogTitle: document.getElementById('dialog-title'),
  dialogInput: document.getElementById('team-name-input'),
  nameButtons: document.querySelectorAll('.btn-text[data-target]'),
  playerButtons: document.querySelectorAll('.player-name'),
};

const players = {
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
  mode: 'doubles',
  scores: { a: 0, b: 0 },
  serverTeam: 'a',
  serverNumber: 1,
  pointsToWin: Number(elements.inputs.pointsToWin.value) || 11,
  winBy: Number(elements.inputs.winBy.value) || 2,
  openingServeTeam: 'a',
  openingServeRestriction: true,
  history: [],
  dialogContext: null,
  lastAction: 'Match prêt.',
  matchOver: false,
};

function getTeamName(team) {
  return elements.teamNames[team].textContent;
}

function getOpponent(team) {
  return team === 'a' ? 'b' : 'a';
}

function getServerPlayerButton() {
  const index = state.serverNumber === 1 ? 0 : 1;
  return players[state.serverTeam][index] || players[state.serverTeam][0];
}

function updatePlayerHighlight() {
  elements.playerButtons.forEach((button) => button.classList.remove('is-serving'));
  const current = getServerPlayerButton();
  if (current) {
    current.classList.add('is-serving');
  }
}

function computeServeSide() {
  const score = state.scores[state.serverTeam];
  return score % 2 === 0 ? 'droite' : 'gauche';
}

function updateStatusPanel() {
  elements.status.score.textContent = `${getTeamName('a')} ${state.scores.a} – ${state.scores.b} ${getTeamName('b')}`;
  const serverLabel =
    state.mode === 'singles'
      ? `${getTeamName(state.serverTeam)}, serveur unique`
      : `${getTeamName(state.serverTeam)}, serveur ${state.serverNumber}`;
  elements.status.server.textContent = serverLabel;
  elements.status.side.textContent = computeServeSide();
  elements.status.call.textContent = `${state.scores[state.serverTeam]}-${
    state.scores[getOpponent(state.serverTeam)]
  }-${state.mode === 'singles' ? 1 : state.serverNumber}`;
  elements.status.lastAction.textContent = state.lastAction;
  elements.serverTeam.textContent = getTeamName(state.serverTeam);
  elements.serverPlayer.textContent = getServerPlayerButton().textContent;
}

function syncModeButtons() {
  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === state.mode;
    button.setAttribute('aria-pressed', String(isActive));
    button.classList.toggle('is-active', isActive);
  });
}

function updateGamePointMessage() {
  const leader = state.scores.a === state.scores.b ? null : state.scores.a > state.scores.b ? 'a' : 'b';
  if (!leader) {
    elements.gamePoint.textContent = '';
    return;
  }
  const leaderScore = state.scores[leader];
  const opponent = getOpponent(leader);
  const diff = leaderScore - state.scores[opponent];
  if (leaderScore >= state.pointsToWin - 1) {
    if (leaderScore >= state.pointsToWin && diff >= state.winBy) {
      elements.gamePoint.textContent = `Victoire de ${getTeamName(leader)} : ${leaderScore}–${state.scores[opponent]} !`;
    } else {
      elements.gamePoint.textContent = `${getTeamName(leader)} balle de match`;
    }
  } else {
    elements.gamePoint.textContent = '';
  }
}

function setMessage(type, message) {
  elements.status.message.textContent = message;
  elements.status.message.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    elements.status.message.classList.add('is-error');
  }
  if (type === 'success') {
    elements.status.message.classList.add('is-success');
  }
}

function snapshot() {
  return JSON.parse(
    JSON.stringify({
      scores: state.scores,
      serverTeam: state.serverTeam,
      serverNumber: state.serverNumber,
      openingServeTeam: state.openingServeTeam,
      openingServeRestriction: state.openingServeRestriction,
      lastAction: state.lastAction,
      matchOver: state.matchOver,
    }),
  );
}

function pushHistory() {
  state.history.push(snapshot());
}

function restoreFromHistory(data) {
  state.scores = data.scores;
  state.serverTeam = data.serverTeam;
  state.serverNumber = data.serverNumber;
  state.openingServeTeam = data.openingServeTeam;
  state.openingServeRestriction = data.openingServeRestriction;
  state.lastAction = data.lastAction;
  state.matchOver = data.matchOver;
}

function updateScores() {
  elements.scores.a.textContent = state.scores.a;
  elements.scores.b.textContent = state.scores.b;
}

function announceVictory(team) {
  state.matchOver = true;
  state.lastAction = `Victoire de ${getTeamName(team)} : ${state.scores[team]}–${state.scores[getOpponent(team)]} !`;
  setMessage('success', state.lastAction);
}

function checkWinner(team) {
  const opponent = getOpponent(team);
  if (state.scores[team] >= state.pointsToWin && state.scores[team] - state.scores[opponent] >= state.winBy) {
    announceVictory(team);
  }
}

function updateUi() {
  updateScores();
  updatePlayerHighlight();
  updateStatusPanel();
  updateGamePointMessage();
}

function preventIfFinished() {
  if (state.matchOver) {
    setMessage('error', 'La partie est terminée. Relancez une manche.');
    return true;
  }
  return false;
}

function registerPoint(team) {
  if (preventIfFinished()) return;
  if (team !== state.serverTeam) {
    setMessage('error', `${getTeamName(team)} est en réception et ne peut pas marquer.`);
    return;
  }
  pushHistory();
  state.scores[team] += 1;
  state.lastAction = `Point validé pour ${getTeamName(team)}.`;
  setMessage('success', state.lastAction);
  checkWinner(team);
  updateUi();
}

function transferService(nextTeam) {
  state.serverTeam = nextTeam;
  state.serverNumber = 1;
  state.openingServeRestriction = false;
}

function handleSideOut(message) {
  transferService(getOpponent(state.serverTeam));
  state.lastAction = message;
}

function registerFault() {
  if (preventIfFinished()) return;
  pushHistory();
  if (state.mode === 'singles') {
    handleSideOut(`Faute de service ${getTeamName(state.serverTeam)}.`);
  } else if (state.openingServeRestriction && state.serverTeam === state.openingServeTeam) {
    handleSideOut(`Faute de service : on passe directement à l'équipe adverse.`);
  } else if (state.serverNumber === 1) {
    state.serverNumber = 2;
    state.lastAction = `${getTeamName(state.serverTeam)} passe à son serveur 2.`;
  } else {
    handleSideOut(`Side-out : ${getTeamName(getOpponent(state.serverTeam))} prend le service.`);
  }
  setMessage('info', state.lastAction);
  updateUi();
}

function assignServe(team) {
  pushHistory();
  state.serverTeam = team;
  state.serverNumber = 1;
  state.openingServeTeam = team;
  state.openingServeRestriction = state.mode === 'doubles';
  state.lastAction = `Service donné à ${getTeamName(team)}.`;
  state.matchOver = false;
  setMessage('info', state.lastAction);
  updateUi();
}

function undoAction() {
  if (!state.history.length) {
    setMessage('error', 'Aucune action à annuler.');
    return;
  }
  const previous = state.history.pop();
  restoreFromHistory(previous);
  setMessage('info', 'Dernière action annulée.');
  updateUi();
}

function resetGame() {
  state.scores = { a: 0, b: 0 };
  state.serverTeam = 'a';
  state.serverNumber = 1;
  state.openingServeTeam = 'a';
  state.openingServeRestriction = state.mode === 'doubles';
  state.history = [];
  state.matchOver = false;
  state.lastAction = 'Nouvelle partie prête.';
  state.pointsToWin = Number(elements.inputs.pointsToWin.value) || 11;
  state.winBy = Number(elements.inputs.winBy.value) || 2;
  syncModeButtons();
  setMessage('info', `Match réinitialisé. Service pour ${getTeamName(state.serverTeam)}.`);
  updateUi();
}

function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  syncModeButtons();
  state.openingServeRestriction = mode === 'doubles';
  state.serverNumber = 1;
  state.lastAction = mode === 'doubles' ? 'Mode doubles activé.' : 'Mode simples activé.';
  state.history = [];
  state.matchOver = false;
  setMessage('info', state.lastAction);
  updateUi();
}

function handleModeClick(event) {
  const { mode } = event.currentTarget.dataset;
  setMode(mode);
  resetGame();
}

function openNameDialog({ type, team, playerIndex = null }) {
  state.dialogContext = { type, team, playerIndex };
  const value =
    type === 'team'
      ? elements.teamNames[team].textContent
      : players[team][playerIndex].textContent;
  elements.dialogTitle.textContent = type === 'team' ? "Nom de l'équipe" : 'Nom du joueur/joueuse';
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
  if (!state.dialogContext) return;
  if (state.dialogContext.type === 'team') {
    elements.teamNames[state.dialogContext.team].textContent = value;
  } else {
    players[state.dialogContext.team][state.dialogContext.playerIndex].textContent = value;
  }
  state.dialogContext = null;
  updateUi();
}

function handleActionClick(event) {
  const action = event.currentTarget.dataset.action;
  const team = event.currentTarget.dataset.team;
  switch (action) {
    case 'point':
      registerPoint(team);
      break;
    case 'fault':
      registerFault();
      break;
    case 'assign':
      assignServe(team);
      break;
    case 'undo':
      undoAction();
      break;
    default:
      break;
  }
}

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

players.a.concat(players.b).forEach((button) => {
  button.addEventListener('click', () => {
    const [team, index] = button.dataset.player.split('-');
    openNameDialog({ type: 'player', team, playerIndex: Number(index) });
  });
});

elements.nameButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const team = button.dataset.target === 'team-a' ? 'a' : 'b';
    openNameDialog({ type: 'team', team });
  });
});

elements.dialog.addEventListener('close', handleDialogClose);

elements.modeButtons.forEach((button) => {
  button.addEventListener('click', handleModeClick);
});

elements.actionButtons.forEach((button) => {
  button.addEventListener('click', handleActionClick);
});

elements.reset.addEventListener('click', resetGame);

resetGame();
