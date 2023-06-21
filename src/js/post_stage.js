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
    main.className = "build-map";
    if (mode == 2) destroy();
    mode = 0;
  },
  1: () => {
    if (mode == 0 && !checkMap()) {
      return;
    }
    main.className = "select-blockly";
    if (mode == 2) destroy();
    mode = 1;
  },
  2: () => {
    if (mode == 0 && !checkMap()) {
      return;
    }
    main.className = "test-play";
    document.getElementById("game-clear-next").style.display = "none";
    startTestPlay();
    mode = 2;
  },
  3: () => {
    if (mode == 0 && !checkMap()) {
      return;
    }
    main.className = "post-stage";
    document.getElementById("post-stage-confirm").style.display = "none";
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
  .getElementById("build-map-next")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("select-blockly-prev")
  .addEventListener("click", setClassAndNav[0]);
document
  .getElementById("select-blockly-next")
  .addEventListener("click", setClassAndNav[2]);
document
  .getElementById("test-play-prev")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("test-play-prev2")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("test-play-prev3")
  .addEventListener("click", setClassAndNav[1]);
document
  .getElementById("test-play-next")
  .addEventListener("click", setClassAndNav[3]);
document
  .getElementById("post-stage-prev")
  .addEventListener("click", setClassAndNav[2]);
