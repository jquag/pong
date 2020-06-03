export interface Puck {
  x: number;
  y: number;
  slopePercent: number;
  xDir: (1|-1);
}

export interface Player {
  name: string;
  position: number;
}

export interface GameType {
  player1: Player;
  player2: Player;
  status: string;
  puck?: Puck;
  score: [number, number];
  defendingPlayerNumber: number;
}

type GameEngineEvent = {
  player: Player;
  puckPosition?: {
    x: number;
    y: number;
  };
  status: string;
  playerPosessionChange: boolean;
  score: [number, number];
  defendingPlayerNumber: number;
};

type GameCanvasEventHandler = (evt: GameEngineEvent) => void;

const POINTS_TO_WIN = 5;

export default class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  paddleHeight = 65;
  paddleWidth = 10;
  goalWidth = 20;
  puckWidth = 10;
  puckHeight = 10;
  playerStep = 10;
  playerIntensityStep = 10;
  maxPlayerIntensity = 40;
  playerNumber: number;
  opponentNumber: number;
  eventHandler: GameCanvasEventHandler;
  lastKey = '';
  lastKeyTimeoutHandler: any = null;
  game: GameType;
  moving = 'none';
  movingIntensity = 0;
  puckInterval: any = null;
  puckNotifyInterval: any = null;
  localPuck?: Puck = null;

  constructor(el: HTMLCanvasElement, game: GameType, playerNumber: number, onChange: GameCanvasEventHandler) {
    this.canvas = el;
    this.playerNumber = playerNumber;
    this.opponentNumber = playerNumber === 1 ? 2 : 1;
    this.game = game;
    this.eventHandler = onChange;

    this.handleWheel = this.handleWheel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.handleStartPointClick = this.handleStartPointClick.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.updatePuckPosition = this.updatePuckPosition.bind(this);
    this.fireChangeEvent = this.fireChangeEvent.bind(this);

    if (this.game.player1 && !this.game.player1.position) {
      this.game.player1.position = this.canvas.height/2;
    }
    if (this.game.player2 && !this.game.player2.position) {
      this.game.player2.position = this.canvas.height/2;
    }

    this.ctx = this.canvas.getContext('2d')!;

    this.fireChangeEvent();

    this.setup();
  }

  stop() {
    window.removeEventListener("keydown", this.handleKeydown, false);
    window.removeEventListener("keyup", this.handleKeyup, false);
    window.removeEventListener("keypress", this.handleKeypress, false);
    window.removeEventListener("wheel", this.handleWheel, false)
  }

  updateGame(game: GameType) {
    const isPossessionChange = this.game.defendingPlayerNumber !== game.defendingPlayerNumber;
    this.game = {
      ...this.game,
      score: game.score,
      status: game.status,
      defendingPlayerNumber: game.defendingPlayerNumber,
      [`player${this.opponentNumber}`]: game[`player${this.opponentNumber}`],
      [`player${this.playerNumber}`]: {...game[`player${this.playerNumber}`], position: this.player().position}
    };

    this.game.puck = this.game.puck || game.puck;

    if (this.game.puck && game.puck) {
      if (this.game.status !== 'point-in-progress' || !this.localPuck || isPossessionChange || (!this.isDefending() && !GameEngine.pucksEqual(game.puck, this.game.puck))) {
        this.localPuck = {...game.puck};
      }
      this.game.puck = {...game.puck};
    }

    if (game.status === 'ready-to-start-point' && this.isDefending()) {
      this.canvas.addEventListener("click", this.handleStartPointClick);
    } else {
      this.canvas.removeEventListener('click', this.handleStartPointClick);
    }

    if (game.status === 'point-in-progress' && !this.puckInterval) {
      this.startPuck();
    }
    if (this.puckInterval && game.status !== 'point-in-progress') {
      this.stopPuck();
    }

    this.render();
  }

  private isDefending(): boolean {
    return this.playerNumber === this.game.defendingPlayerNumber;
  }

  private static pucksEqual(p1: Puck, p2: Puck): boolean {
    if (p1.x != p2.x) return false;
    if (p1.y != p2.y) return false;
    if (p1.slopePercent != p2.slopePercent) return false;
    return p1.xDir == p2.xDir;

  }

  private fireChangeEvent(playerPossessionChange = false) {
    const update: GameEngineEvent = {player: this.player(), status: this.game.status, playerPosessionChange: playerPossessionChange, score: this.game.score, defendingPlayerNumber: this.game.defendingPlayerNumber};
    if (this.localPuck && (this.isDefending() || (!this.isDefending() && playerPossessionChange))) {
      update.puckPosition = {...this.localPuck};
    }
    this.eventHandler(update);
  }

  private setup() {
    this.render();

    window.addEventListener("keydown", this.handleKeydown, false);
    window.addEventListener("keyup", this.handleKeyup, false);
    window.addEventListener("keypress", this.handleKeypress, false);
    window.addEventListener("wheel", this.handleWheel, false)
  }

  private updatePuckPosition() {
    const factor = 15;
    const puck = this.localPuck;
    if (puck) {
      let dx = 1 * puck.xDir;
      let dy = puck.slopePercent;
      if (Math.abs(dy) > 1) {
        dx = dx / Math.abs(dy);
        dy = puck.slopePercent > 0 ? 1 : -1;
      }

      dx = dx * factor;
      dy = dy * factor;
      const x = puck.x + dx;
      const y = puck.y + dy;

      if (this.positionHitsPaddle(puck.xDir, puck.x, x, y)) {
        console.log('hit paddle');
        puck.x = puck.xDir > 0 ? (this.canvas.width - this.goalWidth - this.paddleWidth) : (this.goalWidth + this.paddleWidth);
        puck.y = y;
        puck.xDir = puck.xDir > 0 ? -1 : 1;
        this.changePlayerPossession();
        this.fireChangeEvent(true);
        this.render();
      } else if (y < 0 || y > this.canvas.height) {
        puck.y = y < 0 ? 0 : this.canvas.height;
        puck.x = x;
        puck.slopePercent = puck.slopePercent * -1;
        this.fireChangeEvent();
        this.render();
      } else if (x > this.canvas.width || x < 0) {
        console.log('stopping', puck.x, x);
        this.stopPuck();

        if (this.isDefending()) {
          this.game.status = 'ready-to-start-point';
          console.log('SCORE!');
          this.incrementOpponentScore()
          this.fireChangeEvent();
        }
      } else {
        puck.x = x;
        puck.y = y;
        this.render();
      }
    }
  }

  private changePlayerPossession() {
    this.game.defendingPlayerNumber = this.game.defendingPlayerNumber === 1 ? 2 : 1;
  }

  private incrementOpponentScore() {
    const scoreIndex = this.opponentNumber === 1 ? 0 : 1;
    this.game.score[scoreIndex]++;
    this.checkForGameOver();
  }

  private checkForGameOver() {
    if (this.game.score[0] >= POINTS_TO_WIN || this.game.score[1] >= POINTS_TO_WIN) {
      this.game.status = 'game-over';
    }
  }

  private positionHitsPaddle(direction: (1 | -1), prevX: number, x: number, y: number): boolean {
    if (direction > 0) {
      return prevX < (this.canvas.width - this.goalWidth - this.paddleWidth)
        && x >= this.canvas.width - this.goalWidth - this.paddleWidth
        && y <= (this.game.player2.position + (this.paddleHeight / 2))
        && y >= (this.game.player2.position - (this.paddleHeight / 2));
    } else {
      return prevX > (this.goalWidth + this.paddleWidth)
        && x <= (this.goalWidth + this.paddleWidth)
        && y <= (this.game.player1.position + (this.paddleHeight / 2))
        && y >= (this.game.player1.position - (this.paddleHeight / 2));
    }
  }

  private startPuck() {
      console.log('starting the puck interval');
      this.puckInterval = setInterval(this.updatePuckPosition, 50);
      this.puckNotifyInterval = setInterval(this.fireChangeEvent, 500);
  }

  private stopPuck() {
    console.log('stopping the puck interval');
    clearTimeout(this.puckInterval);
    clearTimeout(this.puckNotifyInterval);
    this.puckInterval = null;
    this.puckNotifyInterval = null;
  }

  private player(): Player {
    return this.playerForGame(this.game);
  }

  private playerForGame(game: GameType): Player {
    return this.playerNumber === 1 ? game.player1 : game.player2;
  }

  private opponent(): Player {
    return this.opponentForGame(this.game);
  }

  private opponentForGame(game: GameType): Player {
    return this.playerNumber === 1 ? game.player2 : game.player1;
  }

  private setLastKey(key: string) {
    this.lastKey = key;
    if (this.lastKeyTimeoutHandler) {
      clearTimeout(this.lastKeyTimeoutHandler);
    }
    this.lastKeyTimeoutHandler = setTimeout(() => {
      this.lastKey = '';
    }, 500);
  }

  private clearLastKey() {
    if (this.lastKeyTimeoutHandler) {
      clearTimeout(this.lastKeyTimeoutHandler);
    }
    this.lastKey = '';
  }

  private setPlayerPosition(position: number) {
    const player = this.player();
    if (player.position === position) return;

    const max = this.canvas.height - (this.paddleHeight/2);
    const min = this.paddleHeight/2;
    if (position > max) {
      player.position = max;
    } else if (position < min) {
      player.position = min;
    } else {
      player.position = position;
    }
    this.fireChangeEvent();
  }

  private handleKeypress(evt) {
    if (evt.key === 'g') {
      if (this.lastKey === 'g') {
        this.handleMoveToTop();
        this.clearLastKey();
      } else {
        this.setLastKey('g')
      }
      return;
    }

    this.clearLastKey();

    if (evt.key === 'G') {
      this.handleMoveToBottom();
    }
  }

  private handleWheel(evt: WheelEvent) {
    const p = this.player();
    const percent = evt.deltaMode === 0 ? .20 : 5;
    this.setPlayerPosition(p.position + (evt.deltaY * percent));
    this.render();
  }

  private handleKeyup(evt) {
    if (evt.key === 'j' || evt.key === 'k') {
      this.movingIntensity = 0;
      this.moving = 'none';
    }
  }

  private handleKeydown(evt) {
    //TODO: get rid of the initial pause
    if (evt.key === 'j') {
      this.handleMoveDown();
    } else if (evt.key === 'k') {
      this.handleMoveUp();
    }
  }

  private handleStartPointClick(evt: MouseEvent) {
    const minOffset = this.playerNumber === 1 ? this.canvas.width/2 : 0;
    const maxOffset = this.playerNumber === 1 ? this.canvas.width : this.canvas.width/2;
    if (this.localPuck && evt.offsetX >= minOffset && evt.offsetX <= maxOffset) {
      const rise = evt.offsetY - this.localPuck.y;
      const run = evt.offsetX - this.localPuck.x;

      this.localPuck.slopePercent = rise / Math.abs(run);
      this.localPuck.xDir = run < 0 ? -1 : 1;

      this.game.status = 'point-in-progress';
      this.changePlayerPossession();
      this.fireChangeEvent(true);
      this.render();
    }
  }

  private handleMoveToTop() {
    this.movingIntensity = 0;
    this.moving = 'none';
    this.setPlayerPosition(this.paddleHeight/2);
    this.render();
  }

  private handleMoveToBottom() {
    this.movingIntensity = 0;
    this.moving = 'none';
    this.setPlayerPosition(this.canvas.height - (this.paddleHeight/2));
    this.render();
  }

  private handleMoveUp() {
    const p = this.player();
    const step = this.playerStep + this.movingIntensity;

    if (this.moving === 'up') {
      this.movingIntensity = Math.min(this.movingIntensity+this.playerIntensityStep, this.maxPlayerIntensity);
    }
    this.moving = 'up';
    this.setPlayerPosition(p.position - step);
    this.render();
  }

  private handleMoveDown() {
    const p = this.player();
    const step = this.playerStep + this.movingIntensity;
    if (this.moving === 'down') {
      this.movingIntensity = Math.min(this.movingIntensity+this.playerIntensityStep, this.maxPlayerIntensity);
    }
    this.moving = 'down';
    this.setPlayerPosition(p.position + step);
    this.render();
  }

  private render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.game.status === 'ready-to-start-point') {
        if (this.isDefending()) {
          this.renderStartPointOverlay();
        }
      }

      if (this.game.status === 'game-over') {
        this.renderWinner();
      }
      this.renderPlayer1();
      this.renderPlayer2();
      this.renderPuck();
  }

  private renderWinner() {
    const x = (this.game.score[0] >= POINTS_TO_WIN ? 0 : this.canvas.width/2) + 200;
    const y = this.canvas.height/2;

    this.ctx.font = '32px helvetica';
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillText('WINNER', x, y);
  }

  private renderPlayer1() {
    if (this.game.player1) {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(this.goalWidth,
        (this.game.player1.position || this.canvas.height/2) - (this.paddleHeight / 2),
        this.paddleWidth, this.paddleHeight);
    }
  }

  private renderPlayer2() {
    if (this.game.player2) {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect((this.canvas.width - this.goalWidth - this.paddleWidth),
        (this.game.player2.position || this.canvas.height / 2) - (this.paddleHeight / 2),
        this.paddleWidth,
        this.paddleHeight);
    }
  }

  private renderPuck() {
    if (this.game.status === 'ready-to-start-point') {
      //adjust puck to center on server's paddle to avoid jumping effect
      const possessingPlayerNumber = this.isDefending() ? this.playerNumber : this.opponentNumber;
      const possessingPlayer = this.isDefending() ? this.player() : this.opponent();
      const x = possessingPlayerNumber === 1 ? this.goalWidth + this.paddleWidth + (this.puckWidth / 2) : this.canvas.width - this.goalWidth - this.paddleWidth - (this.puckWidth / 2);
      this.localPuck = {...this.localPuck, x, y: possessingPlayer.position + (this.puckWidth / 2)};
    }

    if (this.localPuck) {
      this.ctx.fillStyle = 'yellow';
      this.ctx.fillRect((this.localPuck.x - this.puckWidth/2), (this.localPuck.y - this.puckHeight), this.puckWidth, this.puckHeight);
    }
  }

  private renderStartPointOverlay() {
    let x: number;
    if (this.playerNumber === 1) {
      x = this.canvas.width/2;
    } else {
      x = 0;
    }
    this.ctx.fillStyle = '#98fa80';
    this.ctx.globalAlpha = .3;
    this.ctx.fillRect(x, 0, this.canvas.width/2, this.canvas.height);
    this.ctx.font = '32px helvetica';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('Click to start', x + 150, this.canvas.height/2);
    this.ctx.globalAlpha = 1;
  }

}
