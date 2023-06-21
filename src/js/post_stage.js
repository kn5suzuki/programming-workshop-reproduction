import "../scss/common.scss";
import "../scss/post_stage.scss";
import "../scss/game.scss";

import { checkMap } from "./build_map";
import "./select_blockly";
import { startTestPlay, destroy } from "./test_play";
import "./server_connect";

const main = document.body;
let mode = 0;

const setClass = {
  0: () => {
    main.className = "buildMap";
    if (mode == 2) destroy();
    mode = 0;
  },
  1: () => {
    if (mode == 0 && !checkMap()) {
      return;
    }
    main.className = "selectBlockly";
    if (mode == 2) destroy();
    mode = 1;
  },
  2: () => {
    if (mode == 0 && !checkMap()) {
      return;
    }
    main.className = "testPlay";
    document.getElementById("gameClear_next").style.display = "none";
    startTestPlay();
    mode = 2;
  },
  3: () => {
    if (mode == 0 && !checkMap()) {
      return;
    }
    main.className = "postStage";
    document.getElementById("postStageConfirm").style.display = "none";
    if (mode == 2) destroy();
    mode = 3;
  },
};

function setNavi(n) {
  const navi = document.getElementById("navi");
  let count = 0;
  navi.childNodes.forEach((div, i) => {
    if (div.tagName != "DIV") return;
    if (count < n) {
      div.addEventListener("click", setClassAndNavi[count]);
      div.classList.add("active");
    } else {
      div.removeEventListener("click", setClassAndNavi[count]);
      div.classList.remove("active");
    }
    count += 1;
  });
}

const setClassAndNavi = [
  () => {
    setClass[0]();
    setNavi(0);
  },
  () => {
    setClass[1]();
    setNavi(1);
  },
  () => {
    setClass[2]();
    setNavi(2);
  },
  () => {
    setClass[3]();
    setNavi(3);
  },
];

document
  .getElementById("buildMap_next")
  .addEventListener("click", setClassAndNavi[1]);
document
  .getElementById("selectBlockly_prev")
  .addEventListener("click", setClassAndNavi[0]);
document
  .getElementById("selectBlockly_next")
  .addEventListener("click", setClassAndNavi[2]);
document
  .getElementById("testPlay_prev")
  .addEventListener("click", setClassAndNavi[1]);
document
  .getElementById("testPlay_prev2")
  .addEventListener("click", setClassAndNavi[1]);
document
  .getElementById("testPlay_prev3")
  .addEventListener("click", setClassAndNavi[1]);
document
  .getElementById("testPlay_next")
  .addEventListener("click", setClassAndNavi[3]);
document
  .getElementById("postStage_prev")
  .addEventListener("click", setClassAndNavi[2]);
