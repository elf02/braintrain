import './style.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine;

Alpine.data('braintrain', () => ({
  cols: 0,
  rows: 0,
  tiles: [],
  targetTilesCount: 0,
  hint: false,
  unsolvedHint: false,
  selectionLocked: true,
  solved: 0,
  brainChecks: 0,
  showMenu: true,
  lastVisibilityHidden: false,

  visibilityEvent() {
    if (this.lastVisibilityHidden && !document.hidden) {
      this.showMenu = true;
    }

    this.lastVisibilityHidden = document.hidden;
  },

  playAudio(audio, volume = 1) {
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play();
  },

  startBrainChecks() {
    this.playAudio(this.$refs.audioSolved, 0); // iOS Safari Hack
    this.playAudio(this.$refs.audioClick);

    const tileWidth =  Math.floor(this.$refs.gridWrap.clientWidth / 4);
    this.cols = Math.floor(this.$refs.gridWrap.clientWidth / tileWidth);
    this.rows = Math.floor(this.$refs.gridWrap.clientHeight / tileWidth);

    this.showMenu = false;
    this.solved = 0;
    this.brainChecks = 0;
    this.selectionLocked = true;
    setTimeout(() => this.initTiles(), 500);
  },

  initTiles() {
    const tilesCount = this.cols * this.rows;
    this.targetTilesCount = this.rndMinMax(2, 8);
    this.tiles = [
      ...Array.from({ length: this.targetTilesCount }, () => ({
        isTarget: true,
        isSelected: false,
      })),
      ...Array.from({ length: tilesCount - this.targetTilesCount }, () => ({
        isTarget: false,
        isSelected: false,
      })),
    ].sort((a, b) => 0.5 - Math.random());

    this.unsolvedHint = false;
    this.hint = true;
    setTimeout(() => {
      this.hint = false
      this.selectionLocked = false;
    }, 2000);
  },

  checkTiles() {
    if (this.selectedTiles.length === this.targetTilesCount) {
      this.brainChecks++;

      if (this.targetTiles.length === this.targetTilesCount) {
        this.playAudio(this.$refs.audioSolved);
        this.solved++;
        this.selectionLocked = true;
        setTimeout(() => this.initTiles(), 1000);
      }
      else {
        this.selectionLocked = true;
        this.unsolvedHint = true;
        setTimeout(() => this.initTiles(), 1000);
      }
    }
  },

  selectTile(tile) {
    if (this.selectionLocked) return;

    this.playAudio(this.$refs.audioClick);
    tile.isSelected = true;
    this.checkTiles();
  },

  rndMinMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  get selectedTiles() {
    return this.tiles.filter(tile => tile.isSelected);
  },

  get targetTiles() {
    return this.selectedTiles.filter(tile => tile.isTarget);
  },

  get tilesToSelect() {
    return this.targetTilesCount - this.selectedTiles.length;
  },
}));

Alpine.start();
