import { mapData, clearBlocks, clearSteps } from "./test_play";
const crypto = require("crypto");

function cannotSendTwice() {
  const postStageState = document.getElementById("post-stage-state");
  postStageState.innerText = "投稿済みです。";
}

function addLocalStorage(stageId, deleteKey) {
  try {
    const s = localStorage.getItem("myStage");
    let stages = {};
    try {
      stages = JSON.parse(s) || {};
    } catch (e) {
      // console.log(e);
    }
    stages[stageId] = deleteKey;
    localStorage.setItem("myStage", JSON.stringify(stages));
  } catch (e) {
    // console.log(e);
  }
}

function send(stageName, userName, description) {
  const postStageState = document.getElementById("post-stage-state");
  const serverUrl = "http://localhost:3000/post_stage";
  const deleteKey = crypto.randomBytes(50).toString("hex");
  const deleteKeyHashed = crypto
    .createHash("sha256")
    .update(deleteKey)
    .digest()
    .toString("hex");

  //console.log(stage_name, user_name, description)
  let xhr = new XMLHttpRequest();
  xhr.open("POST", serverUrl, true);
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.state == "OK") {
            postStageState.innerText = "投稿完了！";
            const url = `./game_posted.html?stage=${res.filename}`;
            const shareURL = encodeURIComponent(
              `https://2022.eeic.jp/game_posted.html?stage=${res.filename}`
            );
            const tweet = encodeURIComponent(
              `eeicプログラミング教室　ステージ「${stageName}」を作成しました。`
            );
            document.getElementById("play-my-stage").setAttribute("href", url);
            document
              .getElementById("share-twitterA")
              .setAttribute(
                "href",
                `https://twitter.com/intent/tweet?url=${shareURL}&text=${tweet}&hashtags=近未来体験2022,eeic,五月祭`
              );
            document.getElementById("post-end").style.display = "block";
            addLocalStorage(res.filename, deleteKey);
          } else if (res.state == "double stage") {
            console.log(xhr.responseText);
            postStageState.innerText =
              "同一のステージがすでに投稿されています。";
          } else {
            console.log(xhr.responseText);
            postStageState.innerText = "エラー。正しく送信されませんでした。";
          }
        } catch (e) {
          // console.log(e);
          postStageState.innerText = "エラー。正しく送信されませんでした。";
        }
        document.getElementById("post-stage-post").onclick = cannotSendTwice;
      } else {
        postStageState.innerText =
          "サーバーに正しく通信できませんでした。もう一度投稿してみてください。";
      }
    }
  };
  const data = {
    stageName: stageName,
    userName: userName,
    description: description,
    mapData: mapData,
    blocks: clearBlocks,
    steps: clearSteps,
    deleteKey: deleteKeyHashed,
  };
  xhr.send(JSON.stringify(data));
  postStageState.innerText = "投稿中…";
  postStageState.style.display = "block";
}

function sendCheck() {
  const postStageError = document.getElementById("post-stage-error");

  const stageName = document.getElementById("input-stage-name").value;
  const userName = document.getElementById("input-user-name").value;
  const description = document.getElementById("input-description").value;

  if (!stageName) {
    postStageError.innerText = "ステージ名を入力してください。";
  } else if (!userName) {
    postStageError.innerText = "投稿者の名前を入力してください。";
  } else if (stageName.length > 50) {
    postStageError.innerText = "ステージ名が長すぎます。";
  } else if (userName.length > 50) {
    postStageError.innerText = "投稿者の名前が長すぎます。";
  } else if (description && description.length > 100) {
    postStageError.innerText = "説明が長すぎます。";
  } else {
    postStageError.style.display = "none";
    document.getElementById("post-stage-confirm-stage-name").innerText =
      stageName;
    document.getElementById("post-stage-confirm-user-name").innerText =
      userName;
    document.getElementById("post-stage-confirm-description").innerText =
      description;

    document.getElementById("post-stage-post").onclick = () => {
      send(stageName, userName, description);
    };
    document.getElementById("post-stage-back").onclick = () => {
      document.getElementById("post-stage-confirm").style.display = "none";
    };
    document.getElementById("post-stage-confirm").style.display = "block";
    return;
  }
  postStageError.style.display = "block";
}

document.getElementById("post-stage-check").onclick = sendCheck;
