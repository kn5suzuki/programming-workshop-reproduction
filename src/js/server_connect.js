import { mapData, clearBlocks, clearSteps } from "./test_play";
const crypto = require("crypto");

function cannotSendTwice() {
  const postStage_state = document.getElementById("postStage_state");
  postStage_state.innerText = "投稿済みです。";
}

function addLocalStorage(stageId, deleteKey) {
  try {
    const s = localStorage.getItem("mystage");
    let stages = {};
    try {
      stages = JSON.parse(s) || {};
    } catch (e) {
      // console.log(e);
    }
    stages[stageId] = deleteKey;
    localStorage.setItem("mystage", JSON.stringify(stages));
  } catch (e) {
    // console.log(e);
  }
}

function send(stage_name, user_name, description) {
  const postStage_state = document.getElementById("postStage_state");
  const serverurl = "http://localhost:3000/poststage";
  const deleteKey = crypto.randomBytes(50).toString("hex");
  const deleteKeyHashed = crypto
    .createHash("sha256")
    .update(deleteKey)
    .digest()
    .toString("hex");

  //console.log(stage_name, user_name, description)
  let xhr = new XMLHttpRequest();
  xhr.open("POST", serverurl, true);
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.state == "OK") {
            postStage_state.innerText = "投稿完了！";
            const url = `./gamePosted.html?stage=${res.filename}`;
            const shareURL = encodeURIComponent(
              `https://2022.eeic.jp/gamePosted.html?stage=${res.filename}`
            );
            const tweet = encodeURIComponent(
              `eeicプログラミング教室　ステージ「${stage_name}」を作成しました。`
            );
            document.getElementById("playMyStage").setAttribute("href", url);
            document
              .getElementById("shareTwitterA")
              .setAttribute(
                "href",
                `https://twitter.com/intent/tweet?url=${shareURL}&text=${tweet}&hashtags=近未来体験2022,eeic,五月祭`
              );
            document.getElementById("postEnd").style.display = "block";
            addLocalStorage(res.filename, deleteKey);
          } else if (res.state == "double stage") {
            console.log(xhr.responseText);
            postStage_state.innerText =
              "同一のステージがすでに投稿されています。";
          } else {
            console.log(xhr.responseText);
            postStage_state.innerText = "エラー。正しく送信されませんでした。";
          }
        } catch (e) {
          // console.log(e);
          postStage_state.innerText = "エラー。正しく送信されませんでした。";
        }
        document.getElementById("postStage_post").onclick = cannotSendTwice;
      } else {
        postStage_state.innerText =
          "サーバーに正しく通信できませんでした。もう一度投稿してみてください。";
      }
    }
  };
  const data = {
    stage_name: stage_name,
    user_name: user_name,
    description: description,
    mapData: mapData,
    blocks: clearBlocks,
    steps: clearSteps,
    deleteKey: deleteKeyHashed,
  };
  xhr.send(JSON.stringify(data));
  postStage_state.innerText = "投稿中…";
  postStage_state.style.display = "block";
}

function sendCheck() {
  const postStageError = document.getElementById("postStageError");

  const stage_name = document.getElementById("input_stage_name").value;
  const user_name = document.getElementById("input_user_name").value;
  const description = document.getElementById("input_description").value;

  if (!stage_name) {
    postStageError.innerText = "ステージ名を入力してください。";
  } else if (!user_name) {
    postStageError.innerText = "投稿者の名前を入力してください。";
  } else if (stage_name.length > 50) {
    postStageError.innerText = "ステージ名が長すぎます。";
  } else if (user_name.length > 50) {
    postStageError.innerText = "投稿者の名前が長すぎます。";
  } else if (description && description.length > 100) {
    postStageError.innerText = "説明が長すぎます。";
  } else {
    postStageError.style.display = "none";
    document.getElementById("postStageConfirm_stage_name").innerText =
      stage_name;
    document.getElementById("postStageConfirm_user_name").innerText = user_name;
    document.getElementById("postStageConfirm_description").innerText =
      description;

    document.getElementById("postStage_post").onclick = () => {
      send(stage_name, user_name, description);
    };
    document.getElementById("postStage_back").onclick = () => {
      document.getElementById("postStageConfirm").style.display = "none";
    };
    document.getElementById("postStageConfirm").style.display = "block";
    return;
  }
  postStageError.style.display = "block";
}

document.getElementById("postStage_check").onclick = sendCheck;
