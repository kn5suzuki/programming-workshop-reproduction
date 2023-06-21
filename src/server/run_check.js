const { SceneGame } = require("../js/scene_game");

// マップデータ、BlocklyのJSONデータ、残り体力をサーバー側で検証
class runCheck {
  constructor(mapData, blocklyJson) {
    this.blocks = blocklyJson;
    this.game = new SceneGame();
    this.game.init(
      {
        mode: "runCheck",
        stage_num: 0,
        stageInfo: { stages: [] },
        mapData: mapData,
      },
      {}
    );
  }
  check(leftEnergy) {
    return this.game.run_check(this.blocks, leftEnergy);
  }
  getBlockNum() {
    return this.game.countBlocks();
  }

  checkBlocks() {
    return this.game.checkBlocks();
  }
}

module.exports = {
  runCheck,
};
