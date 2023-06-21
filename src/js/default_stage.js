import "../scss/common.scss";
import "../scss/default_stage.scss";

let request = new XMLHttpRequest();
request.open("GET", "/defalt_stage_info");
request.responseType = "json";
request.send();
request.addEventListener("load", () => {
  const stageinfo = request.response;

  let localStorageUsable = 0;
  let clearlevels;
  try {
    // localStorageが使える場合のみ
    localStorageUsable = 1;
    let clearleveljson = localStorage.getItem("clearlevel");
    if (clearleveljson === null) {
      // 存在しない場合は生成する
      clearleveljson = new Object();
      for (let i = 0; i < stageinfo["stages"].length; i++) {
        clearleveljson[i] = -1;
      }
      clearleveljson = JSON.stringify(clearleveljson);
      localStorage.setItem("clearlevel", clearleveljson);
    }
    clearlevels = JSON.parse(clearleveljson);
  } catch (e) {
    localStorageUsable = 0;
    clearlevels = null;
    document
      .querySelector(".record-delete")
      .classList.add("record-delete-hide");
    // console.log(e);
  }

  stageinfo["stages"].forEach((stage, index) => {
    const containerelem = document.getElementById(stage["level"]);
    if (!containerelem) {
      console.log(stage);
      return;
    }
    const container = document.createElement("div");
    const buttoncontainer = document.createElement("div");
    const button = document.createElement("a");

    const commentarycontainer = document.createElement("div");
    const commentary = document.createElement("a");

    const description = document.createElement("p");

    buttoncontainer.setAttribute("class", "commentary-hide");
    button.setAttribute("href", `./game_default.html?stage=${index}`);
    button.innerText = "ステージ " + ("0" + index).slice(-2);
    // button.innerText = `ステージ${index}`;
    buttoncontainer.appendChild(button);

    commentarycontainer.setAttribute("class", "stage-select-hide");
    commentary.setAttribute(
      "href",
      `./default_stage/commentary/stage${index}.html`
    );
    // commentary.innerText = `ステージ${index}`;
    commentary.innerText = "ステージ " + ("0" + index).slice(-2);
    commentarycontainer.appendChild(commentary);

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
      container.setAttribute("class", `star${clearlevels[index] + 1}`);
    } catch (e) {
      // console.log(e);
    }

    container.appendChild(buttoncontainer);
    container.appendChild(commentarycontainer);
    container.appendChild(description);

    containerelem.appendChild(container);
  });

  try {
    let hardStage = 0;
    for (let i = 0; i < stageinfo["stages"].length; ++i) {
      if (stageinfo["stages"][i].level == "hard") {
        break;
      } else {
        hardStage++;
      }
    }
    for (let i = 0; i < hardStage; ++i) {
      if (clearlevels[i] == -1) {
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
    localStorage.removeItem("clearlevel");
    window.location.reload();
  }
});
