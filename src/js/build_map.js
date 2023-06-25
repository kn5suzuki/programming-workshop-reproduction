const buildMapCanvas = document.getElementById("build-map-canvas");
const selectTileDiv = document.getElementById("select-tile");
const gridSize = 30;
const WIDTH = 16;
const HEIGHT = 20;
const context = buildMapCanvas.getContext("2d");

export let stageData = new Array(HEIGHT);
for (let y = 0; y < HEIGHT; ++y) stageData[y] = new Array(WIDTH).fill("grass");

export let player = { x: -1, y: -1, dir: "r" };
export let teleportBlack = new Array();
export let teleportWhite = new Array();

let selectedTileElem = document.getElementById("player");
let selectedTile = "player";

const tileSetImage = require("../img/web/post_stage/tileset.png");
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
  loadImage(tileImage, tileSetImage),
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

    const elements = document.querySelectorAll(".select-tile>div");
    elements.forEach((elem) => {
      elem.onclick = () => selectTile(elem);
    });
    document.getElementById("player-rotate").onclick = () => rotatePlayer();

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
      const tile = stageData[y][x];
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
        if (teleportBlack.find((e) => e.x == x && e.y == y)) return;
        while (teleportBlack.length >= 2) {
          const p = teleportBlack.pop();
          updateStage(p.x, p.y, "path");
        }
        teleportBlack.push({ x: x, y: y });
        updateStage(x, y, "teleport1");
      } else if (selectedTile == "teleport2") {
        if (teleportWhite.find((e) => e.x == x && e.y == y)) return;
        while (teleportWhite.length >= 2) {
          const p = teleportWhite.pop();
          updateStage(p.x, p.y, "path");
        }
        teleportWhite.push({ x: x, y: y });
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
    document.getElementById("reset-map").onclick = () => {
      player = { x: -1, y: -1, dir: "r" };
      for (let y = 0; y < HEIGHT; ++y) {
        for (let x = 0; x < WIDTH; ++x) {
          updateStage(x, y, "grass");
        }
      }
      teleportBlack.length = 0;
      teleportWhite.length = 0;
    };
  })
  .catch((e) => {
    console.log(e);
  });

function updateStage(x, y, data) {
  if (x < 0 || WIDTH <= x || y < 0 || HEIGHT <= y) return;
  if (data) {
    const prevStage = stageData[y][x];
    stageData[y][x] = data;
    if (prevStage == "teleport1") {
      teleportBlack = teleportBlack.filter((e) => e.x != x || e.y != y);
    }
    if (prevStage == "teleport2") {
      teleportWhite = teleportWhite.filter((e) => e.x != x || e.y != y);
    }
  }
  if (x == player.x && y == player.y) {
    context.drawImage(
      playerImages[player.dir],
      x * gridSize,
      y * gridSize,
      gridSize,
      gridSize
    );
    stageData[y][x] = "path";
    return;
  }
  const d = stageData[y][x];
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
      x * gridSize,
      y * gridSize,
      gridSize,
      gridSize
    );
  }
}

function selectTile(tileElem) {
  selectedTileElem.classList.remove("selected");
  tileElem.classList.add("selected");
  selectedTileElem = tileElem;
  selectedTile = tileElem.id;
}

function rotatePlayer() {
  const nextDir = {
    r: "u",
    u: "l",
    l: "d",
    d: "r",
  };
  const n = nextDir[player.dir];
  const playerTileElem = document.getElementById("player");
  playerTileElem.classList.remove(`player_${player.dir}`);
  playerTileElem.classList.add(`player_${n}`);
  player.dir = n;
  updateStage(player.x, player.y, "path");
}

export function checkMap() {
  const buildMapError = document.getElementById("build-map-error");

  teleportBlack = teleportBlack.filter(
    (e) => stageData[e.y][e.x] == "teleport1"
  );
  teleportWhite = teleportWhite.filter(
    (e) => stageData[e.y][e.x] == "teleport2"
  );

  let checkGoal = false;
  for (let y = 0; y < HEIGHT; ++y) {
    for (let x = 0; x < WIDTH; ++x) {
      if (stageData[y][x] == "goal") checkGoal = true;
    }
  }
  if (player.x < 0 || WIDTH <= player.x || player.y < 0 || HEIGHT <= player.y) {
    buildMapError.innerText = "キャラクターを配置してください。";
  } else if (!checkGoal) {
    buildMapError.innerText = "ゴールを配置してください。";
  } else if (teleportBlack.length == 1 || teleportWhite.length == 1) {
    buildMapError.innerText = "ワープのマークは２つ配置してください。";
  } else {
    buildMapError.style.display = "none";
    return true;
  }
  buildMapError.style.display = "block";
  return false;
}
