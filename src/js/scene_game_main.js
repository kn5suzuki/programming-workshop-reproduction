import * as Blockly from "blockly/core";
import Phaser from "phaser";

import player1 from "../img/game/player_l.png";
import player2 from "../img/game/player2_l.png";
import inventoryImage from "../img/game/inventory.png";
import tileImage from "../img/game/tileset.png";

const { SceneGame } = require("./scene_game");

class SceneGameMain extends Phaser.Scene {
  init(data) {
    this.sceneGame.init(data, this);
  }
  constructor() {
    super({ key: "game", active: false });
    this.sceneGame = new SceneGame();
  }
  preload() {
    this.sceneGame.preload(
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
export default SceneGameMain;
