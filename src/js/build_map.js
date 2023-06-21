const buildMapCanvas = document.getElementById("buildMapCanvas");
const selectTileDiv = document.getElementById("selectTile");
const gridsize = 30;
const WIDTH = 16;
const HEIGHT = 20;
const context = buildMapCanvas.getContext("2d");

export let stage_data = new Array(HEIGHT);
for (let y = 0; y < HEIGHT; ++y) stage_data[y] = new Array(WIDTH).fill("grass");

export let player = { x: -1, y: -1, dir: "r" };
export let teleport_black = new Array();
export let teleport_white = new Array();

let selectedTileElem = document.getElementById("player");
let selectedTile = "player";

const tilesetImage = require("../img/web/post_stage/tileset.png");
const playerImageL = require("../img/web/post_stage/playerTile_l.png");
const playerImageR = require("../img/web/post_stage/playerTile_r.png");
const playerImageU = require("../img/web/post_stage/playerTile_u.png");
const playerImageD = require("../img/web/post_stage/playerTile_d.png");

const tileImage = new Image();

const playerImages = {
  l: new Image(),
  r: new Image(),
  u: new Image(),
  d: new Image(),
};

const loadImage = (img, src) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

Promise.all([
  loadImage(tileImage, tilesetImage),
  loadImage(playerImages.l, playerImageL),
  loadImage(playerImages.r, playerImageR),
  loadImage(playerImages.u, playerImageU),
  loadImage(playerImages.d, playerImageD),
])

  .then(() => {
    // 初期化
    for (let y = 0; y < HEIGHT; ++y) {
      for (let x = 0; x < WIDTH; ++x) {
        updateStage(x, y);
      }
    }
    selectTile(selectedTileElem);

    const elems = document.querySelectorAll(".selectTile>div");
    elems.forEach((elem) => {
      elem.onclick = () => selectTile(elem);
    });
    document.getElementById("player_rotate").onclick = () => rotetePlayer();

    let mouseDrag = false;

    function set(ev) {
      if (!mouseDrag && ev.type == "mousemove") return;
      mouseDrag = true;
      ev.preventDefault();
      let touch =
        (ev.touches && ev.touches[0]) ||
        (ev.changedTouches && ev.changedTouches[0]);

      let clientX = ev.clientX || (touch && touch.pageX);
      let clientY = ev.clientY || (touch && touch.pageY);

      if (!clientX || !clientY) return;

      const rect = this.getBoundingClientRect();
      const x = Math.floor(((clientX - rect.left) / rect.width) * WIDTH);
      const y = Math.floor(((clientY - rect.top) / rect.height) * HEIGHT);
      if (x < 0 || WIDTH <= x || y < 0 || HEIGHT <= y) return;
      const tile = stage_data[y][x];
      if (selectedTile.startsWith("ans")) {
        updateStage(x, y, tile.split(":")[0] + ":" + selectedTile);
      } else if (selectedTile == "player") {
        const prevX = player.x,
          prevY = player.y;
        player.x = x;
        player.y = y;
        updateStage(prevX, prevY, "path");
        updateStage(x, y, "path");
      } else if (selectedTile == "teleport1") {
        if (teleport_black.find((e) => e.x == x && e.y == y)) return;
        while (teleport_black.length >= 2) {
          const p = teleport_black.pop();
          updateStage(p.x, p.y, "path");
        }
        teleport_black.push({ x: x, y: y });
        updateStage(x, y, "teleport1");
      } else if (selectedTile == "teleport2") {
        if (teleport_white.find((e) => e.x == x && e.y == y)) return;
        while (teleport_white.length >= 2) {
          const p = teleport_white.pop();
          updateStage(p.x, p.y, "path");
        }
        teleport_white.push({ x: x, y: y });
        updateStage(x, y, "teleport2");
      } else {
        updateStage(x, y, selectedTile);
      }
    }
    buildMapCanvas.addEventListener("touchstart", set);
    buildMapCanvas.addEventListener("mousedown", set);
    buildMapCanvas.addEventListener("touchmove", set);
    buildMapCanvas.addEventListener("mousemove", set);
    buildMapCanvas.addEventListener("touchend", () => {
      mouseDrag = false;
    });
    buildMapCanvas.addEventListener("mouseup", () => {
      mouseDrag = false;
    });
    buildMapCanvas.addEventListener("mouseleave", () => {
      mouseDrag = false;
    });
    buildMapCanvas.addEventListener("mouseout", () => {
      mouseDrag = false;
    });

    // リセットボタン
    document.getElementById("resetMap").onclick = () => {
      player = { x: -1, y: -1, dir: "r" };
      for (let y = 0; y < HEIGHT; ++y) {
        for (let x = 0; x < WIDTH; ++x) {
          updateStage(x, y, "grass");
        }
      }
      teleport_black.length = 0;
      teleport_white.length = 0;
    };
  })
  .catch((e) => {
    console.log(e);
  });

function updateStage(x, y, stageData) {
  if (x < 0 || WIDTH <= x || y < 0 || HEIGHT <= y) return;
  if (stageData) {
    const prevStage = stage_data[y][x];
    stage_data[y][x] = stageData;
    if (prevStage == "teleport1") {
      teleport_black = teleport_black.filter((e) => e.x != x || e.y != y);
    }
    if (prevStage == "teleport2") {
      teleport_white = teleport_white.filter((e) => e.x != x || e.y != y);
    }
  }
  if (x == player.x && y == player.y) {
    context.drawImage(
      playerImages[player.dir],
      x * gridsize,
      y * gridsize,
      gridsize,
      gridsize
    );
    stage_data[y][x] = "path";
    return;
  }
  const d = stage_data[y][x];
  const tileName = {
    grass: 0,
    path: 1,
    key: 2,
    teleport1: 3,
    teleport2: 4,
    goalN: 5,
    goal: 6,
    rock: 7,
    stone: 8,
    wood: 9,
    num0: 10,
    num1: 11,
    num2: 12,
    num3: 13,
    num4: 14,
    num5: 15,
    num6: 16,
    num7: 17,
    num8: 18,
    num9: 19,
    ans0: 20,
    ans1: 21,
    ans2: 22,
    ans3: 23,
    ans4: 24,
    ans5: 25,
    ans6: 26,
    ans7: 27,
    ans8: 28,
    ans9: 29,
  };
  const tiles = d.split(":");
  for (const t of tiles) {
    const i = tileName[t];
    context.drawImage(
      tileImage,
      (i % 10) * 30,
      Math.floor(i / 10) * 30,
      30,
      30,
      x * gridsize,
      y * gridsize,
      gridsize,
      gridsize
    );
  }
}

function selectTile(tileElem) {
  selectedTileElem.classList.remove("selected");
  tileElem.classList.add("selected");
  selectedTileElem = tileElem;
  selectedTile = tileElem.id;
}

function rotetePlayer() {
  const next_dir = {
    r: "u",
    u: "l",
    l: "d",
    d: "r",
  };
  const n = next_dir[player.dir];
  const playerTileElem = document.getElementById("player");
  playerTileElem.classList.remove(`player_${player.dir}`);
  playerTileElem.classList.add(`player_${n}`);
  player.dir = n;
  updateStage(player.x, player.y, "path");
}

export function checkMap() {
  const buildMapError = document.getElementById("buildMapError");

  teleport_black = teleport_black.filter(
    (e) => stage_data[e.y][e.x] == "teleport1"
  );
  teleport_white = teleport_white.filter(
    (e) => stage_data[e.y][e.x] == "teleport2"
  );

  let checkGoal = false;
  for (let y = 0; y < HEIGHT; ++y) {
    for (let x = 0; x < WIDTH; ++x) {
      if (stage_data[y][x] == "goal") checkGoal = true;
    }
  }
  if (player.x < 0 || WIDTH <= player.x || player.y < 0 || HEIGHT <= player.y) {
    buildMapError.innerText = "キャラクターを配置してください。";
  } else if (!checkGoal) {
    buildMapError.innerText = "ゴールを配置してください。";
  } else if (teleport_black.length == 1 || teleport_white.length == 1) {
    buildMapError.innerText = "ワープのマークは２つ配置してください。";
  } else {
    buildMapError.style.display = "none";
    return true;
  }
  buildMapError.style.display = "block";
  return false;
}
