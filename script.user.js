// ==UserScript==
// @name         Overlay SquidCoder (multi-chunk)
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  Overlay por tiles com suporte a atravessar múltiplos chunks
// @author       Víkish
// @match        https://wplace.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=partidomissao.com
// @license      MIT
// @grant        none
// ==/UserScript==

(async function () {
'use strict';

const CHUNK_WIDTH = 1000;
const CHUNK_HEIGHT = 1000;

const OVERLAY_MODES = ["overlay", "original", "chunks"];
let overlayMode = OVERLAY_MODES[0];

// ======================== UI ========================
const counterContainer = document.createElement("div");
counterContainer.id = "pixel-counter";
Object.assign(counterContainer.style, {
  position: "fixed", top: "5px", left: "50%", transform: "translateX(-50%)",
  zIndex: "10000", padding: "6px 10px", fontSize: "12px",
  fontFamily: "Arial, sans-serif", backgroundColor: "rgba(0,0,0,0.66)",
  color: "white", borderRadius: "6px", pointerEvents: "none",
  backdropFilter: "blur(3px)", lineHeight: "1.25", textAlign: "center"
});
document.body.appendChild(counterContainer);

const pixelCounter = document.createElement("div");
pixelCounter.textContent = "Pixeis restantes: 0";
counterContainer.appendChild(pixelCounter);

const percentageCounter = document.createElement("div");
percentageCounter.textContent = "Progresso atual: 0,00%";
counterContainer.appendChild(percentageCounter);

const colorStatsContainer = document.createElement("div");
Object.assign(colorStatsContainer.style, {
  position: "fixed", top: "170px", left: "10px",
  backgroundColor: "rgba(0,0,0,0.8)", color: "white",
  fontSize: "11px", padding: "6px", borderRadius: "8px",
  zIndex: "10000", maxHeight: "320px", overflowY: "auto",
  minWidth: "25px", maxWidth: "150px", boxSizing: "border-box"
});
const toggleButton = document.createElement("div");
toggleButton.textContent = "↑";
Object.assign(toggleButton.style, {
  cursor: "pointer", textAlign: "center", marginBottom: "6px",
  fontSize: "14px", userSelect: "none", pointerEvents: "auto"
});
const colorList = document.createElement("div");
colorList.style.display = "block";
colorStatsContainer.appendChild(toggleButton);
colorStatsContainer.appendChild(colorList);
document.body.appendChild(colorStatsContainer);

let listVisible = true;
toggleButton.addEventListener("click", () => {
  listVisible = !listVisible;
  colorList.style.display = listVisible ? "block" : "none";
  toggleButton.textContent = listVisible ? "↑" : "↓";
});

// ======================== HELPERS ========================
function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ img, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

function parseTileXY(pathname) {
  // /files/<x>/<y>.png
  const parts = pathname.split("/");
  const x = parseInt(parts.at(-2), 10);
  const y = parseInt(parts.at(-1).split(".")[0], 10);
  return [x, y];
}

// Monta ImageData combinando TODAS as entradas desse tile
function buildOverlayDataForTile(entries, tileW, tileH) {
  const c = new OffscreenCanvas(tileW, tileH);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  for (const e of entries) {
    const dx = Math.round(e.dx);
    const dy = Math.round(e.dy);

    const sx = dx < 0 ? -dx : 0;
    const sy = dy < 0 ? -dy : 0;

    const dstX = Math.max(0, dx);
    const dstY = Math.max(0, dy);

    const dw = Math.min(e.imgW - sx, tileW - dstX);
    const dh = Math.min(e.imgH - sy, tileH - dstY);

    if (dw > 0 && dh > 0) {
      ctx.drawImage(e.img, sx, sy, dw, dh, dstX, dstY, dw, dh);
    }
  }

  return ctx.getImageData(0, 0, tileH, tileW); // <- errado? cuidado com ordem
}

// CORREÇÃO: ordem correta (w,h)
function buildOverlayDataForTileFixed(entries, tileW, tileH) {
  const c = new OffscreenCanvas(tileW, tileH);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  for (const e of entries) {
    const dx = Math.round(e.dx);
    const dy = Math.round(e.dy);

    const sx = dx < 0 ? -dx : 0;
    const sy = dy < 0 ? -dy : 0;

    const dstX = Math.max(0, dx);
    const dstY = Math.max(0, dy);

    const dw = Math.min(e.imgW - sx, tileW - dstX);
    const dh = Math.min(e.imgH - sy, tileH - dstY);

    if (dw > 0 && dh > 0) {
      ctx.drawImage(e.img, sx, sy, dw, dh, dstX, dstY, dw, dh);
    }
  }

  return ctx.getImageData(0, 0, tileW, tileH);
}

// ======================== CARREGA E INDEXA OVERLAYS ========================
const overlays = await fetchData();
// cada obj do JSON deve ter: { chunk:[cx,cy], coords:[ox,oy], url: "..." }
for (const obj of overlays) {
  const { img, width, height } = await loadImage(obj.url);
  obj.img = img;
  obj.imgW = width;
  obj.imgH = height;
}

// Index por tile: key "x/y" => [ {img,imgW,imgH, dx,dy} ... ]
const overlayIndex = indexOverlays(overlays);

function indexOverlays(list) {
  const map = new Map();
  for (const obj of list) {
    const baseCx = obj.chunk[0];
    const baseCy = obj.chunk[1];

    // coordenadas GLOBAIS do overlay (em pixels do plano total)
    const globalX = baseCx * CHUNK_WIDTH  + obj.coords[0];
    const globalY = baseCy * CHUNK_HEIGHT + obj.coords[1];

    const minTileX = Math.floor(globalX / CHUNK_WIDTH);
    const minTileY = Math.floor(globalY / CHUNK_HEIGHT);
    const maxTileX = Math.floor((globalX + obj.imgW - 1) / CHUNK_WIDTH);
    const maxTileY = Math.floor((globalY + obj.imgH - 1) / CHUNK_HEIGHT);

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const key = `${tx}/${ty}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push({
          img: obj.img,
          imgW: obj.imgW,
          imgH: obj.imgH,
          // deslocamento relativo ao canto do tile (pode ser negativo ou >0)
          dx: globalX - tx * CHUNK_WIDTH,
          dy: globalY - ty * CHUNK_HEIGHT
        });
      }
    }
  }
  return map;
}

// ======================== FETCH INTERCEPT ========================
fetch = new Proxy(fetch, {
  apply: async (target, thisArg, argList) => {
    const urlString = typeof argList[0] === "object" ? argList[0].url : argList[0];
    let url;
    try { url = new URL(urlString); } catch { throw new Error("Invalid URL provided to fetch"); }

    // ---- modo overlay/diff com suporte multi-chunk
    if (overlayMode === "overlay") {
      if (url.hostname === "backend.wplace.live" && url.pathname.startsWith("/files/")) {
        const [tileX, tileY] = parseTileXY(url.pathname);
        const key = `${tileX}/${tileY}`;
        const entries = overlayIndex.get(key);

        if (!entries || entries.length === 0) {
          // nenhum overlay atinge esse tile -> passa direto
          return target.apply(thisArg, argList);
        }

        const originalResponse = await target.apply(thisArg, argList);
        const originalBlob = await originalResponse.blob();
        const originalImage = await blobToImage(originalBlob);

        const width = originalImage.width;
        const height = originalImage.height;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(originalImage, 0, 0, width, height);
        const originalData = ctx.getImageData(0, 0, width, height);
        const resultData = ctx.getImageData(0, 0, width, height);

        const overlayData = buildOverlayDataForTileFixed(entries, width, height);

        const d1 = originalData.data;
        const d2 = overlayData.data;
        const dr = resultData.data;

        let wrongPixels = 0;
        let totalTargetPixels = 0;
        const localColorCount = {};

        for (let i = 0; i < d1.length; i += 4) {
          const isTransparent = d2[i + 3] === 0;
          if (!isTransparent) totalTargetPixels++;

          const samePixel =
            d1[i] === d2[i] &&
            d1[i + 1] === d2[i + 1] &&
            d1[i + 2] === d2[i + 2] &&
            d1[i + 3] === d2[i + 3];

          if (!samePixel && !isTransparent) {
            wrongPixels++;
            const keyC = `${d2[i]},${d2[i + 1]},${d2[i + 2]}`;
            localColorCount[keyC] = (localColorCount[keyC] || 0) + 1;
          }

          if (samePixel && !isTransparent) {
            dr[i] = 0; dr[i + 1] = 255; dr[i + 2] = 0; dr[i + 3] = 255; // verde ok
          } else if (!isTransparent) {
            dr[i] = d2[i]; dr[i + 1] = d2[i + 1]; dr[i + 2] = d2[i + 2]; dr[i + 3] = d2[i + 3];
          }
        }

        // contadores
        pixelCounter.textContent = `Pixeis restantes: ${wrongPixels}`;
        const percentage = totalTargetPixels === 0
          ? "100,00"
          : (((totalTargetPixels - wrongPixels) / totalTargetPixels) * 100).toFixed(2).replace(".", ",");
        percentageCounter.textContent = `Progresso atual: ${percentage}%`;

        // lista de cores
        colorList.innerHTML = "";
        const sorted = Object.entries(localColorCount)
          .filter(([, cnt]) => cnt > 0)
          .sort((a, b) => b[1] - a[1]);
        for (const [keyC, count] of sorted) {
          const [r, g, b] = keyC.split(",").map(Number);
          const item = document.createElement("div");
          item.style.display = "flex";
          item.style.alignItems = "center";
          item.style.marginBottom = "4px";
          item.style.pointerEvents = "none";

          const colorSquare = document.createElement("div");
          colorSquare.style.width = "12px";
          colorSquare.style.height = "12px";
          colorSquare.style.marginRight = "6px";
          colorSquare.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          colorSquare.style.borderRadius = "2px";

          const label = document.createElement("span");
          label.textContent = `${count}`;
          label.style.whiteSpace = "nowrap";

          item.appendChild(colorSquare);
          item.appendChild(label);
          colorList.appendChild(item);
        }

        ctx.putImageData(resultData, 0, 0);
        const mergedBlob = await canvas.convertToBlob();
        return new Response(mergedBlob, { headers: { "Content-Type": "image/png" } });
      }
    }

    // ---- modo chunks: desenha moldura e label do tile
    if (overlayMode === "chunks") {
      if (url.hostname === "backend.wplace.live" && url.pathname.startsWith("/files/")) {
        const [chunk1, chunk2] = parseTileXY(url.pathname);
        const canvas = new OffscreenCanvas(CHUNK_WIDTH, CHUNK_HEIGHT);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, CHUNK_WIDTH, CHUNK_HEIGHT);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${chunk1}, ${chunk2}`, CHUNK_WIDTH / 2, CHUNK_HEIGHT / 2);
        const mergedBlob = await canvas.convertToBlob();
        return new Response(mergedBlob, { headers: { "Content-Type": "image/png" } });
      }
    }

    // modo "original" (ou qualquer outra coisa) -> passa direto
    return target.apply(thisArg, argList);
  }
});

// ======================== DATA / UI BUTTON ========================
async function fetchData() {
  const response = await fetch("https://cdn.jsdelivr.net/gh/rafaelwdornelas/wplace@main/overlays.json?" + Date.now());
  const data = await response.json();
  console.log(`Carregando ${data.length} overlays`);
  return data;
}

function patchUI() {
  if (document.getElementById("overlay-blend-button")) return;
  let blendButton = document.createElement("button");
  blendButton.id = "overlay-blend-button";
  blendButton.textContent = overlayMode.charAt(0).toUpperCase() + overlayMode.slice(1);
  blendButton.style.backgroundColor = "#0e0e0e7f";
  blendButton.style.color = "white";
  blendButton.style.border = "solid";
  blendButton.style.borderColor = "#1d1d1d7f";
  blendButton.style.borderRadius = "4px";
  blendButton.style.padding = "5px 10px";
  blendButton.style.cursor = "pointer";
  blendButton.style.backdropFilter = "blur(2px)";
  blendButton.addEventListener("click", () => {
    overlayMode = OVERLAY_MODES[(OVERLAY_MODES.indexOf(overlayMode) + 1) % OVERLAY_MODES.length];
    blendButton.textContent = overlayMode.charAt(0).toUpperCase() + overlayMode.slice(1);
  });

  const buttonContainer = document.querySelector("div.gap-4:nth-child(1) > div:nth-child(2)");
  const leftSidebar = document.querySelector("html body div div.disable-pinch-zoom.relative.h-full.overflow-hidden.svelte-6wmtgk div.absolute.right-2.top-2.z-30 div.flex.flex-col.gap-4.items-center");
  if (buttonContainer) {
    buttonContainer.appendChild(blendButton);
    buttonContainer.classList.remove("items-center");
    buttonContainer.classList.add("items-end");
  }
  if (leftSidebar) {
    leftSidebar.classList.add("items-end");
    leftSidebar.classList.remove("items-center");
  }
}

const rootToObserve = document.querySelector("div.gap-4:nth-child(1)");
if (rootToObserve) {
  const observer = new MutationObserver(() => { patchUI(); });
  observer.observe(rootToObserve, { childList: true, subtree: true });
}
patchUI();

})();
