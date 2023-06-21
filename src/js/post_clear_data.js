const postStageError = document.getElementById("postStageError");
const postStage_state = document.getElementById("postStage_state");
const postEnd = document.getElementById("postEnd");
const likeButton = document.getElementById("likeButton");

function cannotSendTwice() {
  postStage_state.innerText = "投稿済みです。";
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
  const serverurl = "http://localhost:3000/postcleardata";

  //console.log(stageId, blocks, steps, name);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", serverurl, true);
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        //console.log(xhr.responseText);
        if (xhr.responseText == "RECORD") {
          postStage_state.innerText = "投稿完了！\n新記録達成です";
        } else if (xhr.responseText == "OK") {
          postStage_state.innerText = "投稿完了！";
        } else {
          postStage_state.innerText = "エラー。正しく送信されませんでした。";
        }

        const shareURL = encodeURIComponent(
          `https://2022.eeic.jp/gamePosted.html?stage=${stageId}`
        );
        const tweet = encodeURIComponent(
          `eeicプログラミング教室　${submitter}さんのステージ「${stageName}」を${blockNum}ブロック、${steps}ステップでクリアしました。`
        );
        document
          .getElementById("shareTwitterA")
          .setAttribute(
            "href",
            `https://twitter.com/intent/tweet?url=${shareURL}&text=${tweet}&hashtags=近未来体験2022,eeic,五月祭`
          );
        postEnd.style.display = "block";
        document.getElementById("postDataButton").onclick = cannotSendTwice;
      } else {
        postStage_state.innerText =
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
  postStage_state.innerText = "投稿中…";
  postStage_state.style.display = "block";
}

function CheckPostData(stageId, blocks, steps, blockNum, stageName, submitter) {
  const user_name = document.getElementById("input_user_name").value;
  if (!user_name) {
    postStageError.innerText = "なまえを入力してください。";
  } else if (user_name.length > 50) {
    postStageError.innerText = "なまえが長すぎます。";
  } else {
    postStageError.style.display = "none";
    postData(stageId, blocks, steps, user_name, blockNum, stageName, submitter);
    return;
  }
  postStageError.style.display = "block";
}

function postLike(stageId) {
  const serverurl = "http://localhost:3000/postlike";
  likeButton.classList.add("posting");
  likeButton.innerText = "いいねを送信中";

  //console.log(stageId);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", serverurl, true);
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
  const postDataButton = document.getElementById("postDataButton");
  postDataButton.onclick = () => {
    CheckPostData(stageId, blocks, steps, blockNum, stageName, submitter);
  };
  const backToGameButton = document.getElementById("backToGameButton");
  const GameClearMenu = document.getElementById("GameClearMenu");
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
    postStage_state.innerText = "";
    postStage_state.style.display = "none";
    postEnd.style.display = "none";
  };
  GameClearMenu.style.display = "flex";
}
