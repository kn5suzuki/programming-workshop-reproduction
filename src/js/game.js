import "../scss/common.scss";
import "../scss/game.scss";
import Phaser from "phaser";
import SceneGameMain from "./sceneGameMain";
import { ClearPostedStage } from "./postClearData";

require("./blocks.js");

//urlからステージ名を取得
let url = new URL(window.location.href);
let params = url.searchParams;
let mode = params.get("mode");
let stage_num = params.get("stage");
if (!mode) {
  if (stage_num.length >= 3) mode = "posted";
  else mode = "default";
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

async function load() {
  if (mode == "default") {
    const res1 = await fetch("/defalt_stage_info");
    const stageinfo = await res1.json();

    const queryString = new URLSearchParams({
      filename: stageinfo.stages[stage_num].filename,
    }).toString();
    const res2 = await fetch("/default_stage?" + queryString);
    const mapData = await res2.json();
    console.log(mapData.map);

    //Phaserのゲームがスタートする
    var game = new Phaser.Game(config);
    game.scene.start("game", {
      mode: mode,
      stage_num: stage_num,
      stageinfo: stageinfo,
      mapData: mapData,
    });
  } else {
    const mapDataURL = `../posted_stage/${stage_num}.json`;
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
      stage_num: stage_num,
      stageinfo: {},
      mapData: mapData,
      gameClearCallBack: (blocks, steps, blockNum, stageName, submitter) => {
        //console.log(blocks,steps,blockNum, stageName, submitter);
        ClearPostedStage(
          stage_num,
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
