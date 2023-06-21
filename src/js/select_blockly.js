import * as Blockly from "blockly/core";
require("./blocks.js");
const AllBlocks = [
  "moveForward",
  "turn",
  "remove",
  "teleportation",
  "callGroup",
  "pickUpNumber",
  "dropNumber",
  "replaceNumber",
  "putNumber",
  "check",
  "checkPath",
  "checkFront",
  "and",
  "or",
  "not",
  "canTeleport",
  "check3",
  "checkFeet",
  "while",
  "whileIf",
  "if",
  "ifelse",
  "grouping",
];

//console.log("selectBlockly");

//Blocklyのツールボックスの設定
var options = {
  toolbox: document.getElementById("select-blockly-toolbox"),
  collapse: true,
  comments: true,
  disable: true,
  maxBlocks: Infinity,
  trashcan: true,
  horizontalLayout: false,
  toolboxPosition: "start",
  css: true,
  rtl: false,
  scrollbars: true,
  sounds: true,
  oneBasedIndex: true,
  maxInstances: AllBlocks.reduce((a, v) => ({ ...a, [v]: 1 }), {}), //すべてのブロックを一度ずつ使える
  grid: {
    spacing: 20,
    length: 1,
    colour: "#888",
    snap: true,
  },
};

//使うブロックの配置
var toolboxDiv = document.getElementById("select-blockly-toolbox");
toolboxDiv.innerHTML = "";
AllBlocks.forEach((block) => {
  toolboxDiv.innerHTML += `<block type="${block}"></block>`;
});

//blocklyを設定
var selectBlocklyDiv = document.getElementById("select-blockly-div");
let workspace = Blockly.inject("select-blockly-div", options);

export let selectedBlocks = new Array();

workspace.addChangeListener(function (event) {
  let prevSelectedBlocks = selectedBlocks.slice();
  if (event instanceof Blockly.Events.Ui) {
    return;
  }
  let blocks = Blockly.serialization.workspaces.save(workspace);
  //console.log(blocks);
  if (!blocks || !blocks.blocks || !blocks.blocks.blocks) return;
  selectedBlocks.length = 0;

  function checkBlock(block) {
    for (let k in block) {
      if (typeof block[k] === "object") {
        checkBlock(block[k]);
      } else if (k == "type") {
        selectedBlocks.push(block[k]);
      }
    }
  }

  for (let i = 0; i < blocks.blocks.blocks.length; ++i)
    checkBlock(blocks.blocks.blocks[i]);
  //console.log(selectedBlocks);

  if (JSON.stringify(prevSelectedBlocks) != JSON.stringify(selectedBlocks)) {
    const selectedBlocksList = document.getElementById("selected-blocks-list");
    selectedBlocksList.innerHTML = "";
    selectedBlocks.forEach((b) => {
      const AllBlocksToName = {
        moveForward: "１マスすすむ",
        turn: "向く",
        while: "繰り返し",
        remove: "岩をのける",
        if: "もし〜なら",
        ifelse: "もし〜なら、そうでないなら",
        check:
          "「道」「草」「岩」「数字」「土の道」「石の道」「木の道」かどうか",
        //"check2": "「草」または「岩」かどうか",
        checkPath: "道かどうか",
        checkFront:
          "前が「道」「草」「岩」「数字」「土の道」「石の道」「木の道」かどうか",
        grouping: "ていぎ",
        callGroup: "実行",
        and: "かつ",
        or: "または",
        //"ifAnd": "もし〜かつ～なら",
        //"ifOr": "もし～または～なら",
        not: "でない",
        canTeleport: "ワープできる場所にいる",
        teleportation: "ワープする",
        whileIf: "～であるかぎり",
        check3: "足元の数字と持っている数字をくらべる",
        pickUpNumber: "数字をひろう",
        dropNumber: "数字をおく",
        replaceNumber: "数字を持ちかえる",
        checkFeet: "足元をかくにん",
        putNumber: "数字をおく",
      };
      const newLi = document.createElement("li");
      newLi.innerText = AllBlocksToName[b];
      selectedBlocksList.appendChild(newLi);
    });
  }
});
