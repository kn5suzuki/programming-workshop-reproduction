import "../scss/common.scss";
import "../scss/game.scss";
import Phaser from "phaser";
import SceneGameMain from "./scene_game_main";
import { ClearPostedStage } from "./post_clear_data";

require("./blocks.js");

//urlからステージ名を取得
let url = new URL(window.location.href);
let params = url.searchParams;
let mode = params.get("mode");
let stageNum = params.get("stage");
if (!mode) {
  if (stageNum.length >= 3) mode = "posted";
  else mode = "default";
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

async function load() {
  if (mode == "default") {
    const res1 = await fetch("/default_stage_info");
    const stageInfo = await res1.json();

    const queryString = new URLSearchParams({
      filename: stageInfo.stages[stageNum].filename,
    }).toString();
    const res2 = await fetch("/default_stage?" + queryString);
    const mapData = await res2.json();
    console.log(mapData.map);

    //Phaserのゲームがスタートする
    var game = new Phaser.Game(config);
    game.scene.start("game", {
      mode: mode,
      stageNum: stageNum,
      stageInfo: stageInfo,
      mapData: mapData,
    });
  } else {
    const mapDataURL = `/posted_stage?filename=${stageNum}.json`;
    const res2 = await fetch(mapDataURL);
    const mapData = await res2.json();

    if (!mapData || mapData.deleted) {
      document.getElementById("deleted").style.display = "block";
      return;
    }

    //Phaserのゲームがスタートする
    var game = new Phaser.Game(config);
    game.scene.start("game", {
      mode: mode,
      stageNum: stageNum,
      stageInfo: {},
      mapData: mapData,
      gameClearCallBack: (blocks, steps, blockNum, stageName, submitter) => {
        //console.log(blocks,steps,blockNum, stageName, submitter);
        ClearPostedStage(
          stageNum,
          blocks,
          steps,
          blockNum,
          stageName,
          submitter
        );
      },
    });
  }
}

load().catch(() => {
  document.getElementById("deleted").style.display = "block";
});
