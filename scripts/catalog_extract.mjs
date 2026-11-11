import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  createCanvas,
  DOMMatrix,
  ImageData,
  loadImage,
  Path2D,
} from "@napi-rs/canvas";

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = DOMMatrix;
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = ImageData;
}
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = Path2D;
}

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const debugDirectory = "/tmp/catalog-debug";
const textCodePattern = /^[A-Z]{1,3}\d{3,7}(?:-[A-Z0-9]+)*$/;
const bitmapPagesByHash = new Map();
const knownLogoSizes = new Set(["153x155", "62x57", "61x57"]);
const catalogOverrides = JSON.parse(
  await fs.readFile(path.join(projectRoot, "data", "catalog-overrides.json"), "utf8")
);
const skipImageHashes = new Set(catalogOverrides.skipImageHashes ?? []);
const machines = [
  {
    machine: "colheitadeira",
    source: "Catálogo de Peças John Deere (Colheitadeira).pdf",
  },
  {
    machine: "plantadeira",
    source: "Catálogo de Peças John Deere (PLANTADEIRA).pdf",
  },
  {
    machine: "pulverizador",
    source: "Catálogo de Peças John Deere (pulverizador).pdf",
  },
];

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isIgnoredText(text) {
  return /^(?:Peças similares\b|Consulte disponibilidade\b|Entre em contato\b|WhatsApp\b|CATÁLOGO DE PEÇAS\b|USINAGEM CNC\b|ARTCOMPANY\b|.*\bJohn Deere\b)/i.test(
    text
  );
}

function getPageTextLines(textContent, pageHeight) {
  const topLimit = pageHeight * 0.92;
  const bottomLimit = pageHeight * 0.08;
  const items = textContent.items
    .filter((item) => typeof item.str === "string" && normalizeText(item.str))
    .map((item) => ({
      text: normalizeText(item.str),
      x: item.transform[4],
      y: item.transform[5],
      width: Math.abs(item.width ?? 0),
    }))
    .filter((item) => item.y <= topLimit && item.y >= bottomLimit);

  const rows = [];
  for (const item of items.sort((a, b) => b.y - a.y || a.x - b.x)) {
    let row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= 2.5);
    if (!row) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
    row.y =
      row.items.reduce((total, rowItem) => total + rowItem.y, 0) /
      row.items.length;
  }

  const lines = [];
  for (const row of rows) {
    const sortedItems = row.items.sort((a, b) => a.x - b.x);
    let group = [];
    let groupRight = -Infinity;

    const flushGroup = () => {
      if (!group.length) return;
      const left = Math.min(...group.map((item) => item.x));
      const right = Math.max(
        ...group.map((item) => item.x + Math.max(item.width, 4))
      );
      const text = normalizeText(group.map((item) => item.text).join(" "));
      if (text && !isIgnoredText(text)) {
        lines.push({
          text,
          y:
            group.reduce((total, item) => total + item.y, 0) / group.length,
          x: left,
          right,
          centerX: (left + right) / 2,
          items: group,
        });
      }
      group = [];
      groupRight = -Infinity;
    };

    for (const item of sortedItems) {
      if (group.length && item.x - groupRight > 28) {
        flushGroup();
      }
      group.push(item);
      groupRight = Math.max(groupRight, item.x + Math.max(item.width, 4));
    }
    flushGroup();
  }

  return lines.sort((a, b) => b.y - a.y || a.x - b.x);
}

function findCodeEntries(lines, pageNumber) {
  const codes = [];
  const seen = new Set();

  for (const line of lines) {
    const codeItems = line.items.filter((item) => textCodePattern.test(item.text));
    if (!codeItems.length && textCodePattern.test(line.text)) {
      codeItems.push({
        text: line.text,
        x: line.x,
        y: line.y,
        width: line.right - line.x,
      });
    }

    for (const item of codeItems) {
      const key = `${item.text}:${Math.round(item.x)}:${Math.round(item.y)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      codes.push({
        code: item.text,
        page: pageNumber,
        item,
        x: item.x,
        right: item.x + Math.max(item.width, 4),
        centerX: item.x + Math.max(item.width, 4) / 2,
        y: item.y,
        line,
        name: "",
        models: "",
        image: null,
      });
    }
  }

  return codes.sort((a, b) => b.y - a.y || a.x - b.x);
}

function extractNamesAndModels(lines, codes, pageWidth) {
  const maxColumnDistance = pageWidth * 0.2;
  const maxBlockHeight = 135;
  const maxLineGap = 48;

  for (const code of codes) {
    const candidateLines = [];

    for (const line of lines) {
      if (line === code.line) {
        const inlineItems = line.items.filter(
          (item) =>
            item !== code.item &&
            item.x >= code.right - 2 &&
            Math.abs(item.y - code.y) <= 2.5
        );
        if (inlineItems.length) {
          const left = Math.min(...inlineItems.map((item) => item.x));
          const right = Math.max(
            ...inlineItems.map((item) => item.x + Math.max(item.width, 4))
          );
          candidateLines.push({
            text: normalizeText(inlineItems.map((item) => item.text).join(" ")),
            y: code.y,
            x: left,
            right,
            centerX: (left + right) / 2,
          });
        }
        continue;
      }

      const containsAnotherCode = line.items.some((item) =>
        textCodePattern.test(item.text)
      );
      if (containsAnotherCode) continue;
      if (line.y > code.y + 2.5 || code.y - line.y > maxBlockHeight) continue;
      if (Math.abs(line.centerX - code.centerX) > maxColumnDistance) continue;
      candidateLines.push(line);
    }

    candidateLines.sort((a, b) => b.y - a.y || a.x - b.x);
    const nextCodeY = codes
      .filter(
        (other) =>
          other !== code &&
          other.y < code.y &&
          Math.abs(other.centerX - code.centerX) <= maxColumnDistance
      )
      .reduce(
        (nearest, other) => Math.max(nearest, other.y),
        -Infinity
      );

    let previousY = code.y;
    let modelsStarted = false;
    const nameParts = [];
    const modelParts = [];
    for (const line of candidateLines) {
      if (line.y <= nextCodeY + 1) break;
      if (previousY - line.y > maxLineGap) break;
      if (textCodePattern.test(line.text)) break;
      if (isIgnoredText(line.text)) continue;

      const modelMatch = line.text.match(/^MODELO\s*:\s*(.*)$/i);
      if (modelMatch) {
        modelsStarted = true;
        if (modelMatch[1]) modelParts.push(modelMatch[1]);
      } else if (modelsStarted) {
        modelParts.push(line.text);
      } else {
        nameParts.push(line.text);
      }
      previousY = line.y;
    }

    code.name = normalizeText(nameParts.join(" "));
    code.models = normalizeText(modelParts.join(" ")).replace(/[.]\s*$/, "");
  }

  const modelsTitles = lines.filter((line) =>
    /^Modelos Compat[ií]veis\b/i.test(line.text)
  );
  for (const title of modelsTitles) {
    const modelLines = lines
      .filter(
        (line) =>
          line.y < title.y &&
          Math.abs(line.centerX - title.centerX) <= pageWidth * 0.28 &&
          !textCodePattern.test(line.text) &&
          !isIgnoredText(line.text)
      )
      .sort((a, b) => b.y - a.y || a.x - b.x)
      .map((line) => line.text.replace(/^[•·▪\-]\s*/, ""));
    const modelText = normalizeText(modelLines.join(" ")).replace(/[.]\s*$/, "");
    if (!modelText || codes.length === 0) continue;

    const owner =
      codes.length === 1
        ? codes[0]
        : codes.reduce((nearest, code) =>
            Math.abs(code.centerX - title.centerX) <
            Math.abs(nearest.centerX - title.centerX)
              ? code
              : nearest
          );
    owner.models = normalizeText([owner.models, modelText].filter(Boolean).join(" "));
  }
}

function transformPoint(matrix, x, y) {
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5],
  };
}

function getTransformedBounds(matrix) {
  const points = [
    transformPoint(matrix, 0, 0),
    transformPoint(matrix, 1, 0),
    transformPoint(matrix, 0, 1),
    transformPoint(matrix, 1, 1),
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    width: xMax - xMin,
    height: yMax - yMin,
    centerX: (xMin + xMax) / 2,
    centerY: (yMin + yMax) / 2,
  };
}

function findImagePlacements(operatorList, pageWidth, pageHeight) {
  const images = [];
  const ops = pdfjs.OPS;
  const matrixStack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  let index = 0;

  for (let i = 0; i < operatorList.fnArray.length; i += 1) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i] ?? [];

    if (fn === ops.save) {
      matrixStack.push([...matrix]);
      continue;
    }
    if (fn === ops.restore) {
      matrix = matrixStack.pop() ?? [1, 0, 0, 1, 0, 0];
      continue;
    }
    if (fn === ops.transform) {
      matrix = pdfjs.Util.transform(matrix, args);
      continue;
    }
    if (fn !== ops.paintImageXObject && fn !== ops.paintImageXObjectRepeat) {
      continue;
    }

    const name = args[0];
    const transforms =
      fn === ops.paintImageXObjectRepeat
        ? (args[3] ?? []).reduce((placements, _position, positionIndex, positions) => {
            if (positionIndex % 2 !== 0) return placements;
            const placementMatrix = pdfjs.Util.transform(matrix, [
              args[1],
              0,
              0,
              args[2],
              positions[positionIndex],
              positions[positionIndex + 1],
            ]);
            placements.push(placementMatrix);
            return placements;
          }, [])
        : [[...matrix]];

    for (const placementMatrix of transforms) {
      const bounds = getTransformedBounds(placementMatrix);
      const areaRatio = (bounds.width * bounds.height) / (pageWidth * pageHeight);
      const aspectRatio =
        Math.max(bounds.width, bounds.height) /
        Math.max(Math.min(bounds.width, bounds.height), 0.001);
      const centerInHeaderOrFooter =
        bounds.centerY > pageHeight * 0.92 ||
        bounds.centerY < pageHeight * 0.08;
      const centerAtSideEdge =
        bounds.centerX < pageWidth * 0.12 ||
        bounds.centerX > pageWidth * 0.88;
      const reasons = [];

      if (bounds.width < 40 || bounds.height < 40) reasons.push("small");
      if (areaRatio > 0.8) reasons.push("page-sized");
      if (aspectRatio > 6) reasons.push("thin");
      if (centerInHeaderOrFooter) reasons.push("header/footer");
      if (centerAtSideEdge) reasons.push("side margin");

      images.push({
        ...bounds,
        matrix: [...placementMatrix],
        name,
        index,
        accepted: reasons.length === 0,
        rejection: reasons.join(", "),
      });
      index += 1;
    }
  }

  return images;
}

async function resolvePageObject(objects, name) {
  if (objects.has(name)) return objects.get(name);
  return new Promise((resolve, reject) => {
    try {
      const value = objects.get(name, resolve);
      if (value) resolve(value);
    } catch (error) {
      reject(error);
    }
  });
}

function createRgbaData(image) {
  const { width, height, kind, data } = image;
  const source = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
  if (kind === pdfjs.ImageKind.RGBA_32BPP) return source;

  const rgba = new Uint8ClampedArray(width * height * 4);
  if (kind === pdfjs.ImageKind.RGB_24BPP) {
    for (let sourceIndex = 0, targetIndex = 0; sourceIndex < width * height * 3; ) {
      rgba[targetIndex++] = source[sourceIndex++];
      rgba[targetIndex++] = source[sourceIndex++];
      rgba[targetIndex++] = source[sourceIndex++];
      rgba[targetIndex++] = 255;
    }
    return rgba;
  }
  if (kind === pdfjs.ImageKind.GRAYSCALE_1BPP) {
    for (let pixel = 0; pixel < width * height; pixel += 1) {
      const value = (source[pixel >> 3] & (1 << (7 - (pixel & 7)))) !== 0 ? 255 : 0;
      const targetIndex = pixel * 4;
      rgba[targetIndex] = value;
      rgba[targetIndex + 1] = value;
      rgba[targetIndex + 2] = value;
      rgba[targetIndex + 3] = 255;
    }
    return rgba;
  }
  throw new Error(`Unsupported PDF image kind: ${kind}`);
}

function getAlphaBounds(rgba, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return maxX >= minX && maxY >= minY
    ? { minX, minY, maxX, maxY }
    : null;
}

function getVisibleImageBounds(matrix, width, height, alphaBounds) {
  if (!alphaBounds) {
    return getTransformedBounds(matrix);
  }

  const points = [
    [alphaBounds.minX / width, 1 - (alphaBounds.maxY + 1) / height],
    [(alphaBounds.maxX + 1) / width, 1 - (alphaBounds.maxY + 1) / height],
    [alphaBounds.minX / width, 1 - alphaBounds.minY / height],
    [(alphaBounds.maxX + 1) / width, 1 - alphaBounds.minY / height],
  ].map(([x, y]) => transformPoint(matrix, x, y));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    centerX: (xMin + xMax) / 2,
    centerY: (yMin + yMax) / 2,
  };
}

function imageToPngBuffer(image, rgba, alphaBounds) {
  const { width, height } = image;
  const bounds =
    alphaBounds ?? getAlphaBounds(rgba, width, height) ?? {
      minX: width,
      minY: height,
      maxX: -1,
      maxY: -1,
    };
  const { minX, minY, maxX, maxY } = bounds;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = width;
  let cropHeight = height;
  if (maxX >= minX && maxY >= minY) {
    const contentWidth = maxX - minX + 1;
    const contentHeight = maxY - minY + 1;
    if (contentWidth * contentHeight < width * height * 0.95) {
      cropX = Math.max(0, minX - 8);
      cropY = Math.max(0, minY - 8);
      cropWidth = Math.min(width, maxX + 9) - cropX;
      cropHeight = Math.min(height, maxY + 9) - cropY;
    }
  }

  let output = rgba;
  if (cropX !== 0 || cropY !== 0 || cropWidth !== width || cropHeight !== height) {
    output = new Uint8ClampedArray(cropWidth * cropHeight * 4);
    for (let y = 0; y < cropHeight; y += 1) {
      const sourceStart = ((cropY + y) * width + cropX) * 4;
      const targetStart = y * cropWidth * 4;
      output.set(rgba.subarray(sourceStart, sourceStart + cropWidth * 4), targetStart);
    }
  }

  const canvas = createCanvas(cropWidth, cropHeight);
  canvas
    .getContext("2d")
    .putImageData(new ImageData(output, cropWidth, cropHeight), 0, 0);
  return canvas.toBuffer("image/png");
}

function associationDistance(code, image) {
  const imageX = image.visibleCenterX ?? image.centerX;
  const imageY = image.visibleCenterY ?? image.centerY;
  return Math.hypot(
    (imageX - code.centerX) * 0.6,
    imageY - code.y
  );
}

function isAssociationCandidate(code, image) {
  const imageY = image.visibleCenterY ?? image.centerY;
  const centerAboveOrNear = imageY >= code.y - 10;
  const noHorizontalOverlap =
    code.centerX < (image.visibleXMin ?? image.xMin) ||
    code.centerX > (image.visibleXMax ?? image.xMax);
  const codeWithinVisibleVerticalBand =
    code.y >= (image.visibleYMin ?? image.yMin) &&
    code.y <= (image.visibleYMax ?? image.yMax);
  return (
    centerAboveOrNear ||
    (noHorizontalOverlap && codeWithinVisibleVerticalBand)
  );
}

function pairCodesAndImages(codes, images) {
  const availableImages = images.filter((image) => image.accepted);
  const pairs = [];
  for (const code of codes) {
    for (const image of availableImages) {
      if (!isAssociationCandidate(code, image)) continue;
      const distance = associationDistance(code, image);
      pairs.push({ code, image, distance });
    }
  }

  pairs.sort(
    (a, b) =>
      a.distance - b.distance ||
      a.code.page - b.code.page ||
      a.image.index - b.image.index
  );
  const assignedCodes = new Set();
  const assignedImages = new Set();
  const imagesByCode = new Map(codes.map((code) => [code, []]));
  for (const pair of pairs) {
    if (assignedCodes.has(pair.code) || assignedImages.has(pair.image)) continue;
    pair.code.image = pair.image;
    imagesByCode.get(pair.code).push(pair.image);
    assignedCodes.add(pair.code);
    assignedImages.add(pair.image);
  }

  for (const image of availableImages) {
    if (assignedImages.has(image)) continue;

    let nearest = null;
    for (const code of codes) {
      if (!isAssociationCandidate(code, image)) continue;
      const distance = associationDistance(code, image);
      if (!nearest || distance < nearest.distance) {
        nearest = { code, distance };
      }
    }

    if (nearest && nearest.distance < 220) {
      imagesByCode.get(nearest.code).push(image);
      assignedImages.add(image);
      assignedCodes.add(nearest.code);
    }
  }

  if (codes.length === 1) {
    const code = codes[0];
    for (const image of availableImages) {
      if (assignedImages.has(image)) continue;
      imagesByCode.get(code).push(image);
      assignedImages.add(image);
      assignedCodes.add(code);
    }
  }

  for (const code of codes) {
    const codeImages = imagesByCode.get(code);
    const nestedCandidates = codeImages.filter((outer) =>
      codeImages.some(
        (inner) =>
          inner !== outer &&
          outer.width * outer.height > inner.width * inner.height &&
          overlapRatio(outer, inner) > 0.9
      )
    );
    const primary =
      codes.length === 1
        ? [...codeImages].sort(
            (a, b) => b.width * b.height - a.width * a.height
          )[0]
        : nestedCandidates.sort(
            (a, b) => b.width * b.height - a.width * a.height
          )[0] ??
          code.image ??
          codeImages.sort(
            (a, b) => associationDistance(code, a) - associationDistance(code, b)
          )[0];
    const secondary = codeImages
      .filter((image) => image !== primary)
      .sort(
        (a, b) =>
          associationDistance(code, a) - associationDistance(code, b) ||
          a.index - b.index
      );
    code.image = primary ?? null;
    code.images = primary ? [primary, ...secondary] : [];
    if (code.images.length) assignedCodes.add(code);
  }

  return {
    assignedCodes,
    assignedImages,
  };
}

function overlapRatio(a, b) {
  const intersectionWidth = Math.max(
    0,
    Math.min(a.xMax, b.xMax) - Math.max(a.xMin, b.xMin)
  );
  const intersectionHeight = Math.max(
    0,
    Math.min(a.yMax, b.yMax) - Math.max(a.yMin, b.yMin)
  );
  const intersectionArea = intersectionWidth * intersectionHeight;
  const smallerArea = Math.min(
    a.width * a.height,
    b.width * b.height
  );
  return smallerArea > 0 ? intersectionArea / smallerArea : 0;
}

function viewportPoint(viewport, x, y) {
  return viewport.convertToViewportPoint(x, y);
}

function drawDebugOverlay(context, viewport, images, codes) {
  for (const image of images) {
    const rectangle = viewport.convertToViewportRectangle([
      image.xMin,
      image.yMin,
      image.xMax,
      image.yMax,
    ]);
    const x = Math.min(rectangle[0], rectangle[2]);
    const y = Math.min(rectangle[1], rectangle[3]);
    const width = Math.abs(rectangle[2] - rectangle[0]);
    const height = Math.abs(rectangle[3] - rectangle[1]);
    context.strokeStyle = image.accepted ? "#00e676" : "#ff1744";
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
    context.fillStyle = context.strokeStyle;
    context.font = "bold 14px sans-serif";
    const label = [
      image.index,
      image.bitmapHash?.slice(0, 8),
      image.debugLabel,
    ]
      .filter(Boolean)
      .join(" ");
    context.fillText(label, x + 3, y + 15);
  }

  for (const code of codes) {
    const [x, y] = viewportPoint(viewport, code.centerX, code.y);
    for (const image of code.images ?? []) {
      const [imageX, imageY] = viewportPoint(
        viewport,
        image.visibleCenterX ?? image.centerX,
        image.visibleCenterY ?? image.centerY
      );
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(imageX, imageY);
      context.strokeStyle = "#ffeb3b";
      context.lineWidth = 2;
      context.stroke();
    }
    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2);
    context.fillStyle = "#ffeb3b";
    context.fill();
    context.font = "bold 12px sans-serif";
    context.fillText(code.code, x + 7, y - 7);
  }
}

async function processPage(doc, pageNumber, machine) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();
  const lines = getPageTextLines(textContent, viewport.height);
  const codes = findCodeEntries(lines, pageNumber);
  extractNamesAndModels(lines, codes, viewport.width);

  const operatorList = await page.getOperatorList();
  const images = findImagePlacements(
    operatorList,
    viewport.width,
    viewport.height
  );
  const debugViewport = page.getViewport({ scale: 1.5 });
  const debugCanvas = createCanvas(
    Math.ceil(debugViewport.width),
    Math.ceil(debugViewport.height)
  );
  await page.render({
    canvasContext: debugCanvas.getContext("2d"),
    viewport: debugViewport,
  }).promise;

  const warnings = [];
  for (const image of images) {
    try {
      const imageObject = await resolvePageObject(page.objs, image.name);
      const bitmapBytes = Buffer.from(
        imageObject.data.buffer,
        imageObject.data.byteOffset,
        imageObject.data.byteLength
      );
      image.bitmapHash = createHash("sha1").update(bitmapBytes).digest("hex");
      const pageKey = `${machine}:${pageNumber}`;
      const hashPages = bitmapPagesByHash.get(image.bitmapHash) ?? new Set();
      hashPages.add(pageKey);
      bitmapPagesByHash.set(image.bitmapHash, hashPages);
      image.widthPx = imageObject.width;
      image.heightPx = imageObject.height;
      if (image.accepted) {
        const rgba = createRgbaData(imageObject);
        const alphaBounds = getAlphaBounds(
          rgba,
          imageObject.width,
          imageObject.height
        );
        const visibleBounds = getVisibleImageBounds(
          image.matrix,
          imageObject.width,
          imageObject.height,
          alphaBounds
        );
        image.visibleCenterX = visibleBounds.centerX;
        image.visibleCenterY = visibleBounds.centerY;
        image.visibleXMin = visibleBounds.xMin;
        image.visibleXMax = visibleBounds.xMax;
        image.visibleYMin = visibleBounds.yMin;
        image.visibleYMax = visibleBounds.yMax;
        image.png = imageToPngBuffer(imageObject, rgba, alphaBounds);
      }
    } catch (error) {
      if (image.accepted) {
        image.accepted = false;
        image.rejection = `unavailable: ${error.message}`;
        warnings.push(
          `page ${pageNumber}: image ${image.index} could not be decoded (${error.message})`
        );
      }
    }
  }

  return {
    machine,
    pageNumber,
    images,
    codes,
    warnings,
    debugViewport,
    debugWidth: debugCanvas.width,
    debugHeight: debugCanvas.height,
    debugBase: debugCanvas.toBuffer("image/png"),
  };
}

async function finalizePage(pageRecord, warnings) {
  warnings.push(...pageRecord.warnings);
  for (const image of pageRecord.images) {
    if (skipImageHashes.has(image.bitmapHash)) {
      image.accepted = false;
      image.rejection = "skip";
      image.debugLabel = "skip";
      continue;
    }
    if (!image.accepted) continue;

    const pageCount = bitmapPagesByHash.get(image.bitmapHash)?.size ?? 0;
    if (pageCount >= 3) {
      image.accepted = false;
      image.rejection = "repeat";
      image.debugLabel = "repeat";
    } else if (
      knownLogoSizes.has(`${image.widthPx}x${image.heightPx}`)
    ) {
      image.accepted = false;
      image.rejection = "known logo size";
      image.debugLabel = "logo";
    }
  }

  const { assignedCodes, assignedImages } = pairCodesAndImages(
    pageRecord.codes,
    pageRecord.images
  );
  for (const code of pageRecord.codes) {
    if (!assignedCodes.has(code)) {
      warnings.push(
        `page ${pageRecord.pageNumber}: code ${code.code} has no image`
      );
    }
  }

  for (const image of pageRecord.images) {
    if (image.accepted && !assignedImages.has(image)) {
      warnings.push(
        `page ${pageRecord.pageNumber}: image ${image.index} has no code`
      );
    }
  }

  const debugImage = await loadImage(pageRecord.debugBase);
  const debugCanvas = createCanvas(pageRecord.debugWidth, pageRecord.debugHeight);
  const debugContext = debugCanvas.getContext("2d");
  debugContext.drawImage(debugImage, 0, 0);
  drawDebugOverlay(
    debugContext,
    pageRecord.debugViewport,
    pageRecord.images,
    pageRecord.codes
  );
  const debugPath = path.join(
    debugDirectory,
    `${pageRecord.machine}-p${String(pageRecord.pageNumber).padStart(2, "0")}.png`
  );
  await fs.writeFile(debugPath, debugCanvas.toBuffer("image/png"));

  return pageRecord.codes.map((code) => ({
    code: code.code,
    name: code.name,
    models: code.models,
    page: code.page,
    _imageAssets: (code.images ?? []).map((image) => image.png),
  }));
}

async function readMachine({ machine, source }) {
  const pdfPath = path.join(os.homedir(), "Downloads", source);
  const pdfData = new Uint8Array(await fs.readFile(pdfPath));
  const doc = await pdfjs.getDocument({
    data: pdfData,
    disableWorker: true,
  }).promise;

  try {
    const pages = [];
    for (let pageNumber = 2; pageNumber <= doc.numPages; pageNumber += 1) {
      pages.push(await processPage(doc, pageNumber, machine));
    }
    return { machine, source, pages };
  } finally {
    await doc.destroy();
  }
}

async function finalizeMachine({ machine, source, pages }) {
  const imageDirectory = path.join(projectRoot, "public", "catalog", machine);
  const jsonPath = path.join(projectRoot, "data", "catalog", `${machine}.json`);
  const warnings = [];
  await fs.mkdir(imageDirectory, { recursive: true });
  await fs.mkdir(path.dirname(jsonPath), { recursive: true });

  const items = [];
  for (const page of pages) {
    items.push(...(await finalizePage(page, warnings)));
  }

    const itemsByCode = new Map();
    for (const item of items) {
      const baseSlug = slugify(item.code);
      const group = itemsByCode.get(baseSlug) ?? [];
      group.push(item);
      itemsByCode.set(baseSlug, group);
    }

    const usedSlugs = new Set();
    for (const [baseSlug, group] of itemsByCode) {
      for (const [index, item] of group.entries()) {
        let itemSlug = baseSlug;
        if (group.length > 1) {
          const words = slugify(item.name).split("-").filter(Boolean);
          const suffixes = [
            words.at(-1),
            ...words
              .slice(0, -1)
              .reverse()
              .map((_word, wordIndex) =>
                words.slice(-(wordIndex + 2)).join("-")
              ),
          ].filter(Boolean);
          itemSlug =
            suffixes
              .map((suffix) => `${baseSlug}-${suffix}`)
              .find((candidate) => !usedSlugs.has(candidate)) ??
            `${baseSlug}-${index + 1}`;
        }
        if (usedSlugs.has(itemSlug)) {
          let suffix = 2;
          while (usedSlugs.has(`${itemSlug}-${suffix}`)) suffix += 1;
          itemSlug = `${itemSlug}-${suffix}`;
        }
        usedSlugs.add(itemSlug);
        item.slug = itemSlug;
      }
    }

    const expectedImageFiles = new Set();
    let imageCount = 0;
    for (const item of items) {
      const assets = item._imageAssets;
      item.images = [];
      for (const [index, asset] of assets.entries()) {
        const suffix = index === 0 ? "" : `-${index + 1}`;
        const filename = `${item.slug}${suffix}.png`;
        await fs.writeFile(path.join(imageDirectory, filename), asset);
        expectedImageFiles.add(filename);
        item.images.push(`/catalog/${machine}/${filename}`);
        imageCount += 1;
      }
      delete item._imageAssets;
    }

    for (const entry of await fs.readdir(imageDirectory, { withFileTypes: true })) {
      if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".png") &&
        !expectedImageFiles.has(entry.name)
      ) {
        await fs.unlink(path.join(imageDirectory, entry.name));
      }
    }

    const result = {
      machine,
      source,
      items,
      warnings,
    };
    await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
    console.log(
      `${machine}: ${items.length} items, ${imageCount} images, ${warnings.length} warnings (${jsonPath})`
    );
    return result;
}

async function main() {
  await fs.mkdir(debugDirectory, { recursive: true });
  const catalogs = [];
  for (const machine of machines) {
    catalogs.push(await readMachine(machine));
  }
  for (const catalog of catalogs) {
    await finalizeMachine(catalog);
    catalog.pages.length = 0;
  }
}

await main();
