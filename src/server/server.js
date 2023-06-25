import path from "path";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: "text/plain" }));
var jsonParser = bodyParser.json();

const { runCheck } = require("./run_check");
const crypto = require("crypto");

const WIDTH = 16;
const HEIGHT = 20;

const DefaultStagePath = "./default_stage/";
const PostStagePath = "./posted_stage/";

let stageHashSet = new Set();

function mapToDigest(map) {
  const tileName = {
    grass: "0",
    path: "1",
    key: "2",
    teleport1: "3",
    teleport2: "4",
    goalN: "5",
    goal: "6",
    rock: "7",
    stone: "8",
    wood: "9",
    num0: "a",
    num1: "b",
    num2: "c",
    num3: "d",
    num4: "e",
    num5: "f",
    num6: "g",
    num7: "h",
    num8: "i",
    num9: "j",
  };
  let digest = "";
  for (let y = 0; y < HEIGHT; ++y) {
    for (let x = 0; x < WIDTH; ++x) {
      const t = tileName[map[y][x].split(":")[0]];
      digest += t || "0";
    }
  }
  return digest;
}

function writeLog(stageId, body) {
  const date = "[" + new Date(Date.now()).toUTCString() + "] ";
  fs.appendFile(
    `./log/${stageId}.log`,
    date + JSON.stringify(body) + "\n",
    (e) => {
      if (e) console.log(e);
    }
  );
}

function makeId() {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 9; i++) {
    result += characters.charAt(Math.floor(Math.random() * 36));
  }
  return result;
}

app.listen(3000);

//サーバーとして利用
app.use(express.static(__dirname));

app.get("/default_stage_info", function (req, res) {
  // const json = require("../../default_stage/stage_info.json");
  const json = JSON.parse(
    fs.readFileSync(DefaultStagePath + "stage_info.json", "utf8")
  );
  res.send(json);
});

app.get("/default_stage", function (req, res) {
  const filename = req.query.filename; // パラメータ名に応じて取得
  // const json = require("../../default_stage/" + filename);
  const json = JSON.parse(fs.readFileSync(DefaultStagePath + filename, "utf8"));
  res.send(json);
});

app.get("/posted_stage_info", function (req, res) {
  // const json = require("../../posted_stage/stage_info.json");
  const json = JSON.parse(
    fs.readFileSync(PostStagePath + "stage_info.json", "utf8")
  );
  res.send(json);
});

app.get("/posted_stage", function (req, res) {
  const filename = req.query.filename; // パラメータ名に応じて取得
  // const json = require("../../posted_stage/" + filename);
  const json = JSON.parse(fs.readFileSync(PostStagePath + filename, "utf8"));
  res.send(json);
});

app.post("/post_stage", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // res.setHeader('Content-Type', 'text/plain');

  res.writeHead(200, { "Content-Type": "text" });
  // res.write("successfully uploaded");
  console.log("POST post_stage");
  const reqBody = JSON.parse(req.body);
  //console.log("data→", reqBody["mapData"])
  console.log("post_stage stage_name→", reqBody.stageName);
  console.log("post_stage user_name→", reqBody.userName);
  //console.log("blocks→", reqBody.blocks)

  // 同一のステージを連続してアップロードしていないかチェック
  const stageHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(reqBody.mapData))
    .digest()
    .toString("hex");
  if (stageHashSet.has(stageHash)) {
    console.log("post_stage double stage");
    res.write('{"state":"double stage"}');
    console.log(stageHashSet, stageHash);
    res.end("");
    return;
  }
  stageHashSet.add(stageHash);

  const Time = `${Date.now()}`;

  let stageId = makeId();
  function checkFile() {
    try {
      fs.statSync(stageId);
      return false;
    } catch (err) {
      return err.code === "ENOENT";
    }
  }
  while (!checkFile()) {
    stageId = makeId();
  }

  if (
    !reqBody.mapData ||
    !reqBody.stageName ||
    !reqBody.userName ||
    !reqBody.blocks ||
    reqBody.mapData.width != 16 ||
    reqBody.mapData.height != 20 ||
    !reqBody.mapData.map ||
    reqBody.mapData.map.length != 20 ||
    reqBody.mapData.playerX === undefined ||
    !(0 <= reqBody.mapData.playerX) ||
    !(WIDTH > reqBody.mapData.playerX) ||
    reqBody.mapData.playerY === undefined ||
    !(0 <= reqBody.mapData.playerY) ||
    !(HEIGHT > reqBody.mapData.playerY) ||
    !reqBody.mapData.blocks
  ) {
    console.log("post_stage ERROR1");
    res.write('{"state":"ERROR1"}');
    res.end("");
    writeLog(stageId, { type: "postStage", state: "ERROR1", req: reqBody });
    return;
  }

  let runChecker = new runCheck(reqBody.mapData, reqBody.blocks);
  let check = false;
  try {
    check = runChecker.check(reqBody.steps) && runChecker.checkBlocks();
  } catch (e) {
    console.log("post_stage", e);
    writeLog(stageId, {
      type: "postStage",
      state: "ERROR2_e",
      req: reqBody,
      e: e.toString(),
    });
    res.write(JSON.stringify({ state: "ERROR2_e" }));
    res.end("");
    return;
  }
  if (!check) {
    console.log("post_stage ERROR2");
    res.write('{"state":"ERROR2"}');
    res.end("");
    writeLog(stageId, { type: "postStage", state: "ERROR2", req: reqBody });
    return;
  }

  var pushStageInfo = {
    filename: stageId + ".json",
    name: reqBody.stageName || "",
    description: reqBody.description || "",
    submitter: reqBody.userName || "",
    clear: 0,
    date: Time,
    map: mapToDigest(reqBody.mapData.map),
  };

  let stageInfoJson = JSON.parse(
    fs.readFileSync(PostStagePath + "stage_info.json", "utf8")
  );
  stageInfoJson["stages"][stageId] = pushStageInfo;
  fs.writeFile(
    PostStagePath + "stage_info.json",
    JSON.stringify(stageInfoJson),
    (err) => {
      if (err) throw err;
      console.log("post_stage stageInfoJson 正常に書き込みが完了しました");
    }
  );

  let outputJson = reqBody.mapData;
  outputJson["name"] = reqBody.stageName;
  outputJson["submitter"] = reqBody.userName;
  outputJson["description"] = reqBody.description;
  fs.writeFile(
    PostStagePath + stageId + ".json",
    JSON.stringify(outputJson),
    (err) => {
      if (err) throw err;
      console.log("post_stage outputJson 正常に書き込みが完了しました");
    }
  );

  if (reqBody.deleteKey) {
    let deleteKeys = JSON.parse(
      fs.readFileSync("./log/delete_keys.json", "utf8")
    );
    deleteKeys[stageId] = reqBody.deleteKey;
    fs.writeFile(
      "./log/delete_keys.json",
      JSON.stringify(deleteKeys),
      (err) => {
        if (err) throw err;
        console.log("post_stage deleteKeys 正常に書き込みが完了しました");
      }
    );
  }
  let result = {
    state: "OK",
    filename: stageId,
  };
  res.write(JSON.stringify(result));
  res.end("");
  writeLog(stageId, { type: "postStage", state: "OK", req: reqBody });
});

app.options("/post_stage", function (req, res) {
  console.log("OPTIONS postStage");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  res.writeHead(200, { "Content-Type": "text" });
  res.end("");
  //console.log(req.body)
});

app.post("/post_clear_data", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // res.setHeader('Content-Type', 'text/plain');

  res.writeHead(200, { "Content-Type": "text" });
  // res.write("successfully uploaded");
  console.log("POST post_clear_data");
  const reqBody = JSON.parse(req.body);
  console.log("post_clear_data stageId→", reqBody.stageId);
  //console.log("blocks→", reqBody.blocks)
  console.log("post_clear_data steps→", reqBody.steps);
  console.log("post_clear_data name→", reqBody.name);

  if (
    !reqBody.stageId ||
    !reqBody.blocks ||
    !reqBody.blocks.blocks ||
    !reqBody.steps ||
    reqBody.steps < 0 ||
    reqBody.steps > 10000000
  ) {
    console.log("post_clear_data ERROR1");
    res.write("ERROR1");
    res.end("");
    writeLog(reqBody.stageId, {
      type: "postClearData",
      state: "ERROR1",
      req: reqBody,
    });
    return;
  }

  const mapData = JSON.parse(
    fs.readFileSync(PostStagePath + reqBody.stageId + ".json", "utf8")
  );

  let runChecker = new runCheck(mapData, reqBody.blocks);
  let check = false;
  try {
    check = runChecker.check(reqBody.steps) && runChecker.checkBlocks();
  } catch (e) {
    console.log("post_clear_data", e);
    writeLog(reqBody.stageId, {
      type: "postClearData",
      state: "ERROR2_e",
      req: reqBody,
      e: e.toString(),
    });
    res.write("ERROR2e");
    res.end("");
    return;
  }
  const blockNum = runChecker.getBlockNum();
  if (!check) {
    console.log("post_clear_data ERROR2");
    res.write("ERROR2");
    res.end("");
    writeLog(reqBody.stageId, {
      type: "postClearData",
      state: "ERROR2",
      req: reqBody,
    });
    return;
  }

  let stageInfoJson = JSON.parse(
    fs.readFileSync(PostStagePath + "stage_info.json", "utf8")
  );
  let stage = stageInfoJson["stages"][reqBody.stageId];
  let recorded = false;
  if (!stage.shortest || stage.shortest.blocks > blockNum) {
    stage.shortest = {
      name: reqBody.name || "",
      blocks: blockNum,
      steps: reqBody.steps,
      clear: 1,
    };
    recorded = true;
  } else if (
    stage.shortest.blocks == blockNum &&
    stage.shortest.steps == reqBody.steps
  ) {
    stage.shortest.clear = (stage.shortest.clear || 0) + 1;
  }
  if (!stage.fastest || stage.fastest.steps > reqBody.steps) {
    stage.fastest = {
      name: reqBody.name || "",
      blocks: blockNum,
      steps: reqBody.steps,
      clear: 1,
    };
    recorded = true;
  } else if (
    stage.fastest.steps == reqBody.steps &&
    stage.fastest.blocks == blockNum
  ) {
    stage.fastest.clear = (stage.fastest.clear || 0) + 1;
  }
  stage.clear = (stage.clear || 0) + 1;
  stageInfoJson["stages"][reqBody.stageId] = stage;
  fs.writeFile(
    PostStagePath + "stage_info.json",
    JSON.stringify(stageInfoJson),
    (err) => {
      if (err) throw err;
      console.log("post_clear_data stageInfoJson 正常に書き込みが完了しました");
    }
  );

  if (recorded) {
    res.write("RECORD");
  } else {
    res.write("OK");
  }
  writeLog(reqBody.stageId, {
    type: "postClearData",
    state: "OK",
    req: reqBody,
    blocks: blockNum,
    steps: reqBody.steps,
  });
  res.end("");
});

app.options("/post_clear_data", function (req, res) {
  console.log("OPTIONS post_clear_data");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  res.writeHead(200, { "Content-Type": "text" });
  res.end("");
  //console.log(req.body)
});

app.post("/post_like", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // res.setHeader('Content-Type', 'text/plain');

  res.writeHead(200, { "Content-Type": "text" });
  // res.write("successfully uploaded");
  console.log("POST post_like");
  const reqBody = JSON.parse(req.body);
  console.log("post_like stageId→", reqBody.stageId);

  if (!reqBody.stageId) {
    console.log("post_like ERROR1");
    res.write("ERROR1");
    res.end("");
    writeLog(reqBody.stageId, {
      type: "postLike",
      state: "ERROR1",
      req: reqBody,
    });
    return;
  }

  let stageInfoJson = JSON.parse(
    fs.readFileSync(PostStagePath + "stage_info.json", "utf8")
  );
  let stage = stageInfoJson["stages"][reqBody.stageId];
  stage.like = (stage.like || 0) + 1;
  stageInfoJson["stages"][reqBody.stageId] = stage;
  fs.writeFile(
    PostStagePath + "stage_info.json",
    JSON.stringify(stageInfoJson),
    (err) => {
      if (err) throw err;
      console.log("post_like stageInfoJson 正常に書き込みが完了しました");
    }
  );
  res.write("OK");
  res.end("");
  writeLog(reqBody.stageId, { type: "postLike", state: "OK", req: reqBody });
});
app.options("/post_like", function (req, res) {
  console.log("OPTIONS post_like");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  res.writeHead(200, { "Content-Type": "text" });
  res.end("");
  //console.log(req.body)
});

app.post("/delete_stage", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // res.setHeader('Content-Type', 'text/plain');

  res.writeHead(200, { "Content-Type": "text" });
  // res.write("successfully uploaded");
  console.log("POST delete_stage");
  const reqBody = JSON.parse(req.body);
  console.log("delete_stage stageId→", reqBody.stageId);
  console.log("delete_stage deleteKey→", reqBody.deleteKey);

  if (!reqBody.stageId || !reqBody.deleteKey) {
    console.log("delete_stage ERROR1");
    res.write("ERROR1");
    res.end("");
    writeLog(reqBody.stageId, {
      type: "deleteStage",
      state: "ERROR1",
      req: reqBody,
    });
    return;
  }

  const deleteKeys = JSON.parse(
    fs.readFileSync("./log/delete_keys.json", "utf8")
  );
  const hashedKey = crypto
    .createHash("sha256")
    .update(reqBody.deleteKey)
    .digest()
    .toString("hex");
  if (deleteKeys[reqBody.stageId] != hashedKey) {
    console.log("deleteStage ERROR2");
    res.write("ERROR2");
    res.end("");
    writeLog(reqBody.stageId, {
      type: "deleteStage",
      state: "ERROR2",
      req: reqBody,
    });
    return;
  }

  const outputJson = { deleted: 1 };
  fs.writeFile(
    PostStagePath + reqBody.stageId + ".json",
    JSON.stringify(outputJson),
    (err) => {
      if (err) throw err;
      console.log("delete_stage outputJson 正常に書き込みが完了しました");
    }
  );

  let stageInfoJson = JSON.parse(
    fs.readFileSync(PostStagePath + "stage_info.json", "utf8")
  );
  stageInfoJson["stages"][reqBody.stageId] = { deleted: 1 };
  fs.writeFile(
    PostStagePath + "stage_info.json",
    JSON.stringify(stageInfoJson),
    (err) => {
      if (err) throw err;
      console.log("delete_stage stageInfoJson 正常に書き込みが完了しました");
    }
  );
  res.write("OK");
  res.end("");
  writeLog(reqBody.stageId, { type: "deleteStage", state: "OK", req: reqBody });
});
app.options("/delete_stage", function (req, res) {
  console.log("OPTIONS delete_stage");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  res.writeHead(200, { "Content-Type": "text" });
  res.end("");
  //console.log(req.body)
});
