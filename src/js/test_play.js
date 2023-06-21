import * as Blockly from "blockly/core";
import Phaser from "phaser";
require("./blocks.js");

import {
  stage_data,
  player,
  teleport_black,
  teleport_white,
} from "./build_map";
import { selectedBlocks } from "./select_blockly";

//console.log("testPlay");

//画像のインポート
//import stageclear from '../game-img/stageclear2.png';
//import nextstage from '../game-img/nextstage.png';
//import nextstage2 from '../game-img/nextstage2.png';
//import gototitle from '../game-img/title.png';
//import gototitle2 from '../game-img/title-next.png';
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
  parent: "phaserDiv",
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
  map: stage_data,
  playerx: player.x,
  playery: player.y,
  playerdirection: { d: 0, l: 1, r: 2, u: 3 }[player.dir],
  teleportx: [],
  teleporty: [],
  teleportid: [],
  blocks: selectedBlocks,
};
export function startTestPlay() {
  mapData = {
    width: 16,
    height: 20,
    map: stage_data,
    playerx: player.x,
    playery: player.y,
    playerdirection: { d: 0, l: 1, r: 2, u: 3 }[player.dir],
    teleportx: [],
    teleporty: [],
    teleportid: [],
    blocks: selectedBlocks,
  };

  teleport_black.forEach((t, i) => {
    mapData.teleportx.push(t.x);
    mapData.teleporty.push(t.y);
    mapData.teleportid.push((i + 1) % teleport_black.length);
  });
  teleport_white.forEach((t, i) => {
    mapData.teleportx.push(t.x);
    mapData.teleporty.push(t.y);
    mapData.teleportid.push(
      teleport_black.length + ((i + 1) % teleport_white.length)
    );
  });

  game = new Phaser.Game(config);
  game.scene.start("game", {
    mode: "testPlay",
    stage_num: -1,
    stageinfo: {},
    mapData: mapData,
    gameClearCallBack: gameClear,
  });
}

export let clearBlocks;
export let clearSteps;
function gameClear(blocks, steps) {
  document.getElementById("gameClear_next").style.display = "flex";
  clearBlocks = blocks;
  clearSteps = steps;
}
export function destroy() {
  game.destroy(true);
  workspace.dispose();
}
