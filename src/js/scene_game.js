const cloneDeep = require("lodash/cloneDeep");

class SceneGame {
  init(data, t) {
    this.mode = data.mode;
    this.stageNum = data.stage_num;
    this.stageinfo = data.stageinfo;
    this.mapData = data.mapData;
    this.gameClearCallBack = data.gameClearCallBack;
    //ブラウザにステージ番号を記憶させる
    if (typeof window !== "undefined") window.savenum = this.stageNum;

    this.load = t.load;
    this.add = t.add;
    this.make = t.make;
    this.registry = t.registry;
    this.events = t.events;
  }

  constructor() {
    //体力とブロック
    this.blockCount = 0;
    this.steps = 0;

    this.numEnergy;
    this.player = {};
    this.workspace;
    //this.mapDat;
    this.tileWidth = 30;
    this.tileHeight = 30;
    this.map2Img;
    this.stars = new Array(3);
    //ゲーム再生用変数
    this.velocity = 3;
    this.cmdDelta = 45;
    this.tick = 0;
    this.isRunning = false;
    this.ismoving = false;
    this.commandGenerator = undefined;
    this.funcs = {};
    this.tilesets;
    this.teleportindex;
    this.getkey = 0; //キーを何個取得したか
    this.isGameOver = false; //ゲームオーバーなら、１ステップ待ってゲームオーバー画面に移動

    this.tileName = {
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

    this.directionToName = {
      0: "down",
      1: "left",
      2: "right",
      3: "up",
    };
  }

  // サーバー上でクリアチェック時にはこの部分だけ行う
  preloadServer() {
    // 数字のタイルをこれと比較して、等しかったらゴールできる
    console.log(this.mapData.map);
    this.ansArray = this.mapData.map.map((v) =>
      v.map((s) => {
        let r = /:ans(\d)/.exec(s);
        if (r && r.length == 2) return r[1];
        return null;
      })
    );
    this.numberStage = false; // 数字を含むステージかどうか
    this.layerNum = Math.max(
      this.mapData.map
        .flat()
        .map((v) => v.split(":").length)
        .reduce((a, b) => Math.max(a, b))
    ); // レイヤーの数。普段は1。
    this.mapArrayDefault = new Array(this.layerNum); // mapArrayの初期値
    for (let i = 0; i < this.layerNum; ++i) {
      this.mapArrayDefault[i] = new Array(this.mapData.height);
      for (let y = 0; y < this.mapData.height; ++y)
        this.mapArrayDefault[i][y] = new Array(this.mapData.width).fill(null);
    }
    for (let y = 0; y < this.mapData.height; ++y) {
      for (let x = 0; x < this.mapData.width; ++x) {
        const str = this.mapData.map[y][x];
        const tiles = str.split(":");
        tiles.forEach((v, i) => {
          let tile = this.tileName[v];
          this.mapArrayDefault[i][y][x] = tile;
          if (this.tileName["num0"] <= tile && tile <= this.tileName["num9"]) {
            this.numberStage = true;
          }
        });
      }
    }

    if (this.mode == "default") this.stage_title = this.mapData.description;
    else if (this.mode == "posted") this.stage_title = this.mapData.name;
    this.blockCount = 0;
    this.steps = 0;

    let keyCount = 0;
    for (let y = 0; y < this.mapData.height; ++y) {
      for (let x = 0; x < this.mapData.width; ++x) {
        const str = this.mapData.map[y][x];
        const tiles = str.split(":");
        if (tiles[0] == "key") keyCount++;
      }
    }

    if (!this.mapData.keycnt || this.mapData.keycnt == 0) {
      this.keycnt = keyCount;
    } else {
      this.keycnt = this.mapData.keycnt;
    }
  }

  // クライアント側でのみ行う
  preload(Blockly, player1, player2, inventoryImage, tileImage) {
    this.Blockly = Blockly;
    this.preloadServer();
    this.tileMaps = new Array(this.layerNum); // タイルマップ
    this.tileSets = new Array(this.layerNum); // 画像
    this.layers = new Array(this.layerNum); // レイヤー

    //ゲームに画像などを読み込んでいる　引数は("キー", importした画像など)
    this.load.spritesheet("player", player1, {
      frameWidth: 30,
      frameHeight: 30,
      margin: 1,
      spacing: 2,
    });
    this.load.spritesheet("player2", player2, {
      frameWidth: 30,
      frameHeight: 30,
      margin: 1,
      spacing: 2,
    });

    this.load.spritesheet("inventory", inventoryImage, {
      frameWidth: 12,
      frameHeight: 24,
    });
    this.load.spritesheet("tileImage", tileImage, {
      frameWidth: 30,
      frameHeight: 30,
      startFrame: 0,
    });

    //Blocklyのツールボックスの設定
    var options = {
      toolbox: document.getElementById("toolbox"),
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
      grid: {
        spacing: 20,
        length: 1,
        colour: "#888",
        snap: true,
      },
    };

    //使うブロックの配置
    var toolboxDiv = document.getElementById("toolbox");
    let blocks;
    if (this.mapData.blocks.split) {
      blocks = this.mapData.blocks.split(",");
    } else {
      blocks = this.mapData.blocks;
    }
    toolboxDiv.innerHTML = "";
    blocks.forEach((block) => {
      toolboxDiv.innerHTML += `<block type="${block}"></block>`;
    });

    //blocklyを設定
    var blocklyDiv = document.getElementById("blocklyDiv");
    this.workspace = this.Blockly.inject("blocklyDiv", options);

    this.teleportindex = this.mapData.teleportid;

    if (this.mode == "default") {
      //ステージ番号・タイトル
      this.title = document.getElementById("title");
      this.title.innerHTML = `ステージ${this.stageNum} 『 ${this.stage_title} 』`;

      //注意書きを入れる
      var alert = document.getElementById("alert");
      if (this.mapData.alert) {
        var alertBox = document.getElementById("alertBox");
        alertBox.style.display = "flex";
        alert.innerHTML = this.mapData.alert;
      }
      //クリアレベルの記載
      const clearlevel1 = document.getElementById("level1");
      const clearlevel2 = document.getElementById("level2");
      const limToStr = (lim) => {
        if (!lim || (!lim.block && !lim.step)) return "制限なし";
        let s = "";
        if (lim.block) s += `${lim.block}ブロック`;
        if (lim.block && lim.step) s += "、";
        if (lim.step) s += `${lim.step}ステップ`;
        return s + "以内";
      };
      clearlevel1.innerHTML = "★★：" + limToStr(this.mapData.clearlevel.star2);
      clearlevel2.innerHTML = "★★★：" + limToStr(this.mapData.clearlevel.star3);
    } else if (this.mode == "posted") {
      //タイトル
      this.title = document.getElementById("title");
      this.title.innerHTML = `ステージ『 ${this.stage_title} 』`;
    }
    //体力・ブロック数制限を記載
    this.numEnergy = document.getElementById("numenergy");
    this.numFrame = document.getElementById("numFrame");
    this.updateScoreBoard();

    //Blocklyのイベントハンドラ
    this.workspace.addChangeListener(
      function (event) {
        let blocks = this.Blockly.serialization.workspaces.save(this.workspace);
        this.blockCount = this.countBlocks2(blocks);
        this.updateScoreBoard();
      }.bind(this)
    );

    //実行ボタンの設定
    const executeButton = document.getElementById("executeButton");
    executeButton.onclick = this.LoadBlocksandGenerateCommand.bind(this);

    //プレイヤー変更ボタンの設定
    const playerChangeButton = document.getElementById("playerChangeButton");
    playerChangeButton.onclick = this.playerChange.bind(this);

    //リセットボタンの設定
    const resetbutton = document.getElementById("resetbutton");
    resetbutton.onclick = this.resetCommand.bind(this);

    if (this.mode == "default") {
      //タイトルボタンの設定
      const titlebutton = document.getElementById("titlebutton");
      const titleLink = "./default_stage.html";
      titlebutton.setAttribute("href", titleLink);
    }

    //全消去ボタンの設定
    const erasebutton = document.getElementById("erasebutton");
    erasebutton.onclick = this.eraseCommand.bind(this);

    //undo, redoボタンの設定
    const undobutton = document.getElementById("undobutton");
    undobutton.onclick = this.undoCommand.bind(this);

    const redobutton = document.getElementById("redobutton");
    redobutton.onclick = this.redoCommand.bind(this);

    //早送りボタンの設定
    const speedupButton = document.getElementById("speedup_toggle");
    speedupButton.onclick = () => {
      this.toggleFastForward(speedupButton.checked);
    };

    //解説ボタンの設定
    if (this.mode == "default") {
      //解説ボタンの設定
      const commentaryButton = document.getElementById("commentaryButton");
      commentaryButton.style.visibility = "visible";
      commentaryButton.setAttribute(
        "href",
        "/default_stage/commentary/stage" + this.stageNum + ".html"
      );
    }

    if (this.mode == "default") {
      //前のステージボタンの設定
      let previous_stage_num = Number(this.stageNum) - 1;
      if (previous_stage_num >= 0) {
        let previous_stage_title =
          this.stageinfo.stages[previous_stage_num].description;
        const previousStageButton = document.getElementById(
          "previousStageButton"
        );
        previousStageButton.setAttribute(
          "href",
          "game_default.html?stage=" + previous_stage_num
        );
        previousStageButton.innerHTML = `前のステージ『 ${previous_stage_title} 』`;
      } else {
        const previousStageButton = document.getElementById(
          "previousStageButton"
        );
        const previousLink = "./default_stage.html";
        previousStageButton.setAttribute("href", previousLink);
        previousStageButton.innerHTML = "他のステージ";
      }

      //次のステージボタンの設定
      let next_stage_num = Number(this.stageNum) + 1;
      if (next_stage_num < this.stageinfo.stages.length) {
        let hardStage;
        for (let i = 0; i < this.stageinfo.stages.length; ++i) {
          if (this.stageinfo.stages.level == "hard") {
            hardStage = i;
            break;
          }
        }
        if (this.stageNum == hardStage - 1) {
          let i;
          try {
            const clearleveljson = localStorage.getItem("clearlevel");
            const clearlevels = JSON.parse(clearleveljson);
            for (i = 0; i < hardStage; ++i) {
              if (clearlevels[i] == -1) {
                break;
              }
            }
          } catch (e) {
            // console.log(e);
            i = hardStage - 1; // localStorageが利用不可の時は上級ステージをそのまま表示
          }

          if (i == hardStage - 1) {
            let next_stage_title =
              this.stageinfo.stages[next_stage_num].description;
            const nextStageButton = document.getElementById("nextStageButton");
            nextStageButton.setAttribute(
              "href",
              "game_default.html?stage=" + next_stage_num
            );
            nextStageButton.innerHTML = `次のステージ『 ${next_stage_title} 』`;
          }
        } else {
          let next_stage_title =
            this.stageinfo.stages[next_stage_num].description;
          const nextStageButton = document.getElementById("nextStageButton");
          nextStageButton.setAttribute(
            "href",
            "game_default.html?stage=" + next_stage_num
          );
          nextStageButton.innerHTML = `次のステージ『 ${next_stage_title} 』`;
        }
      } else {
        const nextStageButton = document.getElementById("nextStageButton");
        const nextLink = "./default_stage.html";
        nextStageButton.setAttribute("href", nextLink);
        nextStageButton.innerHTML = "他のステージ";
      }
    }
    return this.workspace;
  }

  create() {
    this.map2Img = 1;

    this.player = this.add.sprite(0, 0, "player");
    this.player.setOrigin(0, 0);
    this.player.setAlpha(1);

    this.player.anims.create({
      key: "move3-player",
      frames: this.player.anims.generateFrameNames("player", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    }); //down
    this.player.anims.create({
      key: "move1-player",
      frames: this.player.anims.generateFrameNames("player", {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    }); //left
    this.player.anims.create({
      key: "move0-player",
      frames: this.player.anims.generateFrameNames("player", {
        start: 6,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    }); //right
    this.player.anims.create({
      key: "move2-player",
      frames: this.player.anims.generateFrameNames("player", {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    }); //up
    this.player.anims.create({
      key: "move3-player2",
      frames: this.player.anims.generateFrameNames("player2", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    }); //down
    this.player.anims.create({
      key: "move1-player2",
      frames: this.player.anims.generateFrameNames("player2", {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    }); //left
    this.player.anims.create({
      key: "move0-player2",
      frames: this.player.anims.generateFrameNames("player2", {
        start: 6,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    }); //right
    this.player.anims.create({
      key: "move2-player2",
      frames: this.player.anims.generateFrameNames("player2", {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    }); //up

    this.resetRunning(); //これを追加して無駄をなくす
  }
  // マップの(x,y)をnにする
  updateMap(x, y, n) {
    if (x < 0 || this.mapData.width <= x || y < 0 || this.mapData.height <= y)
      return;
    this.mapArray[0][y][x] = n;
    if (this.layers) this.layers[0].removeTileAt(x, y);
    if (this.layers) this.layers[0].putTileAt(n, x, y);
  }
  // マップの(x,y)のタイルを得る
  getMap(x, y) {
    if (x < 0 || this.mapData.width <= x || y < 0 || this.mapData.height <= y)
      return null;
    return this.mapArray[0][y][x];
  }
  update() {
    //プレイヤーを動かしたり、衝突判定からのロジックを回したり
    //ここでblockが使われたらこの動作をします的なことを書きます
    //多分キャラクターの座標更新だけなので難しくなさそう。
    //キャラクターの座標更新
    if (this.player.targetX != this.player.x) {
      const difX = this.player.targetX - this.player.x;
      const x = (difX / Math.abs(difX)) * this.velocity;
      this.player.x += Math.abs(x) > Math.abs(difX) ? difX : x;
    }
    if (this.player.targetY != this.player.y) {
      const difY = this.player.targetY - this.player.y;
      const y = (difY / Math.abs(difY)) * this.velocity;
      this.player.y += Math.abs(y) > Math.abs(difY) ? difY : y;
    }
    //コマンドが生成されている時それを実行する
    this.runCode(false);
  }
  //さまざまな関数
  runCode(is_server) {
    if (!this.isRunning) {
      if (this.workspace) this.workspace.highlightBlock(false);
      return "end";
    }
    if (++this.tick >= this.cmdDelta) {
      if (this.isGameOver) {
        this.gameOver("", true);
        return "gameOver";
      }
      if (this.player.anims) {
        this.player.anims.stop();
      }
      if (this.player.setFrame)
        this.player.setFrame(this.player.direction * 3 + 1);
      let keyCheck = this.getkey == this.keycnt;
      let numberCheck = true;

      if (this.ansArray) {
        for (let y = 0; y < this.mapData.height; ++y) {
          for (let x = 0; x < this.mapData.width; ++x) {
            if (this.ansArray[y][x]) {
              if (
                this.ansArray[y][x] !=
                this.getMap(x, y) - this.tileName["num0"]
              ) {
                numberCheck = false;
              }
            }
          }
        }
      }

      // ゴールの旗を上げる。goalNをgoalにする。
      if (keyCheck && numberCheck) {
        for (let y = 0; y < this.mapData.height; ++y) {
          for (let x = 0; x < this.mapData.width; ++x) {
            if (this.getMap(x, y) == this.tileName["goalN"])
              this.updateMap(x, y, this.tileName["goal"]);
          }
        }
      } else {
        for (let y = 0; y < this.mapData.height; ++y) {
          for (let x = 0; x < this.mapData.width; ++x) {
            if (this.getMap(x, y) == this.tileName["goal"])
              this.updateMap(x, y, this.tileName["goalN"]);
          }
        }
      }
      if (
        this.getMap(this.player.gridX, this.player.gridY) ==
        this.tileName["goal"]
      ) {
        if (!is_server) this.clearGame();
        return "clear";
      }

      let gen = this.commandGenerator.next(); //yieldで止まってたコマンドを再開する
      this.steps += 1;
      this.updateScoreBoard();
      if (gen.value) {
        if (this.workspace) this.workspace.highlightBlock(gen.value);
      }
      if (!gen.done) this.tick = 0;
      else {
        this.gameOver("ゴールにたどり着きませんでした。", true);
        this.endRunning();
      }
    }
    return "continue";
  }
  toggleFastForward(on) {
    this.velocity = on ? 8 : 3;
    this.cmdDelta = Math.floor(45 / this.velocity);
  }
  // directionの方向の数字を取得、direction=5でplayerが持っている数を返す
  getNum(player, direction) {
    if (direction == 5) {
      return this.player.number;
    }
    var player_direction = this.getDirection(player); ////0:right,1;left,2:up,3,downを返すように
    var dir = 0;
    if (direction == 0) dir = [0, 1, 2, 3][player_direction]; //前
    if (direction == 1) dir = [3, 2, 0, 1][player_direction]; //右
    if (direction == 2) dir = [2, 3, 1, 0][player_direction]; //左
    if (direction == 3) dir = [1, 0, 3, 2][player_direction]; //後ろ
    if (direction == 4) dir = 4; //足元
    const dx = [1, -1, 0, 0, 0];
    const dy = [0, 0, -1, 1, 0];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];

    const tile = this.getMap(nextGX, nextGY);
    if (!tile || tile < this.tileName["num0"] || this.tileName["num9"] < tile)
      return null;
    return tile - this.tileName["num0"];
  }
  // check3ブロックのためのヘルパー関数
  check3Helper(operation) {
    const number1 = this.getNum(this.player, 4);
    const number2 = this.getNum(this.player, 5);
    if (number1 === null) {
      this.gameOver("足元に数字はありません。");
      return false;
    }
    if (number2 === null) {
      this.gameOver("数字を持っていません。");
      return false;
    }
    switch (operation) {
      case "equal":
        return number1 == number2;
      case "bigger":
        return number1 > number2;
      case "less":
        return number1 < number2;
    }
    return false;
  }
  // インベントリに表示されている数を変更
  changeInventoryNumber(n) {
    if (!this.inventory) return;
    if (n === null) n = -1;
    const numSprites = this.inventory.list.slice(-3);
    //console.log(numSprites);
    numSprites[0].setFrame(5 + 2 * n);
    numSprites[1].setFrame(6 + 2 * n);
  }
  // 足元の数を拾う（すでに数を持っている場合は置き換える）
  pickUpNumber() {
    const x = this.player.gridX,
      y = this.player.gridY;
    const tile = this.getMap(x, y);
    if (!tile || tile < this.tileName["num0"] || this.tileName["num9"] < tile) {
      this.gameOver("足元に数字はありません。");
      return;
    }
    const tilenum = tile - this.tileName["num0"];
    this.updateMap(x, y, this.tileName["path"]);
    this.player.number = tilenum;
    this.changeInventoryNumber(tilenum);
  }
  // 持っている数を足元に置く（足元に数がある場合は置き換える）
  dropNumber() {
    if (this.player.number === null) {
      this.gameOver("数字を持っていないのに置こうとしました。");
      return;
    }
    const x = this.player.gridX,
      y = this.player.gridY;
    const tile = this.getMap(x, y);
    if (!tile) {
      this.gameOver("マップの外には数字を置けません。");
      return null;
    }
    if (tile == this.tileName["stone"]) {
      this.gameOver("石の道には数字を置けません。");
      return null;
    }
    if (tile == this.tileName["wood"]) {
      this.gameOver("木の道には数字を置けません。");
      return null;
    }
    this.updateMap(x, y, this.tileName["num0"] + this.player.number);
    this.player.number = null;
    this.changeInventoryNumber(null);
  }
  // 足元にある数を拾って持っている数を置く
  replaceNumber() {
    if (this.player.number === null) {
      this.gameOver("数字を持っていないのに置こうとしました。");
      return;
    }
    const x = this.player.gridX,
      y = this.player.gridY;
    const tile = this.getMap(x, y);
    if (!tile || tile < this.tileName["num0"] || this.tileName["num9"] < tile) {
      this.gameOver("足元に数字はありません。");
      return;
    }
    const tilenum = tile - this.tileName["num0"];
    this.updateMap(x, y, this.tileName["num0"] + this.player.number);
    this.player.number = tilenum;
    this.changeInventoryNumber(tilenum);
  }
  // 新しく数字を置く
  putNumber(num) {
    const x = this.player.gridX,
      y = this.player.gridY;
    const tile = this.getMap(x, y);
    if (!tile) {
      this.gameOver("マップの外には数字を置けません。");
      return null;
    }
    if (tile == this.tileName["stone"]) {
      this.gameOver("石の道には数字を置けません。");
      return null;
    }
    if (tile == this.tileName["wood"]) {
      this.gameOver("木の道には数字を置けません。");
      return null;
    }
    this.updateMap(x, y, this.tileName[num]);
  }
  tryMove(player, dir) {
    // ここはこれでいいの？ってなるけど
    this.ismoving = true;
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, -1, 1];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];
    if (this.player.anims)
      this.player.anims.play("move" + dir + "-" + player.texture.key);

    const tile = this.getMap(nextGX, nextGY);
    if (tile === null) {
      this.gameOver("マップから外れることはできません");
      return; // 進めない
    }

    if (tile == this.tileName["grass"]) {
      this.gameOver("道から外れることはできません");
      return; //壁または障害物には進めない
    }
    if (tile == this.tileName["rock"]) {
      this.gameOver("岩には登れません。");
      return; //壁または障害物には進めない
    }
    if (tile == this.tileName["key"]) {
      this.getkey += 1;
      this.updateMap(nextGX, nextGY, this.tileName["path"]);
      if (this.inventory) {
        const keySprite = this.inventory.list[this.getkey]; //インベントリ:[左端, 鍵, ... ]
        //console.log(this.inventory.list, keySprite);
        if (keySprite) keySprite.setFrame(2); // インベントリの対応する位置の鍵を取った状態にする
      }
    } //keyを取得
    player.targetX += dx[dir] * this.tileWidth * this.map2Img;
    player.gridX = nextGX;
    player.targetY += dy[dir] * this.tileHeight * this.map2Img;
    player.gridY = nextGY;
    if (this.numEnergy) this.numEnergy.innerHTML = `ステップ数：${this.steps}`;
  }
  removeObstacle(player) {
    //向いている方角の障害物を除去しようとする
    const dir = this.getDirection(player);
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, -1, 1];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];
    const tile = this.getMap(nextGX, nextGY);
    if (tile === null) return; // 進めない

    if (tile == this.tileName["rock"]) {
      //向いている方向に障害物がある場合、それを取り除く
      this.updateMap(nextGX, nextGY, this.tileName["path"]);
      return;
    } else {
      this.gameOver("前に岩がないのにとりのぞこうとしました");
      return;
    }
  }
  getDirection(player) {
    //向いている方向を検知する
    const dirs = {
      right: 0,
      left: 1,
      up: 2,
      down: 3,
    };
    return dirs[this.directionToName[player.direction]];
  }
  changeDirection(player, dir) {
    let newDir = 0;
    if (dir == 0) newDir = [1, 3, 0, 2][this.player.direction]; //右
    else if (dir == 1) newDir = [2, 0, 3, 1][this.player.direction]; //左
    else newDir = [3, 2, 1, 0][this.player.direction]; //後ろ
    this.player.direction = newDir;
    if (player.setFrame) player.setFrame(newDir * 3 + 1);
  }
  // can_teleportブロックのための関数
  canTeleport(color) {
    const tile = this.getMap(this.player.gridX, this.player.gridY);
    if (color == "black") return tile == this.tileName["teleport1"];
    else return tile == this.tileName["teleport2"];
  }

  clearGame() {
    if (this.mode == "default") {
      this.clearGame_default();
    } else if (this.mode == "posted") {
      this.clearGame_posted();
    } else if (this.mode == "testPlay") {
      this.clearGame_testPlay();
    }
  }
  clearGame_posted() {
    this.endRunning();
    const blockCount = this.countBlocks();
    if (this.gameClearCallBack)
      this.gameClearCallBack(
        this.blocks,
        this.steps,
        blockCount,
        this.stage_title,
        this.mapData.submitter
      );
    try {
      let clearPostedStage = localStorage.getItem("postedStage");
      let fastClear = { steps: this.steps, blocks: blockCount }; // とりあえず最速と仮定して過去の記録と比較する
      let shortClear = { steps: this.steps, blocks: blockCount }; // とりあえず最短と仮定して過去の記録と比較する

      if (clearPostedStage === null) {
        clearPostedStage = new Object();
      } else {
        clearPostedStage = JSON.parse(clearPostedStage);
        if (clearPostedStage[this.stageNum]) {
          const fastest = clearPostedStage[this.stageNum].fast; // 過去の最速記録
          const shortest = clearPostedStage[this.stageNum].short; // 過去の最短記録
          if (fastest.steps < this.steps) {
            fastClear = fastest;
          } else if (
            fastest.steps === this.steps &&
            fastest.blocks < blockCount
          ) {
            fastClear = fasteset;
          }
          if (shortest.blocks < blockCount) {
            shortClear = shortest;
          } else if (
            shortest.blocks === blockCount &&
            shortest.steps < this.steps
          ) {
            shortClear = shortest;
          }
        }
      }
      clearPostedStage[this.stageNum] = { fast: fastClear, short: shortClear };
      localStorage.setItem("postedStage", JSON.stringify(clearPostedStage));
    } catch (e) {
      // console.log(e);
    }
  }
  clearGame_testPlay() {
    this.endRunning();
    if (this.gameClearCallBack) this.gameClearCallBack(this.blocks, this.steps);
  }
  clearGame_default() {
    //console.log(this.stageNum);
    window.savenum = -1;
    //console.log("goal");
    this.endRunning();

    const stageClearStars = document.getElementById("stageClearStars");
    stageClearStars.className = "";

    const blockNum = this.countBlocks();

    let level = 2; // 2:星３、1:星２、0:星１
    const checkStar2 =
      (!this.mapData.clearlevel.star2 ||
        !this.mapData.clearlevel.star2.step ||
        this.mapData.clearlevel.star2.step >= this.steps) &&
      (!this.mapData.clearlevel.star2 ||
        !this.mapData.clearlevel.star2.block ||
        this.mapData.clearlevel.star2.block >= blockNum);

    const checkStar3 =
      (!this.mapData.clearlevel.star3 ||
        !this.mapData.clearlevel.star3.step ||
        this.mapData.clearlevel.star3.step >= this.steps) &&
      (!this.mapData.clearlevel.star3 ||
        !this.mapData.clearlevel.star3.block ||
        this.mapData.clearlevel.star3.block >= blockNum);

    if (checkStar3) level = 2;
    else if (checkStar2) level = 1;
    else level = 0;

    if (level == 2) {
      stageClearStars.classList.add("star3");
      stageClearStars.classList.add("star2");
      stageClearStars.classList.add("star1");
    } else if (level == 1) {
      stageClearStars.classList.add("star2");
      stageClearStars.classList.add("star1");
    } else {
      stageClearStars.classList.add("star1");
    }

    try {
      let clearleveljson = localStorage.getItem("clearlevel");
      if (clearleveljson === null) {
        clearleveljson = new Object();
        for (let i = 0; i < this.stageinfo.stages.length; i++) {
          clearleveljson[i] = -1;
        }
        clearleveljson[this.stageNum] = level;
      } else {
        clearleveljson = JSON.parse(clearleveljson);
        if (clearleveljson[this.stageNum] < level) {
          clearleveljson[this.stageNum] = level;
        }
      }
      localStorage.setItem("clearlevel", JSON.stringify(clearleveljson));
    } catch (e) {
      // console.log(e);
    }

    const shareURL = encodeURIComponent(
      "https://2022.eeic.jp/game_default.html?stage=" + this.stageNum
    );
    const tweet = encodeURIComponent(
      `eeicプログラミング教室　ステージ${this.stageNum}「${
        this.mapData.description
      }」を星${level + 1}でクリアしました。#eeic_pkyo #近未来体験2022`
    );
    const twitterURL = `https://twitter.com/intent/tweet?text=${tweet}&url=${shareURL}`;
    const facebookURL = `http://www.facebook.com/share.php?u=${shareURL}`;

    document.getElementById("shareTwitterA").setAttribute("href", twitterURL);
    document.getElementById("shareFacebookA").setAttribute("href", facebookURL);

    // 解説ボタン
    const ansButton = document.getElementById("ansButton");
    ansButton.setAttribute(
      "href",
      "./default_stage/commentary/stage" + this.stageNum + ".html"
    );

    const nextStageButton2 = document.getElementById("nextStageButton2");
    const nextStageButton3 = document.getElementById("nextStageButton3");
    //次のステージボタンの設定
    if (Number(this.stageNum) + 1 < this.stageinfo.stages.length) {
      window.savenum = Number(this.stageNum) + 1;
      const URL = `./game_default.html?stage=${Number(this.stageNum) + 1}`;
      nextStageButton2.setAttribute("href", URL);
      nextStageButton2.style.display = "inline";
      nextStageButton3.style.display = "none";
    } else {
      nextStageButton2.style.display = "none";
      nextStageButton3.style.display = "inline";
    }

    //再挑戦ボタン
    const tryAgainButton = document.getElementById("tryAgainButton");
    tryAgainButton.onclick = () => {
      this.resetRunning();
      document.getElementById("gameClearDiv").style.display = "none";
    };

    // ゲームクリア画面を表示
    document.getElementById("gameClearDiv").style.display = "block";
  }
  gameOver(reason, withoutWait) {
    // １ステップだけ待つ
    if (!withoutWait) {
      this.isGameOver = true;
      this.gameOverReason = reason;
      return;
    }
    if (!reason) reason = this.gameOverReason;
    this.isGameOver = false;
    this.endRunning();
    if (this.mode == "default") {
      this.gameOverDefault(reason);
    } else if (this.mode == "posted") {
      this.gameOverPosted(reason);
    } else if (this.mode == "testPlay") {
      this.gameOverTestPlay(reason);
    }
  }
  gameOverDefault(reason) {
    //説明
    const gameOverReason = document.getElementById("gameOverReason");
    gameOverReason.innerText = reason;

    // 解説ボタン
    const ansButton = document.getElementById("ansButton2");
    ansButton.setAttribute(
      "href",
      "./default_stage/commentary/stage" + this.stageNum + ".html"
    );

    //再挑戦ボタン
    const tryAgainButton = document.getElementById("tryAgainButton2");
    tryAgainButton.onclick = () => {
      this.resetRunning();
      document.getElementById("gameOverDiv").style.display = "none";
    };

    // ゲームオーバー画面を表示
    const gameOverDiv = document.getElementById("gameOverDiv");
    gameOverDiv.style.display = "block";
  }
  gameOverPosted(reason) {
    //説明
    const gameOverReason = document.getElementById("gameOverReason");
    gameOverReason.innerText = reason;

    //再挑戦ボタン
    const tryAgainButton = document.getElementById("tryAgainButton2");
    tryAgainButton.onclick = () => {
      this.resetRunning();
      document.getElementById("gameOverDiv").style.display = "none";
    };

    // ゲームオーバー画面を表示
    const gameOverDiv = document.getElementById("gameOverDiv");
    gameOverDiv.style.display = "block";
  }
  gameOverTestPlay(reason) {
    //説明
    const gameOverReason = document.getElementById("gameOverReason");
    gameOverReason.innerText = reason;

    //再挑戦ボタン
    const tryAgainButton = document.getElementById("tryAgainButton2");
    tryAgainButton.onclick = () => {
      this.resetRunning();
      document.getElementById("gameOverDiv").style.display = "none";
    };

    // ゲームオーバー画面を表示
    const gameOverDiv = document.getElementById("gameOverDiv");
    gameOverDiv.style.display = "block";
  }
  exitGameScene() {
    this.isRunning = false;
    this.isGameOver = false;
    this.commandGenerator = undefined;
    this.registry.destroy();
    this.events.off();
    //blocklyの後始末
    if (this.workspace) this.workspace.dispose();
  }
  endRunning() {
    if (this.player.anims) {
      this.player.anims.stop();
    }
    if (this.player.setFrame)
      this.player.setFrame(this.player.direction * 3 + 1);
    this.isRunning = false;
    this.isGameOver = false;
    this.ismoving = false;
    this.tick = 0;
  }
  LoadBlocksandGenerateCommand() {
    //ボタンを押すと発火
    this.resetRunning(); //多分player位置の初期化など
    this.blocks = this.Blockly.serialization.workspaces.save(this.workspace);
    if (!this.blocks || !this.blocks.blocks) {
      this.gameOver("ブロックを組み立ててください", true);
      this.blockCount = 0;
      this.updateScoreBoard();
      return;
    }
    this.blockCount = this.countBlocks();
    this.updateScoreBoard();
    this.executeBlocks();
  }
  eraseCommand() {
    this.isRunning = false;
    this.isGameOver = false;
    this.commandGenerator = undefined;
    this.resetRunning();
    this.workspace.clear();
  }
  undoCommand() {
    this.isRunning = false;
    this.isGameOver = false;
    this.commandGenerator = undefined;
    this.resetRunning();
    this.workspace.undo(false);
  }
  redoCommand() {
    this.isRunning = false;
    this.isGameOver = false;
    this.commandGenerator = undefined;
    this.resetRunning();
    this.workspace.undo(true);
  }
  resetCommand() {
    this.isRunning = false;
    this.isGameOver = false;
    this.commandGenerator = undefined;
    this.resetRunning();
  }
  selectCommand() {
    this.exitGameScene();
    this.scene.start("select");
  }

  // サーバー上でクリアチェック時にはこの部分だけ行う
  resetRunningServer() {
    this.endRunning();

    this.mapArray = cloneDeep(this.mapArrayDefault);
    //console.log(this.mapArray);

    let playerX = this.mapData.playerx;
    let playerY = this.mapData.playery;
    this.player.gridX = playerX;
    this.player.gridY = playerY;
    this.player.direction = this.mapData.playerdirection;

    this.funcs = {}; //funcsの初期化
    this.getkey = false;

    this.player.number = null; //持っている数
    const countblock = this.countBlocks();
    if (countblock) this.blockCount = countblock;
    this.steps = 0;
  }
  // クライアント側でのみ行う
  resetRunning() {
    this.resetRunningServer();
    for (let i = 0; i < this.layerNum; ++i) {
      if (this.layers[i]) this.layers[i].destroy();
      if (this.tileMaps[i]) this.tileMaps[i].destroy();

      this.tileMaps[i] = this.make.tilemap({
        data: this.mapArray[i],
        tileWidth: 30,
        tileHeight: 30,
        width: this.mapData.width,
        height: this.mapData.height,
      });
      this.tileSets[i] = this.tileMaps[i].addTilesetImage("tileImage");
      this.layers[i] = this.tileMaps[i].createLayer(0, this.tileSets[i], 0, 0);
    }

    for (let i = 0; i < 3; ++i) {
      if (this.stars[i]) this.stars[i].button.destroy();
    }
    this.updateScoreBoard();

    this.player.setDepth(1); //playerを前に持ってくる
    this.player.setFrame(this.player.direction * 3 + 1);

    this.player.targetX = this.player.x =
      this.tileWidth * this.player.gridX * this.map2Img;
    this.player.targetY = this.player.y =
      this.tileHeight * this.player.gridY * this.map2Img;

    this.inventory = this.add.container(0, 0);
    const addinventory = (n, i) => {
      const s = this.add.sprite(12 * i, 4, "inventory", n);
      s.setOrigin(0, 0);
      this.inventory.add(s);
    };
    let count = 0;
    addinventory(0, count++); // 左端
    for (let i = 0; i < this.keycnt; ++i) addinventory(1, count++); //まだとれていない鍵
    if (this.numberStage) {
      addinventory(3, count++);
      addinventory(4, count++); //数字
    }
    addinventory(25, count++); //右端
    if (count == 2) {
      this.inventory.setVisible(false);
    }
    for (let i = 0; i < this.layerNum; ++i) {
      if (this.layers[i]) this.layers[i].setAlpha(1);
    }
    this.player.setAlpha(1);

    //ゲームクリア画面
    const gameClearDiv = document.getElementById("gameClearDiv");
    if (gameClearDiv) gameClearDiv.style.display = "none";

    //ゲームオーバー画面
    const gameOverDiv = document.getElementById("gameOverDiv");
    if (gameOverDiv) gameOverDiv.style.display = "none";

    // 早送りボタン
    const speedupButton = document.getElementById("speedup_toggle");
    this.toggleFastForward(speedupButton.checked);
  }
  playerChange() {
    //プレイヤーの容姿を変更する
    //console.log("change!");
    let num = parseInt(this.player.frame.name);
    if (this.player.texture.key == "player") {
      this.player = this.player.setTexture("player2");
    } else {
      this.player.setTexture("player");
    }
    this.player.setFrame(num);
    if (this.ismoving) {
      let dir = this.getDirection(this.player);
      this.player.anims.play("move" + dir + "-" + this.player.texture.key);
    }
  }

  checkIf(player, direction, type) {
    var player_direction = this.getDirection(player); ////0:right,1;left,2:up,3,downを返すように
    var dir = 0;
    if (direction == 0) dir = [0, 1, 2, 3][player_direction]; //前
    if (direction == 1) dir = [3, 2, 0, 1][player_direction]; //右
    if (direction == 2) dir = [2, 3, 1, 0][player_direction]; //左
    if (direction == 3) dir = [1, 0, 3, 2][player_direction]; //後ろ
    if (direction == 4) dir = 4;
    if (dir != 4 && player.setFrame)
      player.setFrame(12 + [2, 1, 3, 0][dir] * 3);
    const dx = [1, -1, 0, 0, 0];
    const dy = [0, 0, -1, 1, 0];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];
    const tile = this.getMap(nextGX, nextGY);
    if (type == "soil") {
      return (
        tile != null &&
        ((this.tileName["path"] <= tile && tile <= this.tileName["goal"]) ||
          (this.tileName["num0"] <= tile && tile <= this.tileName["num9"]))
      );
    } else if (type == "movable") {
      return (
        tile != null &&
        this.tileName["path"] <= tile &&
        tile <= this.tileName["num9"]
      );
    } else if (type == "number") {
      return tile != null && this.getNum(player, direction) !== null;
    }
    return tile != null && tile == this.tileName[type];
  }
  run_teleport() {
    //カス実装
    let x = this.player.gridX;
    let y = this.player.gridY;
    let index = -1;
    for (let i = 0; i < this.mapData.teleportid.length; ++i) {
      if (this.mapData.teleportx[i] == x && this.mapData.teleporty[i] == y) {
        index = this.mapData.teleportid[i];
        break;
      }
    }
    if (index == -1) {
      //テレポート可能のマスじゃなかったら
      this.gameOver("何もない場所でワープしようとしました");
      return;
    }
    this.player.gridX = this.mapData.teleportx[index];
    this.player.gridY = this.mapData.teleporty[index];
    this.player.targetX = this.player.x =
      this.tileWidth * this.player.gridX * this.map2Img;
    this.player.targetY = this.player.y =
      this.tileHeight * this.player.gridY * this.map2Img;
    //console.log(this.player.gridX, this.player.gridY);
  }
  updateScoreBoard() {
    if (this.numEnergy) this.numEnergy.innerHTML = `ステップ数：${this.steps}`;
    if (this.numFrame && !this.isRunning)
      this.numFrame.innerHTML = `ブロック数: ${this.blockCount}`;
  }
  // Blocklyのブロックを再帰的に実行
  *execute_block(block) {
    if (!block || !block.id) return;
    let result = true;
    function* checkBlock(block) {
      const direction = block.fields && block.fields.direction;
      const thing = block.fields && block.fields.thing;
      const a = block.inputs && block.inputs.a && block.inputs.a.block;
      const b = block.inputs && block.inputs.b && block.inputs.b.block;
      const place = block.fields && block.fields.place;
      const operation = block.fields && block.fields.operation;
      switch (block.type) {
        case "check":
          result = this.checkIf(this.player, direction, thing);
          yield block.id;
          break;
        case "check2":
          result = this.checkIf(this.player, direction, thing);
          yield block.id;
          break;
        case "check_path":
          result = this.checkIf(this.player, direction, "movable");
          yield block.id;
          break;
        case "check_front":
          result = this.checkIf(this.player, 0, thing);
          yield block.id;
          break;
        case "and": {
          yield block.id;
          if (a) yield* checkBlock.bind(this, a)();
          const result1 = result;
          if (result1 == false) {
            result = false;
            break;
          }
          result = true;
          if (b) yield* checkBlock.bind(this, b)();
          result = result1 && result;
          break;
        }
        case "or": {
          yield block.id;
          if (a) yield* checkBlock.bind(this, a)();
          const result1 = result;
          if (result1 == true) {
            result = true;
            break;
          }
          result = true;
          if (b) yield* checkBlock.bind(this, b)();
          result = result1 || result;
          break;
        }
        case "not": {
          yield block.id;
          if (a) yield* checkBlock.bind(this, a)();
          const result1 = result;
          if (result1 == false) {
            result = true;
          } else {
            result = false;
          }
          break;
        }
        case "can_teleport":
          yield block.id;
          result = this.canTeleport(place);
          break;
        case "check3":
          result = this.check3Helper(operation);
          yield block.id;
          break;
        case "checkfeet":
          yield block.id;
          result = this.checkIf(this.player, 4, thing);
          break;
        default:
          console.error("unknown block", block);
      }
    }
    const direction = block.fields && block.fields.direction;
    const childBlock =
      block.inputs && block.inputs.child && block.inputs.child.block;
    const condition =
      block.inputs && block.inputs.condition && block.inputs.condition.block;
    const iftrue =
      block.inputs && block.inputs.iftrue && block.inputs.iftrue.block;
    const iffalse =
      block.inputs && block.inputs.iffalse && block.inputs.iffalse.block;
    const group_name = block.fields && block.fields.group_name;
    const cond1 =
      block.inputs && block.inputs.cond1 && block.inputs.cond1.block;
    const cond2 =
      block.inputs && block.inputs.cond2 && block.inputs.cond2.block;
    const thing = block.fields && block.fields.thing;

    switch (block.type) {
      case "move":
        this.tryMove(this.player, direction);
        yield block.id;
        this.ismoving = false;
        break;
      case "moveforward":
        this.tryMove(this.player, this.getDirection(this.player));
        yield block.id;
        this.ismoving = false;
        break;
      case "turn":
        this.changeDirection(this.player, direction);
        yield block.id;
        break;
      case "while":
        while (true) {
          yield block.id;
          if (childBlock) yield* this.execute_block(childBlock);
        }
        break;
      case "remove":
        this.removeObstacle(this.player);
        yield block.id;
        break;
      case "if":
        yield block.id;
        if (condition) {
          yield* checkBlock.bind(this, condition)();
        }
        if (result) {
          if (iftrue) yield* this.execute_block(iftrue);
        }
        break;
      case "ifelse":
        yield block.id;
        if (condition) {
          yield* checkBlock.bind(this, condition)();
        }
        if (result) {
          if (iftrue) yield* this.execute_block(iftrue);
        } else {
          if (iffalse) yield* this.execute_block(iffalse);
        }
        break;
      case "grouping":
        yield block.id;
        this.funcs[group_name] = block;
        break;
      case "callgroup":
        yield block.id;
        if (!this.funcs[group_name]) {
          this.gameOver(
            group_name +
              "という名前のブロックはありません。「ていぎ」のブロックは、「実行」の前に必要です。",
            true
          );
          break;
        }
        yield this.funcs[group_name].id;

        let group_code =
          this.funcs[group_name].inputs &&
          this.funcs[group_name].inputs.group_code &&
          this.funcs[group_name].inputs.group_code.block;
        if (group_code) {
          yield* this.execute_block(group_code);
        }
        break;
      case "if_and":
        yield block.id;
        if (cond1) {
          yield* checkBlock.bind(this, cond1)();
        }
        if (result == true && cond2) {
          yield* checkBlock.bind(this, cond2)();
        }
        if (result) {
          if (iftrue) yield* this.execute_block(iftrue);
        } else {
          if (iffalse) yield* this.execute_block(iffalse);
        }
        break;
      case "if_or":
        yield block.id;
        if (cond1) {
          yield* checkBlock.bind(this, cond1)();
        }
        if (result == false && cond2) {
          yield* checkBlock.bind(this, cond2)();
        }
        if (result) {
          if (iftrue) yield* this.execute_block(iftrue);
        } else {
          if (iffalse) yield* this.execute_block(iffalse);
        }
        break;
      case "teleportation":
        this.run_teleport();
        yield block.id;
        break;

      case "while_if":
        yield block.id;
        if (condition) {
          yield* checkBlock.bind(this, condition)();
        }
        while (result) {
          if (childBlock) yield* this.execute_block(childBlock);
          yield block.id;
          if (condition) {
            yield* checkBlock.bind(this, condition)();
          }
        }
        break;

      case "pickupnumber":
        this.pickUpNumber();
        yield block.id;
        break;
      case "dropnumber":
        this.dropNumber();
        yield block.id;
        break;
      case "replacenumber":
        this.replaceNumber();
        yield block.id;
        break;
      case "putnumber":
        if (thing) this.putNumber(thing);
        yield block.id;
        break;
      default:
        console.error("unknown block", block);
    }
    if (block.next) {
      yield* this.execute_block(block.next.block);
    }
  }

  // this.blocksを実行
  executeBlocks() {
    //console.log(this.blocks.blocks.blocks);
    this.commandGenerator = function* () {
      for (let i = 0; i < this.blocks.blocks.blocks.length; ++i)
        yield* this.execute_block(this.blocks.blocks.blocks[i]);
    }.bind(this)();
    if (!this.isRunning) this.isRunning = true;
  }

  count_block(block) {
    let count = 0;
    for (let k in block) {
      if (typeof block[k] === "object") {
        count += this.count_block(block[k]);
      } else if (k == "id") count += 1;
    }
    return count;
  }

  countBlocks() {
    if (!this.blocks || !this.blocks.blocks || !this.blocks.blocks.blocks)
      return null;
    let count = 0;
    for (let i = 0; i < this.blocks.blocks.blocks.length; ++i)
      count += this.count_block(this.blocks.blocks.blocks[i]);
    return count;
  }

  countBlocks2(blocks) {
    if (!blocks || !blocks.blocks || !blocks.blocks.blocks) return 0;
    let count = 0;
    for (let i = 0; i < blocks.blocks.blocks.length; ++i)
      count += this.count_block(blocks.blocks.blocks[i]);
    return count;
  }

  // サーバー上でクリアチェックをする
  run_check(blocks, steps) {
    this.blocks = blocks;
    this.preloadServer();
    this.resetRunningServer();
    this.executeBlocks();
    let result = "continue";
    while (
      this.isRunning &&
      result == "continue" &&
      this.steps <= steps &&
      !this.isGameOver
    ) {
      result = this.runCode(true);
    }
    return result == "clear" && this.steps == steps;
  }

  // mapdataにないブロックを使っていないかチェック
  checkblocks() {
    if (!this.mapData.blocks) return false;
    let blocklist;
    if (this.mapData.blocks.split) {
      blocklist = this.mapData.blocks.split(",");
    } else {
      blocklist = this.mapData.blocks;
    }
    function checkblock(block) {
      for (let k in block) {
        if (typeof block[k] === "object") {
          checkblock(block[k]);
        } else if (k == "type") {
          const blocktype = block[k];
          if (!blocklist.find((v) => v == blocktype)) {
            return false;
          }
        }
      }
      return true;
    }
    if (!this.blocks || !this.blocks.blocks || !this.blocks.blocks.blocks)
      return false;
    let count = 0;
    for (let i = 0; i < this.blocks.blocks.blocks.length; ++i)
      if (!checkblock(this.blocks.blocks.blocks[i])) return false;
    return true;
  }
}

module.exports = {
  SceneGame,
};
