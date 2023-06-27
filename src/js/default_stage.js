import "../scss/common.scss";
import "../scss/default_stage.scss";

let request = new XMLHttpRequest();
const serverUrl = SERVER_URL + "/default_stage_info";
request.open("GET", serverUrl);
request.responseType = "json";
request.send();
request.addEventListener("load", () => {
  const stageInfo = request.response;

  let localStorageUsable = 0;
  let clearLevels;
  try {
    // localStorageが使える場合のみ
    localStorageUsable = 1;
    let clearLevelJson = localStorage.getItem("clearLevel");
    if (clearLevelJson === null) {
      // 存在しない場合は生成する
      clearLevelJson = new Object();
      for (let i = 0; i < stageInfo["stages"].length; i++) {
        clearLevelJson[i] = -1;
      }
      clearLevelJson = JSON.stringify(clearLevelJson);
      localStorage.setItem("clearLevel", clearLevelJson);
    }
    clearLevels = JSON.parse(clearLevelJson);
  } catch (e) {
    localStorageUsable = 0;
    clearLevels = null;
    document
      .querySelector(".record-delete")
      .classList.add("record-delete-hide");
    // console.log(e);
  }

  stageInfo["stages"].forEach((stage, index) => {
    const containerElement = document.getElementById(stage["level"]);
    if (!containerElement) {
      console.log(stage);
      return;
    }
    const container = document.createElement("div");
    const buttonContainer = document.createElement("div");
    const button = document.createElement("a");

    const commentaryContainer = document.createElement("div");
    const commentary = document.createElement("a");

    const description = document.createElement("p");

    buttonContainer.setAttribute("class", "commentary-hide");
    button.setAttribute("href", `./game_default.html?stage=${index}`);
    button.innerText = "ステージ " + ("0" + index).slice(-2);
    // button.innerText = `ステージ${index}`;
    buttonContainer.appendChild(button);

    commentaryContainer.setAttribute("class", "stage-select-hide");
    commentary.setAttribute("href", `./answer/stage${index}.html`);
    // commentary.innerText = `ステージ${index}`;
    commentary.innerText = "ステージ " + ("0" + index).slice(-2);
    commentaryContainer.appendChild(commentary);

    description.innerText = stage["description"];
    if (stage["restriction"]) {
      const a = document.createElement("a");
      a.setAttribute("href", stage["restriction"]);
      a.setAttribute("class", "restriction");
      a.innerText = "※制約";
      description.appendChild(a);
    }

    //  localStorageが使える場合のみ
    try {
      container.setAttribute("class", `star${clearLevels[index] + 1}`);
    } catch (e) {
      // console.log(e);
    }

    container.appendChild(buttonContainer);
    container.appendChild(commentaryContainer);
    container.appendChild(description);

    containerElement.appendChild(container);
  });

  try {
    let hardStage = 0;
    for (let i = 0; i < stageInfo["stages"].length; ++i) {
      if (stageInfo["stages"][i].level == "hard") {
        break;
      } else {
        hardStage++;
      }
    }
    for (let i = 0; i < hardStage; ++i) {
      if (clearLevels[i] == -1) {
        let hardDomain = document.getElementById("hard");
        hardDomain.classList.add("hidden");
        break;
      }
    }
  } catch (e) {
    // console.log(e);
  }
});

document.getElementById("tab1").addEventListener("click", () => {
  document.querySelector("body").classList = ["stage-select"];
});
document.getElementById("tab2").addEventListener("click", () => {
  document.querySelector("body").classList = ["commentary"];
});
document.getElementById("delete-btn").addEventListener("click", () => {
  const ans = window.confirm("クリアデータを削除します");
  if (ans) {
    localStorage.removeItem("clearLevel");
    window.location.reload();
  }
});
