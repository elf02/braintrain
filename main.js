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
  audioContext: null,
  audioUnmuted: false,
  audioClick: null,
  audioSolved: null,

  init() {
    const context = new AudioContext();
    const gainNode = context.createGain();
    gainNode.gain.value = 1;
    this.audioContext = context;

    window.fetch(import.meta.env.BASE_URL + 'assets/audio/click.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
        this.audioClick = audioBuffer;
      }));

    window.fetch(import.meta.env.BASE_URL + 'assets/audio/solved.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
        this.audioSolved = audioBuffer;
      }));

    this.unmuteAudio();
  },

  unmuteAudio() {
    if (!this.audioUnmuted) {
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);

      setTimeout(() => this.audioUnmuted = (
        source.playbackState === source.PLAYING_STATE ||
        source.playbackState === source.FINISHED_STATE
      ), 100);
    }
  },

  playAudio(audioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  },

  startBrainChecks() {
    this.unmuteAudio();
    this.playAudio(this.audioClick);

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
        this.playAudio(this.audioSolved);
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

    this.playAudio(this.audioClick);
    tile.isSelected = true;
    this.checkTiles();
  },

  rndMinMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  visibilityEvent() {
    if (this.lastVisibilityHidden && !document.hidden) {
      this.showMenu = true;
    }

    this.lastVisibilityHidden = document.hidden;
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
