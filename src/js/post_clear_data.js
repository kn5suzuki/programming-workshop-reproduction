const postStageError = document.getElementById("post-stage-error");
const postStageState = document.getElementById("post-stage-state");
const postEnd = document.getElementById("post-end");
const likeButton = document.getElementById("like-button");

function cannotSendTwice() {
  postStageState.innerText = "投稿済みです。";
}

function postData(
  stageId,
  blocks,
  steps,
  name,
  blockNum,
  stageName,
  submitter
) {
  const serverUrl = "http://localhost:3000/post_clear_data";

  //console.log(stageId, blocks, steps, name);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", serverUrl, true);
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        if (xhr.responseText == "RECORD") {
          postStageState.innerText = "投稿完了！\n新記録達成です";
        } else if (xhr.responseText == "OK") {
          postStageState.innerText = "投稿完了！";
        } else {
          postStageState.innerText = "エラー。正しく送信されませんでした。";
        }

        const shareURL = encodeURIComponent(
          `https://2022.eeic.jp/game_posted.html?stage=${stageId}`
        );
        const tweet = encodeURIComponent(
          `eeicプログラミング教室　${submitter}さんのステージ「${stageName}」を${blockNum}ブロック、${steps}ステップでクリアしました。`
        );
        document
          .getElementById("share-twitterA")
          .setAttribute(
            "href",
            `https://twitter.com/intent/tweet?url=${shareURL}&text=${tweet}&hashtags=近未来体験2022,eeic,五月祭`
          );
        postEnd.style.display = "block";
        document.getElementById("post-data-button").onclick = cannotSendTwice;
      } else {
        postStageState.innerText =
          "サーバーに正しく通信できませんでした。もう一度投稿してみてください。";
      }
    }
  };
  const data = {
    stageId: stageId,
    blocks: blocks,
    steps: steps,
    name: name,
  };
  xhr.send(JSON.stringify(data));
  postStageState.innerText = "投稿中…";
  postStageState.style.display = "block";
}

function CheckPostData(stageId, blocks, steps, blockNum, stageName, submitter) {
  const userName = document.getElementById("input-user-name").value;
  if (!userName) {
    postStageError.innerText = "なまえを入力してください。";
  } else if (userName.length > 50) {
    postStageError.innerText = "なまえが長すぎます。";
  } else {
    postStageError.style.display = "none";
    postData(stageId, blocks, steps, userName, blockNum, stageName, submitter);
    return;
  }
  postStageError.style.display = "block";
}

function postLike(stageId) {
  const serverUrl = "http://localhost:3000/postlike";
  likeButton.classList.add("posting");
  likeButton.innerText = "いいねを送信中";

  //console.log(stageId);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", serverUrl, true);
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        if (xhr.responseText == "OK") {
          likeButton.classList.add("posted");
          likeButton.innerText = "いいね";
          try {
            const likeData = localStorage.getItem("like");
            if (!likeData) {
              localStorage.setItem("like", stageId);
            }
            localStorage.setItem("like", likeData + `,${stageId}`);
          } catch (e) {
            // console.log(e);
          }
        }
      }
    }
  };
  const data = {
    stageId: stageId,
  };
  xhr.send(JSON.stringify(data));
}

function checkLike(stageId) {
  try {
    const like = localStorage.getItem("like").split(",");
    if (like.find((v) => v == stageId)) return true;
    return false;
  } catch (e) {
    // console.log(e);
  }
  return false;
}

export function ClearPostedStage(
  stageId,
  blocks,
  steps,
  blockNum,
  stageName,
  submitter
) {
  const detail = document.getElementById("detail");
  detail.innerText = `${blockNum}ブロック、${steps}ステップでクリアしました。`;
  const postDataButton = document.getElementById("post-data-button");
  postDataButton.onclick = () => {
    CheckPostData(stageId, blocks, steps, blockNum, stageName, submitter);
  };
  const backToGameButton = document.getElementById("back-to-game-button");
  const GameClearMenu = document.getElementById("game-clear-menu");
  if (checkLike(stageId)) {
    likeButton.classList.add("posting");
    likeButton.classList.add("posted");
    likeButton.innerText = "いいね";
  }
  if (!likeButton.classList.contains("posting")) {
    likeButton.onclick = () => {
      likeButton.onclick = () => {};
      postLike(stageId);
    };
  }
  backToGameButton.onclick = () => {
    detail.innerText = "";
    postDataButton.onclick = () => {};
    GameClearMenu.style.display = "none";
    postStageError.style.display = "none";
    postStageState.innerText = "";
    postStageState.style.display = "none";
    postEnd.style.display = "none";
  };
  GameClearMenu.style.display = "flex";
}
