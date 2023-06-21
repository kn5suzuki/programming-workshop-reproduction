import "../scss/common.scss";
import "../scss/posted_stage.scss";

const imgUrl = require("../img/game/tileset.png");
let myStageIds = new Object();
try {
  const s = localStorage.getItem("myStage");
  if (s) myStageIds = JSON.parse(s) || {};
} catch (e) {
  // console.log(e);
}

if (!myStageIds || Object.keys(myStageIds).length == 0) {
  document.getElementById("no-stage").style.display = "block";
  document.getElementById("main").style.display = "none";
}

let request = new XMLHttpRequest();
request.open("GET", "/posted_stage_info");
request.responseType = "json";
request.send();

request.addEventListener("load", () => {
  const img = new Image();
  img.src = imgUrl;
  img.addEventListener("load", () => {
    let cons = new Array(6);

    for (let i = 0; i < 6; ++i) {
      cons[i] = {
        a: document.createElement("div"),
        aLink: document.createElement("a"),
        container: document.createElement("div"),
        name: document.createElement("div"),
        imgAndDesc: document.createElement("div"),
        thumbnail: document.createElement("div"),
        thumbnailImg: document.createElement("canvas"),
        descAndSubmit: document.createElement("div"),
        description: document.createElement("div"),
        submitter: document.createElement("div"),
        detail: document.createElement("div"),
        shortest: document.createElement("div"),
        fastest: document.createElement("div"),
        clear: document.createElement("div"),
        like: document.createElement("div"),
        clearAndLike: document.createElement("div"),
        deleteButton: document.createElement("div"),
        context: undefined,
      };
      const containerElement = document.getElementById("container");
      cons[i].imgAndDesc.classList.add("imgAndDesc");
      cons[i].thumbnail.classList.add("thumbnail");
      cons[i].thumbnailImg.setAttribute("width", "480");
      cons[i].thumbnailImg.setAttribute("height", "640");
      cons[i].context = cons[i].thumbnailImg.getContext("2d");
      cons[i].imgAndDesc.appendChild(cons[i].thumbnail);
      cons[i].thumbnail.appendChild(cons[i].thumbnailImg);
      cons[i].descAndSubmit.classList.add("descAndSubmit");
      cons[i].imgAndDesc.appendChild(cons[i].descAndSubmit);
      cons[i].deleteButton.classList.add("deleteButton");
      cons[i].deleteButton.id = `deleteButton${i}`;
      cons[i].deleteButton.innerHTML = `<div>削除する</div>`;
      cons[i].deleteButton.onclick = () => {};
      cons[i].descAndSubmit.appendChild(cons[i].deleteButton);
      cons[i].name.classList.add("name");
      cons[i].descAndSubmit.appendChild(cons[i].name);
      cons[i].submitter.classList.add("submitter");
      cons[i].descAndSubmit.appendChild(cons[i].submitter);
      cons[i].description.classList.add("description");
      cons[i].descAndSubmit.appendChild(cons[i].description);
      cons[i].container.appendChild(cons[i].imgAndDesc);
      cons[i].detail.classList.add("detail");
      cons[i].shortest.classList.add("shortest");
      cons[i].detail.appendChild(cons[i].shortest);
      cons[i].fastest.classList.add("fastest");
      cons[i].detail.appendChild(cons[i].fastest);
      cons[i].clearAndLike.classList.add("clearAndLike");
      cons[i].detail.appendChild(cons[i].clearAndLike);
      cons[i].clear.classList.add("clear");
      cons[i].clearAndLike.appendChild(cons[i].clear);
      cons[i].like.classList.add("like");
      cons[i].clearAndLike.appendChild(cons[i].like);
      cons[i].container.appendChild(cons[i].detail);
      cons[i].a.appendChild(cons[i].container);
      cons[i].a.classList.add("a");
      cons[i].a.appendChild(cons[i].aLink);
      containerElement.appendChild(cons[i].a);
    }

    function drawStage(context, map) {
      const sn = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        a: 10,
        b: 11,
        c: 12,
        d: 13,
        e: 14,
        f: 15,
        g: 16,
        h: 17,
        i: 18,
        j: 19,
      };
      for (let y = 0; y < 20; ++y) {
        for (let x = 0; x < 16; ++x) {
          const i =
            map[y * 16 + x] && sn[map[y * 16 + x]] ? sn[map[y * 16 + x]] : 0;
          const ix = i % 10;
          const iy = Math.floor(i / 10);
          context.drawImage(
            img,
            ix * 30,
            iy * 30,
            30,
            30,
            x * 30,
            y * 30,
            30,
            30
          );
        }
      }
    }

    function update(i, stage, index) {
      console.log(i, stage, index);
      if (!stage) {
        cons[i].a.style.display = "none";
        return;
      }
      cons[i].a.style.display = "block";
      cons[i].aLink.setAttribute("href", `./game_posted.html?stage=${index}`);
      if (stage["name"]) cons[i].name.innerText = stage["name"];
      else cons[i].name.innerText = "名無しステージ";
      //thumbnailImg.setAttribute("src", stage["thumbnail"]);
      drawStage(cons[i].context, stage["map"]);
      if (stage["description"])
        cons[i].description.innerText = stage["description"];
      else cons[i].description.innerText = "";

      if (stage["submitter"]) cons[i].submitter.innerText = stage["submitter"];
      else cons[i].submitter.innerText = "";

      function shortestStr(d, c) {
        let s = d + "：";
        if (!c || !c.blocks || !c.steps) s += "クリアなし";
        else {
          s += `${c.blocks}ブロック・${c.steps}ステップ`;
          if (c.name) {
            s += "（" + c.name;
            if (c.clear && c.clear > 1) s += `、他 ${c.clear - 1}人`;
            s += "）";
          } else if (c.clear) {
            s += `（${c.clear - 1}人）`;
          }
        }
        return s;
      }

      cons[i].shortest.innerText = shortestStr("最短コード", stage["shortest"]);
      cons[i].fastest.innerText = shortestStr("最速コード", stage["fastest"]);
      if (stage["clear"])
        cons[i].clear.innerText = "クリア " + stage["clear"] + "人";
      else cons[i].clear.innerText = "クリア " + "0人";
      if (stage["like"]) cons[i].like.innerText = "" + stage["like"];
      else cons[i].like.innerText = "" + "0";

      function checkLiked() {
        try {
          const like = localStorage.getItem("like");
          if (!like) return false;
          if (like.split(",").find((v) => v == index)) return true;
          return false;
        } catch (e) {
          // console.log(e);
        }
        return false;
      }

      if (checkLiked()) cons[i].like.classList.add("liked");
      else cons[i].like.classList.remove("liked");

      cons[i].deleteButton.onclick = () => {
        deleteStage(index, stage["name"]);
      };
    }
    let stages = new Array();
    const stageInfo = request.response;
    Object.keys(stageInfo["stages"]).forEach((index) => {
      if (
        myStageIds.hasOwnProperty(index) &&
        !stageInfo["stages"][index].deleted
      )
        stages.push({ index: index, stage: stageInfo["stages"][index] });
    });
    const count = stages.length;

    if (count == 0) {
      document.getElementById("no-stage").style.display = "block";
      document.getElementById("main").style.display = "none";
    }
    let randomOrder = new Array(count);
    let postOrder = new Array(count);
    let clearOrder = new Array(count);
    let likeOrder = new Array(count);
    for (let i = 0; i < count; ++i) {
      randomOrder[i] = i;
      postOrder[i] = i;
      clearOrder[i] = i;
      likeOrder[i] = i;
    }
    // ランダム並び替え
    for (let i = count; i > 1; --i) {
      let a = i - 1;
      let b = Math.floor(Math.random() * i);
      let u = randomOrder[a];
      randomOrder[a] = randomOrder[b];
      randomOrder[b] = u;
    }
    clearOrder.sort(
      (a, b) => stages[a].stage["clear"] - stages[b].stage["clear"]
    );
    postOrder.sort((a, b) => stages[a].stage["date"] - stages[b].stage["date"]);
    likeOrder.sort(
      (a, b) => -(stages[a].stage["like"] || 0) + (stages[b].stage["like"] || 0)
    );

    let order = randomOrder;

    const pageNum = Math.ceil(count / 6);
    let page = 0;
    const toPrev = document.getElementById("to-prev");
    const toNext = document.getElementById("to-next");
    function updatePage() {
      toPrev.classList.add("enable");
      toNext.classList.add("enable");
      if (page <= 0) {
        page = 0;
        toPrev.classList.remove("enable");
      }
      if (page >= pageNum - 1) {
        page = pageNum - 1;
        toNext.classList.remove("enable");
      }
      if (page <= 0) {
        page = 0;
        toPrev.classList.remove("enable");
      }
      for (let i = 0; i < 6; ++i) {
        const stage = stages[order[page * 6 + i]];
        if (stage) {
          update(i, stage.stage, stage.index);
        } else {
          update(i, null, null);
        }
      }
      const toNextPage = document.getElementById("to-next-page");
      toNextPage.innerText = `${page + 1}/${pageNum}`;
    }
    toPrev.addEventListener("click", () => {
      page -= 1;
      updatePage();
    });
    toNext.addEventListener("click", () => {
      page += 1;
      updatePage();
    });
    updatePage();
    const orderElem = document.getElementById("order");
    orderElem.addEventListener("change", () => {
      const i = orderElem.selectedIndex;
      if (i == 0) {
        for (let i = count; i > 1; --i) {
          let a = i - 1;
          let b = Math.floor(Math.random() * i);
          let u = randomOrder[a];
          randomOrder[a] = randomOrder[b];
          randomOrder[b] = u;
        }
        order = randomOrder;
      } else if (i == 1) {
        order = postOrder;
      } else if (i == 2) {
        order = postOrder.slice(0, postOrder.length);
        order.reverse();
      } else if (i == 3) {
        order = clearOrder.slice(0, clearOrder.length);
        order.reverse();
      } else if (i == 4) {
        order = clearOrder;
      } else if (i == 5) {
        order = likeOrder;
      }
      updatePage();
    });

    function deleteStage(deleteId, deleteTitle) {
      if (confirm(`「${deleteTitle}」を削除します。`)) {
      } else {
        return;
      }
      try {
        const deleteStageURL = "./delete_stage";
        let request = new XMLHttpRequest();
        request.open("POST", deleteStageURL, true);
        request.setRequestHeader("Content-type", "text/plain");
        const deleteData = {
          stageId: deleteId,
          deleteKey: myStageIds[deleteId],
        };

        request.onreadystatechange = () => {
          if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
              location.reload();
            }
          }
        };
        request.send(JSON.stringify(deleteData));
      } catch (e) {
        // console.log(e);
      }
    }
  });
});
