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

function setNav(n) {
  const nav = document.getElementById("nav");
  let count = 0;
  nav.childNodes.forEach((div, i) => {
    if (div.tagName != "DIV") return;
    if (count < n) {
      div.addEventListener("click", setClassAndNav[count]);
      div.classList.add("active");
    } else {
      div.removeEventListener("click", setClassAndNav[count]);
      div.classList.remove("active");
    }
    count += 1;
  });
}

const setClassAndNav = [
  () => {
    setClass[0]();
    setNav(0);
  },
  () => {
    setClass[1]();
    setNav(1);
  },
  () => {
    setClass[2]();
    setNav(2);
  },
  () => {
    setClass[3]();
    setNav(3);
  },
];

document
  .getElementById("buildMap_next")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("selectBlockly_prev")
  .addEventListener("click", setClassAndNav[0]);
document
  .getElementById("selectBlockly_next")
  .addEventListener("click", setClassAndNav[2]);
document
  .getElementById("testPlay_prev")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("testPlay_prev2")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("testPlay_prev3")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("testPlay_next")
  .addEventListener("click", setClassAndNav[3]);
document
  .getElementById("postStage_prev")
  .addEventListener("click", setClassAndNav[2]);
