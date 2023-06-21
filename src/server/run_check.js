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
        stageinfo: { stages: [] },
        mapData: mapData,
      },
      {}
    );
  }
  check(leftenergy) {
    return this.game.run_check(this.blocks, leftenergy);
  }
  getBlockNum() {
    return this.game.countBlocks();
  }

  checkblocks() {
    return this.game.checkblocks();
  }
}

module.exports = {
  runCheck,
};
