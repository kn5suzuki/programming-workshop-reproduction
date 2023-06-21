import * as Blockly from "blockly/core";
import Phaser from "phaser";
require("./blocks.js");

import { stageData, player, teleportBlack, teleportWhite } from "./build_map";
import { selectedBlocks } from "./select_blockly";

//画像のインポート
import player1 from "../img/game/player_l.png";
import player2 from "../img/game/player2_l.png";
//import star from '../img/game/star2.png';
import inventoryImage from "../img/game/inventory.png";
import tileImage from "../img/game/tileset.png";

const { SceneGame } = require("./scene_game");

let workspace;

class SceneGameMain extends Phaser.Scene {
  init(data) {
    this.sceneGame.init(data, this);
  }
  constructor() {
    super({ key: "game", active: false });
    this.sceneGame = new SceneGame();
  }
  preload() {
    workspace = this.sceneGame.preload(
      Blockly,
      player1,
      player2,
      inventoryImage,
      tileImage
    );
  }
  create() {
    this.sceneGame.create();
  }
  update() {
    this.sceneGame.update();
  }
}
//Phaserの設定
var config = {
  type: Phaser.AUTO,
  width: 30 * 16,
  height: 30 * 20,
  parent: "phaser-div",
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },
      debug: false,
    },
  },
  scene: [SceneGameMain],
  render: {
    transparent: true,
  },
};

var game;

export let mapData = {
  width: 16,
  height: 20,
  map: stageData,
  playerX: player.x,
  playerY: player.y,
  playerDirection: { d: 0, l: 1, r: 2, u: 3 }[player.dir],
  teleportX: [],
  teleportY: [],
  teleportId: [],
  blocks: selectedBlocks,
};
export function startTestPlay() {
  mapData = {
    width: 16,
    height: 20,
    map: stageData,
    playerX: player.x,
    playerY: player.y,
    playerDirection: { d: 0, l: 1, r: 2, u: 3 }[player.dir],
    teleportX: [],
    teleportY: [],
    teleportId: [],
    blocks: selectedBlocks,
  };

  teleportBlack.forEach((t, i) => {
    mapData.teleportX.push(t.x);
    mapData.teleportY.push(t.y);
    mapData.teleportId.push((i + 1) % teleportBlack.length);
  });
  teleportWhite.forEach((t, i) => {
    mapData.teleportX.push(t.x);
    mapData.teleportY.push(t.y);
    mapData.teleportId.push(
      teleportBlack.length + ((i + 1) % teleportWhite.length)
    );
  });

  game = new Phaser.Game(config);
  game.scene.start("game", {
    mode: "testPlay",
    stageNum: -1,
    stageInfo: {},
    mapData: mapData,
    gameClearCallBack: gameClear,
  });
}

export let clearBlocks;
export let clearSteps;
function gameClear(blocks, steps) {
  document.getElementById("game-clear-next").style.display = "flex";
  clearBlocks = blocks;
  clearSteps = steps;
}
export function destroy() {
  game.destroy(true);
  workspace.dispose();
}
