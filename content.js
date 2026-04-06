(() => {
  const INSTALL_FLAG = "__nlHomesicknessOverlayV11";
  const TOGGLE_MESSAGE = "nl-homesickness:toggle:v11";
  const OVERLAY_ID = "nl-homesickness-overlay-v11";
  const STYLE_ID = "nl-homesickness-style-v11";
  const RENDER_DELAY_MS = 120;
  const MEDIA_SELECTOR = [
    "img",
    "svg",
    "figure",
    "object"
  ].join(",");
  const TEXT_SELECTOR = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "figcaption",
    "time",
    "span",
    "li",
    "div",
    "a",
    "button"
  ].join(",");
  const TULIP_PALETTES = {
    red: {
      petals: ["#b3132b", "#cf1e35", "#e53445", "#ff5b62"],
      bed: "#2b6c34"
    },
    yellow: {
      petals: ["#c79d12", "#ddb524", "#f0cc3d", "#ffe06a"],
      bed: "#2f7136"
    },
    pink: {
      petals: ["#c95a8f", "#dd78a8", "#ee9cc2", "#ffbfd8"],
      bed: "#2c6a35"
    },
    white: {
      petals: ["#e8e1d5", "#f3eee3", "#fbf8f2", "#fffdf8"],
      bed: "#316f39"
    },
    purple: {
      petals: ["#6b3aa6", "#7b49bc", "#9464d2", "#b18ff0"],
      bed: "#2a6633"
    },
    orange: {
      petals: ["#c76b18", "#df8120", "#f19a37", "#ffba62"],
      bed: "#2f6f38"
    },
    maroon: {
      petals: ["#4f1027", "#651938", "#782244", "#8c2d51"],
      bed: "#275f30"
    }
  };
  const FAMILY_KEYS = Object.keys(TULIP_PALETTES);
  const LEAF_SHADES = ["#1e5628", "#2f7337", "#3d8b43", "#4ea253"];
  const SOIL_COLOR = "#6d482b";
  const STRIPE_PITCH = 18;
  const CORRIDOR_WIDTH = 2;
  const FLOWER_TILE_WIDTH = STRIPE_PITCH * 4;
  const FLOWER_TILE_HEIGHT = 46;
  const CORE_TULIP_COUNT = 156;
  const TERRITORY_TULIP_COUNT = 106;
  const MIN_MEDIA_WIDTH = 24;
  const MIN_MEDIA_HEIGHT = 14;
  const MIN_TEXT_WIDTH = 60;
  const MIN_TEXT_HEIGHT = 18;
  const MIN_HEADING_WIDTH = 40;
  const MIN_HEADING_HEIGHT = 12;
  const MIN_TAG_WIDTH = 24;
  const MIN_TAG_HEIGHT = 10;
  const MIN_TEXT_LENGTH = 12;
  const MIN_META_TEXT_LENGTH = 4;
  const MAX_TAG_TEXT_LENGTH = 32;
  const MAX_TAG_WORDS = 4;
  const MAX_TEXT_LENGTH = 220;
  const MAX_ELEMENTS = 1800;
  const EDGE_CLAIM_THRESHOLD = 96;
  const SOFT_EXPANSION_PX = 18;
  const MIN_PERP_OVERLAP_RATIO = 0.14;
  const CENTER_ALIGN_RATIO = 0.85;
  const MICRO_MAX_HEIGHT = 42;
  const MICRO_MAX_AREA = 18000;
  const MICRO_MAX_WIDTH = 260;
  const ABSORB_MAX_GAP = 160;
  const ABSORB_MIN_OVERLAP_RATIO = 0.2;
  const GRID_SIZE = 24;
  const MIN_LEFTOVER_CELLS = 3;
  const NAV_MIN_ITEMS = 4;
  const NAV_MAX_ITEMS = 20;
  const NAV_MAX_HEIGHT = 96;
  const NAV_MIN_WIDTH = 320;
  const NAV_ALIGNMENT_TOLERANCE = 18;
  const NAV_PADDING_X = 20;
  const NAV_PADDING_Y = 12;
  const COMPOSITE_MAX_STEPS = 4;
  const COMPOSITE_MAX_WIDTH_GROWTH = 220;
  const COMPOSITE_MAX_HEIGHT_GROWTH = 96;
  const COMPOSITE_WIDTH_RATIO = 1.9;
  const COMPOSITE_HEIGHT_RATIO = 4.2;
  const WRAPPED_HEADER_WIDTH_RATIO = 3.4;
  const WRAPPED_HEADER_HEIGHT_RATIO = 6;
  const WRAPPED_HEADER_MAX_GROWTH = 420;
  const TERRITORY_ADJACENCY_GAP = 8;
  const POSITION_BUCKET = 48;
  const SIZE_BUCKET = 24;
  const LEGACY_IDS = [
    "nl-homesickness-overlay-v8",
    "nl-homesickness-overlay-v7",
    "nl-homesickness-overlay-v6",
    "nl-homesickness-overlay-v5",
    "nl-homesickness-overlay-v4",
    "nl-homesickness-overlay-v3",
    "nl-homesickness-overlay-v2",
    "nl-homesickness-overlay",
    "nl-overlay",
    "nl-homesickness-style-v9",
    "nl-homesickness-style-v8",
    "nl-homesickness-style-v7",
    "nl-homesickness-style-v6",
    "nl-homesickness-style-v5",
    "nl-homesickness-style-v4",
    "nl-homesickness-style-v3",
    "nl-homesickness-style-v2",
    "nl-homesickness-style",
    "abstractbrowsing"
  ];
  let renderTimer = 0;
  let mutationObserver = null;
  let liveSyncAttached = false;
  let isRendering = false;
  const patternCache = new Map();
  const fieldAssignmentCache = new Map();
  let previousFieldStates = [];

  if (globalThis[INSTALL_FLAG]) {
    return;
  }

  globalThis[INSTALL_FLAG] = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== TOGGLE_MESSAGE) {
      return;
    }

    try {
      if (isActive()) {
        deactivate();
        sendResponse({ active: false });
      } else {
        activate();
        sendResponse({ active: true });
      }
    } catch (error) {
      console.error("NL Homesickness overlay failed", error);
      deactivate();
      sendResponse({ active: false, error: String(error) });
    }
  });

  function activate() {
    cleanupLegacyArtifacts();
    ensureStyle();
    startLiveSync();
    scheduleRender();
  }

  function deactivate() {
    stopLiveSync();
    if (renderTimer) {
      window.clearTimeout(renderTimer);
      renderTimer = 0;
    }

    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.remove();
    }

    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }

    cleanupLegacyArtifacts();
  }

  function scheduleRender() {
    if (renderTimer) {
      return;
    }

    renderTimer = window.setTimeout(() => {
      renderTimer = 0;

      if (!document.getElementById(STYLE_ID)) {
        return;
      }

      const model = buildModel();
      const overlay = ensureOverlay(model.docWidth, model.docHeight);
      if (!overlay) {
        return;
      }
      renderModel(model, overlay);
      previousFieldStates = model.fieldStates || [];
    }, RENDER_DELAY_MS);
  }

  function isActive() {
    return Boolean(document.getElementById(OVERLAY_ID));
  }

  function cleanupLegacyArtifacts() {
    for (const id of LEGACY_IDS) {
      const node = document.getElementById(id);
      if (node) {
        node.remove();
      }
    }
  }

  function startLiveSync() {
    if (!liveSyncAttached) {
      window.addEventListener("scroll", scheduleRender, { passive: true });
      window.addEventListener("resize", scheduleRender, { passive: true });
      liveSyncAttached = true;
    }

    if (!mutationObserver && document.body) {
      mutationObserver = new MutationObserver((mutations) => {
        if (isRendering) {
          return;
        }

        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay && mutations.length && mutations.every((mutation) => isOverlayMutation(mutation, overlay))) {
          return;
        }

        scheduleRender();
      });

      mutationObserver.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class", "style", "src", "srcset"]
      });
    }
  }

  function stopLiveSync() {
    if (liveSyncAttached) {
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", scheduleRender);
      liveSyncAttached = false;
    }

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID} {
        position: absolute;
        inset: 0 auto auto 0;
        z-index: 2147483647;
        pointer-events: none;
        overflow: hidden;
      }

      #${OVERLAY_ID} .nlh-territory,
      #${OVERLAY_ID} .nlh-box {
        position: absolute;
        box-sizing: border-box;
      }

      #${OVERLAY_ID} .nlh-territory {
        opacity: 1;
      }

      #${OVERLAY_ID} .nlh-box {
        border-radius: 0;
        opacity: 1;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function ensureOverlay(docWidth, docHeight) {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.style.width = `${docWidth}px`;
      existing.style.height = `${docHeight}px`;
      return existing;
    }

    const root = document.body || document.documentElement;
    if (!root) {
      return null;
    }

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.width = `${docWidth}px`;
    overlay.style.height = `${docHeight}px`;
    root.appendChild(overlay);
    return overlay;
  }

  function buildModel() {
    const docWidth = Math.max(
      window.innerWidth,
      document.documentElement ? document.documentElement.scrollWidth : 0,
      document.body ? document.body.scrollWidth : 0
    );
    const docHeight = Math.max(
      window.innerHeight,
      document.documentElement ? document.documentElement.scrollHeight : 0,
      document.body ? document.body.scrollHeight : 0
    );

    const candidates = [];
    let order = 0;
    const navRects = collectNavRowRects(docWidth, docHeight);

    for (const rect of navRects) {
      candidates.push({
        rect,
        order,
        priority: 3,
        seedHint: `nav:${stableRectToken(rect)}`
      });
      order += 1;
    }

    const wrappedHeaderRects = collectWrappedHeaderRects(docWidth, docHeight);
    for (const rect of wrappedHeaderRects) {
      candidates.push({
        rect,
        order,
        priority: 2.7,
        seedHint: `wrapped:${stableRectToken(rect)}`
      });
      order += 1;
    }

    const compositeHeaderRects = collectCompositeHeaderRects(docWidth, docHeight);
    for (const rect of compositeHeaderRects) {
      candidates.push({
        rect,
        order,
        priority: 2.5,
        seedHint: `composite:${stableRectToken(rect)}`
      });
      order += 1;
    }

    for (const element of document.querySelectorAll(MEDIA_SELECTOR)) {
      if (!(element instanceof Element)) {
        continue;
      }

      const style = window.getComputedStyle(element);
      if (!isVisible(style)) {
        continue;
      }

      const rect = toAbsoluteRect(element, docWidth, docHeight);
      if (!rect || rect.width < MIN_MEDIA_WIDTH || rect.height < MIN_MEDIA_HEIGHT) {
        continue;
      }

      candidates.push({
        rect,
        order,
        priority: 2,
        seedHint: getMediaSeed(element, rect)
      });

      order += 1;
      if (candidates.length >= MAX_ELEMENTS) {
        break;
      }
    }

    if (candidates.length < MAX_ELEMENTS) {
      for (const element of document.querySelectorAll(TEXT_SELECTOR)) {
        if (!(element instanceof Element)) {
          continue;
        }

        const style = window.getComputedStyle(element);
        if (!isVisible(style)) {
          continue;
        }

        const text = getMeaningfulText(element);
        if (!text) {
          continue;
        }

        if (shouldSkipTextElement(element)) {
          continue;
        }

        const rect = toAbsoluteRect(element, docWidth, docHeight);
        const thresholds = getTextThresholds(element, text);
        if (!rect || rect.width < thresholds.minWidth || rect.height < thresholds.minHeight) {
          continue;
        }

        if (isInsideAnyRect(rect, navRects)) {
          continue;
        }

        if (isInsideAnyRect(rect, wrappedHeaderRects)) {
          continue;
        }

        if (isInsideAnyRect(rect, compositeHeaderRects)) {
          continue;
        }

        candidates.push({
          rect,
          order,
          priority: 1,
          seedHint: getTextSeed(element, text)
        });

        order += 1;
        if (candidates.length >= MAX_ELEMENTS) {
          break;
        }
      }
    }

    const boxes = dedupeBoxes(candidates).map((box, index) => ({
      ...box,
      id: index
    }));
    const { clusters, renderedBoxes } = buildClusters(boxes);
    const territories = computeTerritories(clusters, docWidth, docHeight);
    const fieldAssignments = assignFieldFamilies(clusters, territories);

    return {
      docWidth,
      docHeight,
      boxes: renderedBoxes.map((box) => {
        const field = fieldAssignments.get(box.clusterId) || getFallbackField(box.clusterSignature || stableRectToken(box.rect));
        return {
          ...box,
          color: field.family,
          variant: field.variant
        };
      }),
      territories: territories.map((territory) => {
        const field = fieldAssignments.get(territory.clusterId) || getFallbackField(territory.clusterSignature || stableRectToken(territory));
        return {
          ...territory,
          color: field.family,
          variant: field.variant
        };
      }),
      fieldStates: buildFieldStates(clusters, territories, fieldAssignments)
    };
  }

  function dedupeBoxes(boxes) {
    const ordered = [...boxes].sort((left, right) => {
      if ((right.priority || 0) !== (left.priority || 0)) {
        return (right.priority || 0) - (left.priority || 0);
      }

      const leftArea = left.rect.width * left.rect.height;
      const rightArea = right.rect.width * right.rect.height;
      if (rightArea !== leftArea) {
        return rightArea - leftArea;
      }

      return left.order - right.order;
    });
    const accepted = [];

    for (const box of ordered) {
      if (accepted.some((existing) => overlapRatio(existing.rect, box.rect) > 0.96)) {
        continue;
      }

      accepted.push(box);
    }

    return accepted;
  }

  function renderModel(model, overlay) {
    const fragment = document.createDocumentFragment();

    for (const territory of model.territories) {
      const node = document.createElement("div");
      node.className = "nlh-territory";
      node.style.left = `${territory.left}px`;
      node.style.top = `${territory.top}px`;
      node.style.width = `${territory.width}px`;
      node.style.height = `${territory.height}px`;
      applyFieldStyles(node, territory, false);
      fragment.appendChild(node);
    }

    for (const box of model.boxes) {
      const node = document.createElement("div");
      node.className = "nlh-box";
      node.style.left = `${box.rect.left}px`;
      node.style.top = `${box.rect.top}px`;
      node.style.width = `${box.rect.width}px`;
      node.style.height = `${box.rect.height}px`;
      applyFieldStyles(node, { ...box.rect, color: box.color, variant: box.variant }, true);
      fragment.appendChild(node);
    }

    isRendering = true;
    overlay.replaceChildren(fragment);
    isRendering = false;
  }

  function assignFieldFamilies(clusters, territories) {
    const assignments = new Map();
    const neighbors = buildTerritoryNeighborMap(clusters, territories);
    const usedPreviousIndexes = new Set();
    const orderedClusters = [...clusters].sort((left, right) => {
      if ((right.priority || 0) !== (left.priority || 0)) {
        return (right.priority || 0) - (left.priority || 0);
      }

      const leftArea = left.rect.width * left.rect.height;
      const rightArea = right.rect.width * right.rect.height;
      if (rightArea !== leftArea) {
        return rightArea - leftArea;
      }

      return left.signature.localeCompare(right.signature);
    });

    for (const cluster of orderedClusters) {
      const previous = findPreviousFieldAssignment(cluster, usedPreviousIndexes);
      if (previous) {
        assignments.set(cluster.id, previous.assignment);
        fieldAssignmentCache.set(cluster.signature, previous.assignment);
        usedPreviousIndexes.add(previous.index);
        continue;
      }

      const cached = fieldAssignmentCache.get(cluster.signature);
      if (cached) {
        assignments.set(cluster.id, cached);
        continue;
      }

      const neighborFamilies = new Set(
        [...(neighbors.get(cluster.id) || [])]
          .map((neighborId) => assignments.get(neighborId)?.family)
          .filter(Boolean)
      );

      const preferredFamilies = getPreferredFamilies(cluster.signature);
      let family = preferredFamilies.find((candidate) => !neighborFamilies.has(candidate));

      if (!family) {
        family = preferredFamilies
          .map((candidate) => ({
            family: candidate,
            conflicts: countFamilyConflicts(candidate, neighbors.get(cluster.id), assignments)
          }))
          .sort((left, right) => left.conflicts - right.conflicts || preferredFamilies.indexOf(left.family) - preferredFamilies.indexOf(right.family))[0].family;
      }

      const assignment = {
        family,
        variant: hashString(`${cluster.signature}:${family}:variant`) % 4
      };
      assignments.set(cluster.id, assignment);
      fieldAssignmentCache.set(cluster.signature, assignment);
    }

    return assignments;
  }

  function findPreviousFieldAssignment(cluster, usedPreviousIndexes) {
    let best = null;

    for (let index = 0; index < previousFieldStates.length; index += 1) {
      if (usedPreviousIndexes.has(index)) {
        continue;
      }

      const previous = previousFieldStates[index];
      const sameSignature = previous.signature === cluster.signature;
      const overlap = rectOverlapScore(cluster.rect, previous.rect);
      if (!sameSignature && overlap < 0.38) {
        continue;
      }

      const distance = rectCenterDistance(cluster.rect, previous.rect);
      const score = (sameSignature ? 2 : 0) + overlap - distance / 5000;

      if (!best || score > best.score) {
        best = {
          index,
          score,
          assignment: {
            family: previous.family,
            variant: previous.variant
          }
        };
      }
    }

    return best;
  }

  function buildTerritoryNeighborMap(clusters, territories) {
    const neighbors = new Map(clusters.map((cluster) => [cluster.id, new Set()]));

    for (let index = 0; index < territories.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < territories.length; compareIndex += 1) {
        const left = territories[index];
        const right = territories[compareIndex];
        if (left.clusterId === right.clusterId) {
          continue;
        }

        if (!areTerritoriesAdjacent(left, right)) {
          continue;
        }

        neighbors.get(left.clusterId)?.add(right.clusterId);
        neighbors.get(right.clusterId)?.add(left.clusterId);
      }
    }

    return neighbors;
  }

  function areTerritoriesAdjacent(left, right) {
    const horizontalGap = left.left > right.right
      ? left.left - right.right
      : right.left > left.right
        ? right.left - left.right
        : 0;
    const verticalGap = left.top > right.bottom
      ? left.top - right.bottom
      : right.top > left.bottom
        ? right.top - left.bottom
        : 0;
    const horizontalOverlap = overlapLength(left.left, left.right, right.left, right.right);
    const verticalOverlap = overlapLength(left.top, left.bottom, right.top, right.bottom);

    if (horizontalOverlap > 0 && verticalGap <= TERRITORY_ADJACENCY_GAP) {
      return true;
    }

    if (verticalOverlap > 0 && horizontalGap <= TERRITORY_ADJACENCY_GAP) {
      return true;
    }

    return false;
  }

  function getPreferredFamilies(signature) {
    const start = hashString(`${signature}:family`) % FAMILY_KEYS.length;
    return FAMILY_KEYS.map((_, index) => FAMILY_KEYS[(start + index) % FAMILY_KEYS.length]);
  }

  function countFamilyConflicts(family, neighborIds, assignments) {
    if (!neighborIds) {
      return 0;
    }

    let conflicts = 0;
    for (const neighborId of neighborIds) {
      if (assignments.get(neighborId)?.family === family) {
        conflicts += 1;
      }
    }
    return conflicts;
  }

  function getFallbackField(signature) {
    const family = FAMILY_KEYS[hashString(`${signature}:fallback`) % FAMILY_KEYS.length];
    return {
      family,
      variant: hashString(`${signature}:${family}:variant`) % 4
    };
  }

  function buildFieldStates(clusters, territories, fieldAssignments) {
    return clusters.map((cluster) => {
      const owned = territories.filter((territory) => territory.clusterId === cluster.id);
      const rect = owned.length
        ? unionRects(owned.map((territory) => ({
          left: territory.left,
          top: territory.top,
          right: territory.right,
          bottom: territory.bottom,
          width: territory.width,
          height: territory.height
        })))
        : cluster.rect;
      const assignment = fieldAssignments.get(cluster.id) || getFallbackField(cluster.signature);

      return {
        signature: cluster.signature,
        rect,
        family: assignment.family,
        variant: assignment.variant
      };
    });
  }

  function applyFieldStyles(node, rect, isCore) {
    const family = TULIP_PALETTES[rect.color] || TULIP_PALETTES.red;
    const variant = rect.variant || 0;
    const density = isCore ? CORE_TULIP_COUNT : TERRITORY_TULIP_COUNT;
    const flowerPattern = getFlowerPattern(rect.color, variant, density);

    node.style.backgroundColor = family.bed;
    node.style.backgroundImage = `${flowerPattern}, ${getCorridorGradient()}`;
    node.style.backgroundSize = `${FLOWER_TILE_WIDTH}px ${FLOWER_TILE_HEIGHT}px, ${STRIPE_PITCH}px 100%`;
    node.style.backgroundRepeat = "repeat, repeat";
    node.style.backgroundPosition = `${-rect.left}px ${-rect.top}px, ${-rect.left}px 0px`;
  }

  function getCorridorGradient() {
    const bedWidth = STRIPE_PITCH - CORRIDOR_WIDTH;
    return `repeating-linear-gradient(90deg, transparent 0 ${bedWidth}px, ${SOIL_COLOR} ${bedWidth}px ${STRIPE_PITCH}px)`;
  }

  function getFlowerPattern(familyKey, variant, density) {
    const cacheKey = `${familyKey}:${variant}:${density}`;
    if (patternCache.has(cacheKey)) {
      return patternCache.get(cacheKey);
    }

    const family = TULIP_PALETTES[familyKey] || TULIP_PALETTES.red;
    const seed = hashString(cacheKey);
    const random = createRandom(seed);
    const bedWidth = STRIPE_PITCH - CORRIDOR_WIDTH;
    const laneCount = Math.floor(FLOWER_TILE_WIDTH / STRIPE_PITCH);
    const marks = [];

    for (let index = 0; index < density; index += 1) {
      const lane = Math.floor(random() * laneCount);
      const x = lane * STRIPE_PITCH + 2 + random() * Math.max(1, bedWidth - 4);
      const y = random() * FLOWER_TILE_HEIGHT;
      const petal = family.petals[Math.floor(random() * family.petals.length)];
      const leaf = LEAF_SHADES[Math.floor(random() * LEAF_SHADES.length)];
      const rx = 1.6 + random() * 0.9;
      const ry = 1.7 + random() * 1.0;
      const angle = Math.round(-28 + random() * 56);

      marks.push(
        `<ellipse cx="${(x - 0.8).toFixed(2)}" cy="${(y + 1.0).toFixed(2)}" rx="${(0.9 + random() * 0.6).toFixed(2)}" ry="${(2.1 + random() * 1.2).toFixed(2)}" fill="${leaf}" transform="rotate(${angle} ${(x - 0.8).toFixed(2)} ${(y + 1.0).toFixed(2)})"/>`
      );

      if (random() > 0.35) {
        marks.push(
          `<ellipse cx="${(x + 0.7).toFixed(2)}" cy="${(y + 0.8).toFixed(2)}" rx="${(0.9 + random() * 0.6).toFixed(2)}" ry="${(2.0 + random() * 1.0).toFixed(2)}" fill="${leaf}" transform="rotate(${Math.round(-40 + random() * 80)} ${(x + 0.7).toFixed(2)} ${(y + 0.8).toFixed(2)})"/>`
        );
      }

      marks.push(
        `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="${petal}" transform="rotate(${angle} ${x.toFixed(2)} ${y.toFixed(2)})"/>`
      );

      if (random() > 0.42) {
        marks.push(
          `<ellipse cx="${(x + 0.9).toFixed(2)}" cy="${(y + 0.3).toFixed(2)}" rx="${(1.2 + random() * 0.8).toFixed(2)}" ry="${(1.4 + random() * 0.8).toFixed(2)}" fill="${petal}" transform="rotate(${Math.round(-20 + random() * 40)} ${(x + 0.9).toFixed(2)} ${(y + 0.3).toFixed(2)})"/>`
        );
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${FLOWER_TILE_WIDTH}" height="${FLOWER_TILE_HEIGHT}" viewBox="0 0 ${FLOWER_TILE_WIDTH} ${FLOWER_TILE_HEIGHT}">${marks.join("")}</svg>`;
    const uri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    patternCache.set(cacheKey, uri);
    return uri;
  }

  function createRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function stableRectToken(rect) {
    return [
      Math.round(rect.left / POSITION_BUCKET),
      Math.round(rect.top / POSITION_BUCKET),
      Math.round(rect.width / SIZE_BUCKET),
      Math.round(rect.height / SIZE_BUCKET)
    ].join(":");
  }

  function getMediaSeed(element, rect) {
    const tagName = element.tagName.toLowerCase();
    const source = element.getAttribute("src") ||
      element.getAttribute("srcset") ||
      element.getAttribute("data-src") ||
      element.getAttribute("poster") ||
      element.getAttribute("aria-label") ||
      element.getAttribute("alt") ||
      "";
    if (source) {
      return `media:${tagName}:${source.slice(0, 128)}`;
    }

    return `media:${tagName}:rect:${stableRectToken(rect)}`;
  }

  function getTextSeed(element, text) {
    const tagName = element.tagName.toLowerCase();
    return `text:${tagName}:${text.slice(0, 96).toLowerCase()}`;
  }

  function buildClusters(boxes) {
    const rootByBoxId = new Map();
    const boxesById = new Map(boxes.map((box) => [box.id, box]));

    for (const box of boxes) {
      const target = findAbsorbTarget(box, boxes);
      if (target) {
        rootByBoxId.set(box.id, target.id);
      }
    }

    const clustersById = new Map();

    for (const box of boxes) {
      const rootId = rootByBoxId.get(box.id) ?? box.id;
      if (!clustersById.has(rootId)) {
        const rootBox = boxesById.get(rootId) || box;
        clustersById.set(rootId, {
          id: rootId,
          priority: rootBox.priority || 0,
          boxes: []
        });
      }

      clustersById.get(rootId).boxes.push(box);
    }

    const clusters = [];

    for (const cluster of clustersById.values()) {
      cluster.rect = unionRects(cluster.boxes.map((box) => box.rect));
      cluster.signature = buildClusterSignature(cluster);
      clusters.push(cluster);
    }

    const renderedBoxes = boxes
      .filter((box) => !rootByBoxId.has(box.id))
      .map((box) => {
        const cluster = clustersById.get(box.id);
        return {
          ...box,
          clusterId: cluster ? cluster.id : box.id,
          clusterSignature: cluster ? cluster.signature : buildStandaloneBoxSignature(box)
        };
      });

    return { clusters, renderedBoxes };
  }

  function findAbsorbTarget(box, boxes) {
    if (!isMicroBox(box)) {
      return null;
    }

    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    const boxArea = box.rect.width * box.rect.height;

    for (const candidate of boxes) {
      if (candidate.id === box.id) {
        continue;
      }

      if (isMicroBox(candidate)) {
        continue;
      }

      const candidateArea = candidate.rect.width * candidate.rect.height;
      if (candidateArea <= boxArea * 1.6) {
        continue;
      }

      const score = absorptionScore(box.rect, candidate.rect);
      if (score === null || score > ABSORB_MAX_GAP) {
        continue;
      }

      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    return best;
  }

  function isMicroBox(box) {
    if ((box.priority || 0) >= 2) {
      return false;
    }

    const area = box.rect.width * box.rect.height;
    return box.rect.height <= MICRO_MAX_HEIGHT &&
      box.rect.width <= MICRO_MAX_WIDTH &&
      area <= MICRO_MAX_AREA;
  }

  function absorptionScore(source, target) {
    const horizontalOverlap = overlapLength(source.left, source.right, target.left, target.right);
    const verticalOverlap = overlapLength(source.top, source.bottom, target.top, target.bottom);
    const horizontalRatio = horizontalOverlap / Math.max(1, Math.min(source.width, target.width));
    const verticalRatio = verticalOverlap / Math.max(1, Math.min(source.height, target.height));

    const verticalGap = source.top > target.bottom
      ? source.top - target.bottom
      : target.top > source.bottom
        ? target.top - source.bottom
        : 0;

    const horizontalGap = source.left > target.right
      ? source.left - target.right
      : target.left > source.right
        ? target.left - source.right
        : 0;

    let best = Number.POSITIVE_INFINITY;

    if (horizontalRatio >= ABSORB_MIN_OVERLAP_RATIO) {
      best = Math.min(best, verticalGap);
    }

    if (verticalRatio >= ABSORB_MIN_OVERLAP_RATIO) {
      best = Math.min(best, horizontalGap);
    }

    if (!Number.isFinite(best)) {
      return null;
    }

    return best;
  }

  function unionRects(rects) {
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));

    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top
    };
  }

  function buildClusterSignature(cluster) {
    const orderedBoxes = [...cluster.boxes].sort((left, right) => {
      if ((right.priority || 0) !== (left.priority || 0)) {
        return (right.priority || 0) - (left.priority || 0);
      }

      const leftArea = left.rect.width * left.rect.height;
      const rightArea = right.rect.width * right.rect.height;
      return rightArea - leftArea;
    });
    const parts = [];
    const seen = new Set();

    for (const box of orderedBoxes) {
      const token = box.seedHint || `rect:${stableRectToken(box.rect)}`;
      if (seen.has(token)) {
        continue;
      }

      if (isMicroBox(box) && parts.length >= 1) {
        continue;
      }

      seen.add(token);
      parts.push(token);
      if (parts.length >= 3) {
        break;
      }
    }

    if (!parts.length) {
      parts.push(`rect:${stableRectToken(cluster.rect)}`);
    }

    return `${parts.join("|")}:p${Math.round((cluster.priority || 0) * 10)}`;
  }

  function buildStandaloneBoxSignature(box) {
    return `${box.seedHint || `rect:${stableRectToken(box.rect)}`}:p${Math.round((box.priority || 0) * 10)}`;
  }

  function computeTerritories(clusters, docWidth, docHeight) {
    const territories = clusters.map((box) => {
      const leftNeighbor = findClosestNeighbor(box, clusters, "left");
      const rightNeighbor = findClosestNeighbor(box, clusters, "right");
      const topNeighbor = findClosestNeighbor(box, clusters, "top");
      const bottomNeighbor = findClosestNeighbor(box, clusters, "bottom");

      let left = box.rect.left;
      let right = box.rect.right;
      let top = box.rect.top;
      let bottom = box.rect.bottom;

      if (leftNeighbor) {
        left = computeBoundary(leftNeighbor, box, "horizontal");
      } else if (left <= EDGE_CLAIM_THRESHOLD) {
        left = 0;
      } else {
        left = Math.max(0, left - SOFT_EXPANSION_PX);
      }

      if (rightNeighbor) {
        right = computeBoundary(box, rightNeighbor, "horizontal");
      } else if (docWidth - right <= EDGE_CLAIM_THRESHOLD) {
        right = docWidth;
      } else {
        right = Math.min(docWidth, right + SOFT_EXPANSION_PX);
      }

      if (topNeighbor) {
        top = computeBoundary(topNeighbor, box, "vertical");
      } else if (top <= EDGE_CLAIM_THRESHOLD) {
        top = 0;
      } else {
        top = Math.max(0, top - SOFT_EXPANSION_PX);
      }

      if (bottomNeighbor) {
        bottom = computeBoundary(box, bottomNeighbor, "vertical");
      } else if (docHeight - bottom <= EDGE_CLAIM_THRESHOLD) {
        bottom = docHeight;
      } else {
        bottom = Math.min(docHeight, bottom + SOFT_EXPANSION_PX);
      }

      const width = Math.max(box.rect.width, right - left);
      const height = Math.max(box.rect.height, bottom - top);

      return {
        clusterId: box.id,
        clusterSignature: box.signature,
        left,
        top,
        right,
        bottom,
        width,
        height
      };
    });

    return fillLeftoverTerritories(territories, clusters, docWidth, docHeight);
  }

  function findClosestNeighbor(box, boxes, side) {
    let best = null;
    let bestGap = Number.POSITIVE_INFINITY;

    for (const other of boxes) {
      if (other === box) {
        continue;
      }

      if (side === "left") {
        if (other.rect.right > box.rect.left || !hasAxisAffinity(other.rect, box.rect, "horizontal")) {
          continue;
        }

        const gap = box.rect.left - other.rect.right;
        if (gap < bestGap) {
          best = other;
          bestGap = gap;
        }
      } else if (side === "right") {
        if (other.rect.left < box.rect.right || !hasAxisAffinity(box.rect, other.rect, "horizontal")) {
          continue;
        }

        const gap = other.rect.left - box.rect.right;
        if (gap < bestGap) {
          best = other;
          bestGap = gap;
        }
      } else if (side === "top") {
        if (other.rect.bottom > box.rect.top || !hasAxisAffinity(other.rect, box.rect, "vertical")) {
          continue;
        }

        const gap = box.rect.top - other.rect.bottom;
        if (gap < bestGap) {
          best = other;
          bestGap = gap;
        }
      } else if (side === "bottom") {
        if (other.rect.top < box.rect.bottom || !hasAxisAffinity(box.rect, other.rect, "vertical")) {
          continue;
        }

        const gap = other.rect.top - box.rect.bottom;
        if (gap < bestGap) {
          best = other;
          bestGap = gap;
        }
      }
    }

    return best;
  }

  function hasAxisAffinity(leftRect, rightRect, axis) {
    if (axis === "horizontal") {
      const overlap = overlapLength(leftRect.top, leftRect.bottom, rightRect.top, rightRect.bottom);
      const minSpan = Math.max(1, Math.min(leftRect.height, rightRect.height));
      if (overlap / minSpan >= MIN_PERP_OVERLAP_RATIO) {
        return true;
      }

      const centerDiff = Math.abs(centerOf(leftRect.top, leftRect.bottom) - centerOf(rightRect.top, rightRect.bottom));
      return centerDiff <= Math.max(leftRect.height, rightRect.height) * CENTER_ALIGN_RATIO;
    }

    const overlap = overlapLength(leftRect.left, leftRect.right, rightRect.left, rightRect.right);
    const minSpan = Math.max(1, Math.min(leftRect.width, rightRect.width));
    if (overlap / minSpan >= MIN_PERP_OVERLAP_RATIO) {
      return true;
    }

    const centerDiff = Math.abs(centerOf(leftRect.left, leftRect.right) - centerOf(rightRect.left, rightRect.right));
    return centerDiff <= Math.max(leftRect.width, rightRect.width) * CENTER_ALIGN_RATIO;
  }

  function computeBoundary(leftBox, rightBox, axis) {
    const leftWeight = getExpansionWeight(leftBox);
    const rightWeight = getExpansionWeight(rightBox);
    const weightSum = leftWeight + rightWeight;

    if (axis === "horizontal") {
      const gap = Math.max(0, rightBox.rect.left - leftBox.rect.right);
      return leftBox.rect.right + gap * (leftWeight / weightSum);
    }

    const gap = Math.max(0, rightBox.rect.top - leftBox.rect.bottom);
    return leftBox.rect.bottom + gap * (leftWeight / weightSum);
  }

  function getExpansionWeight(box) {
    if ((box.priority || 0) >= 3) {
      return 1.15;
    }

    if ((box.priority || 0) === 2) {
      return 1.25;
    }

    return 1;
  }

  function fillLeftoverTerritories(territories, clusters, docWidth, docHeight) {
    if (!territories.length) {
      return territories;
    }

    const columns = Math.max(1, Math.ceil(docWidth / GRID_SIZE));
    const rows = Math.max(1, Math.ceil(docHeight / GRID_SIZE));
    const coverage = Array.from({ length: rows }, () => Array(columns).fill(-1));

    territories.forEach((territory, index) => {
      const left = Math.max(0, Math.floor(territory.left / GRID_SIZE));
      const right = Math.min(columns - 1, Math.ceil(territory.right / GRID_SIZE) - 1);
      const top = Math.max(0, Math.floor(territory.top / GRID_SIZE));
      const bottom = Math.min(rows - 1, Math.ceil(territory.bottom / GRID_SIZE) - 1);

      for (let row = top; row <= bottom; row += 1) {
        for (let col = left; col <= right; col += 1) {
          coverage[row][col] = index;
        }
      }
    });

    const visited = Array.from({ length: rows }, () => Array(columns).fill(false));
    const extraTerritories = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        if (visited[row][col] || coverage[row][col] !== -1) {
          continue;
        }

        const component = collectLeftoverComponent(row, col, coverage, visited, rows, columns);
        if (component.cells.length < MIN_LEFTOVER_CELLS) {
          continue;
        }

        const assignedCluster = findNearestClusterForComponent(component, clusters);
        if (!assignedCluster) {
          continue;
        }

        const rect = componentToRect(component, docWidth, docHeight);
        extraTerritories.push({
          ...rect,
          clusterId: assignedCluster.id,
          clusterSignature: assignedCluster.signature
        });
      }
    }

    return territories.concat(extraTerritories);
  }

  function collectLeftoverComponent(startRow, startCol, coverage, visited, rows, columns) {
    const queue = [[startRow, startCol]];
    const cells = [];
    let minRow = startRow;
    let maxRow = startRow;
    let minCol = startCol;
    let maxCol = startCol;
    visited[startRow][startCol] = true;

    while (queue.length) {
      const [row, col] = queue.shift();
      cells.push([row, col]);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);

      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
      ];

      for (const [nextRow, nextCol] of neighbors) {
        if (
          nextRow < 0 ||
          nextRow >= rows ||
          nextCol < 0 ||
          nextCol >= columns ||
          visited[nextRow][nextCol] ||
          coverage[nextRow][nextCol] !== -1
        ) {
          continue;
        }

        visited[nextRow][nextCol] = true;
        queue.push([nextRow, nextCol]);
      }
    }

    return { cells, minRow, maxRow, minCol, maxCol };
  }

  function findNearestClusterForComponent(component, clusters) {
    const centerX = (component.minCol + component.maxCol + 1) * GRID_SIZE / 2;
    const centerY = (component.minRow + component.maxRow + 1) * GRID_SIZE / 2;
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const cluster of clusters) {
      const score = weightedDistanceToRect(centerX, centerY, cluster.rect, getExpansionWeight(cluster));
      if (score < bestScore) {
        best = cluster;
        bestScore = score;
      }
    }

    return best;
  }

  function componentToRect(component, docWidth, docHeight) {
    const left = clamp(component.minCol * GRID_SIZE, 0, docWidth);
    const top = clamp(component.minRow * GRID_SIZE, 0, docHeight);
    const right = clamp((component.maxCol + 1) * GRID_SIZE, 0, docWidth);
    const bottom = clamp((component.maxRow + 1) * GRID_SIZE, 0, docHeight);

    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top
    };
  }

  function weightedDistanceToRect(x, y, rect, weight) {
    const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
    const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
    return Math.sqrt(dx * dx + dy * dy) / Math.max(weight, 0.1);
  }

  function collectNavRowRects(docWidth, docHeight) {
    const containers = new Set();

    for (const interactive of document.querySelectorAll("a, button")) {
      if (!(interactive instanceof Element)) {
        continue;
      }

      if (interactive.parentElement) {
        containers.add(interactive.parentElement);
      }

      if (interactive.parentElement && interactive.parentElement.parentElement) {
        containers.add(interactive.parentElement.parentElement);
      }
    }

    const rects = [];

    for (const container of containers) {
      if (!(container instanceof Element)) {
        continue;
      }

      const style = window.getComputedStyle(container);
      if (!isVisible(style)) {
        continue;
      }

      const items = collectAlignedNavItems(container);
      if (items.length < NAV_MIN_ITEMS || items.length > NAV_MAX_ITEMS) {
        continue;
      }

      const rowRect = getNavRowRect(items, docWidth, docHeight);
      if (!rowRect || rowRect.width < NAV_MIN_WIDTH || rowRect.height > NAV_MAX_HEIGHT) {
        continue;
      }

      rects.push(rowRect);
    }

    return dedupeRects(rects);
  }

  function collectCompositeHeaderRects(docWidth, docHeight) {
    const rects = [];

    for (const heading of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
      if (!(heading instanceof Element)) {
        continue;
      }

      const style = window.getComputedStyle(heading);
      if (!isVisible(style)) {
        continue;
      }

      const rect = toAbsoluteRect(heading, docWidth, docHeight);
      if (!rect || rect.width < MIN_TEXT_WIDTH || rect.height < MIN_TEXT_HEIGHT) {
        continue;
      }

      const rootRect = findCompositeHeaderRoot(heading, rect, docWidth, docHeight);
      if (rootRect) {
        rects.push(rootRect);
      }
    }

    return dedupeRects(rects);
  }

  function collectWrappedHeaderRects(docWidth, docHeight) {
    const rects = [];

    for (const element of document.querySelectorAll("a,button")) {
      if (!(element instanceof Element)) {
        continue;
      }

      if (!isVisible(window.getComputedStyle(element))) {
        continue;
      }

      const heading = element.querySelector("h1,h2,h3,h4,h5,h6");
      if (!(heading instanceof Element) || countHeadingDescendants(element) !== 1) {
        continue;
      }

      if (hasBlockingMediaDescendant(element)) {
        continue;
      }

      const headingRect = toAbsoluteRect(heading, docWidth, docHeight);
      const wrapperRect = toAbsoluteRect(element, docWidth, docHeight);
      if (!headingRect || !wrapperRect) {
        continue;
      }

      if (
        wrapperRect.width <= headingRect.width ||
        wrapperRect.height < headingRect.height ||
        wrapperRect.width > Math.max(headingRect.width * WRAPPED_HEADER_WIDTH_RATIO, headingRect.width + WRAPPED_HEADER_MAX_GROWTH) ||
        wrapperRect.height > Math.max(headingRect.height * WRAPPED_HEADER_HEIGHT_RATIO, headingRect.height + COMPOSITE_MAX_HEIGHT_GROWTH)
      ) {
        continue;
      }

      const text = element.textContent ? element.textContent.replace(/\s+/g, " ").trim() : "";
      if (!text || text.length > MAX_TEXT_LENGTH + 120) {
        continue;
      }

      rects.push(wrapperRect);
    }

    return dedupeRects(rects);
  }

  function findCompositeHeaderRoot(heading, headingRect, docWidth, docHeight) {
    let best = null;
    let current = heading.parentElement;
    let steps = 0;

    while (current && steps < COMPOSITE_MAX_STEPS) {
      if (!(current instanceof Element)) {
        break;
      }

      if (!isVisible(window.getComputedStyle(current))) {
        break;
      }

      if (countHeadingDescendants(current) !== 1) {
        current = current.parentElement;
        steps += 1;
        continue;
      }

      if (hasBlockingMediaDescendant(current)) {
        break;
      }

      const rect = toAbsoluteRect(current, docWidth, docHeight);
      if (!rect) {
        current = current.parentElement;
        steps += 1;
        continue;
      }

      if (
        rect.width <= headingRect.width ||
        rect.height < headingRect.height ||
        rect.width > Math.max(headingRect.width * COMPOSITE_WIDTH_RATIO, headingRect.width + COMPOSITE_MAX_WIDTH_GROWTH) ||
        rect.height > Math.max(headingRect.height * COMPOSITE_HEIGHT_RATIO, headingRect.height + COMPOSITE_MAX_HEIGHT_GROWTH)
      ) {
        current = current.parentElement;
        steps += 1;
        continue;
      }

      const text = current.textContent ? current.textContent.replace(/\s+/g, " ").trim() : "";
      if (!text || text.length > MAX_TEXT_LENGTH + 120) {
        current = current.parentElement;
        steps += 1;
        continue;
      }

      best = rect;
      current = current.parentElement;
      steps += 1;
    }

    return best;
  }

  function collectAlignedNavItems(container) {
    const items = [];

    for (const item of container.querySelectorAll("a, button")) {
      if (!(item instanceof Element)) {
        continue;
      }

      const style = window.getComputedStyle(item);
      if (!isVisible(style)) {
        continue;
      }

      const text = item.textContent ? item.textContent.trim() : "";
      if (!text) {
        continue;
      }

      const rect = item.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        continue;
      }

      items.push({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom
      });
    }

    if (items.length < NAV_MIN_ITEMS) {
      return [];
    }

    items.sort((left, right) => left.left - right.left);
    const baseline = items[0].top;
    return items.filter((item) => Math.abs(item.top - baseline) <= NAV_ALIGNMENT_TOLERANCE);
  }

  function getNavRowRect(items, docWidth, docHeight) {
    const left = clamp(Math.min(...items.map((item) => item.left)) - NAV_PADDING_X + window.scrollX, 0, docWidth);
    const top = clamp(Math.min(...items.map((item) => item.top)) - NAV_PADDING_Y + window.scrollY, 0, docHeight);
    const right = clamp(Math.max(...items.map((item) => item.right)) + NAV_PADDING_X + window.scrollX, 0, docWidth);
    const bottom = clamp(Math.max(...items.map((item) => item.bottom)) + NAV_PADDING_Y + window.scrollY, 0, docHeight);
    const width = right - left;
    const height = bottom - top;

    if (width <= 0 || height <= 0) {
      return null;
    }

    return { left, top, right, bottom, width, height };
  }

  function dedupeRects(rects) {
    const accepted = [];

    for (const rect of rects) {
      if (accepted.some((existing) => overlapRatio(existing, rect) > 0.96)) {
        continue;
      }

      accepted.push(rect);
    }

    return accepted;
  }

  function shouldSkipTextElement(element) {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent ? element.textContent.replace(/\s+/g, " ").trim() : "";

    if ((tagName === "a" || tagName === "button") && element.querySelector("h1,h2,h3,h4,h5,h6,p,figcaption")) {
      return true;
    }

    if (element.querySelector("img,svg,figure,object")) {
      return true;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return true;
    }

    if ((tagName === "div" || tagName === "span" || tagName === "li") && hasBlockingLargeChildren(element, text)) {
      return true;
    }

    if (tagName === "a" || tagName === "button") {
      return text.length < MIN_TEXT_LENGTH;
    }

    return false;
  }

  function getMeaningfulText(element) {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent ? element.textContent.replace(/\s+/g, " ").trim() : "";

    if (!text) {
      return "";
    }

    if (tagName === "a" || tagName === "button") {
      return text.length >= MIN_TEXT_LENGTH ? text : "";
    }

    if (tagName === "time") {
      return text.length >= MIN_META_TEXT_LENGTH ? text : "";
    }

    if (tagName === "span" || tagName === "div" || tagName === "li") {
      return isMetadataLike(text) || isTagLike(element, text) || text.length >= MIN_TEXT_LENGTH ? text : "";
    }

    return text;
  }

  function getTextThresholds(element, text) {
    const tagName = element.tagName.toLowerCase();

    if (isHeadingTag(tagName)) {
      return {
        minWidth: MIN_HEADING_WIDTH,
        minHeight: MIN_HEADING_HEIGHT
      };
    }

    if (isCompactTextLike(element, text)) {
      return {
        minWidth: MIN_TAG_WIDTH,
        minHeight: MIN_TAG_HEIGHT
      };
    }

    return {
      minWidth: MIN_TEXT_WIDTH,
      minHeight: MIN_TEXT_HEIGHT
    };
  }

  function isCompactTextLike(element, text) {
    const tagName = element.tagName.toLowerCase();
    return tagName === "time" || isMetadataLike(text) || isTagLike(element, text);
  }

  function hasLargeBlockChild(element) {
    for (const child of element.children) {
      if (!(child instanceof Element)) {
        continue;
      }

      const rect = child.getBoundingClientRect();
      if (rect.width >= 40 && rect.height >= 18) {
        return true;
      }
    }

    return false;
  }

  function hasBlockingLargeChildren(element, text) {
    const largeChildren = [];

    for (const child of element.children) {
      if (!(child instanceof Element)) {
        continue;
      }

      const rect = child.getBoundingClientRect();
      if (rect.width >= 40 && rect.height >= 18) {
        largeChildren.push(child);
      }
    }

    if (!largeChildren.length) {
      return false;
    }

    if (largeChildren.length === 1) {
      const childText = largeChildren[0].textContent ? largeChildren[0].textContent.replace(/\s+/g, " ").trim() : "";
      if (childText && childText === text) {
        return false;
      }
    }

    return true;
  }

  function countHeadingDescendants(element) {
    return element.querySelectorAll("h1,h2,h3,h4,h5,h6").length;
  }

  function hasBlockingMediaDescendant(element) {
    if (element.querySelector("img,figure,object")) {
      return true;
    }

    for (const svg of element.querySelectorAll("svg")) {
      const rect = svg.getBoundingClientRect();
      if (rect.width >= 48 || rect.height >= 48) {
        return true;
      }
    }

    return false;
  }

  function isMetadataLike(text) {
    return /\b\d+\s*(?:mins?|minutes?|hrs?|hours?|days?)\s+ago\b/i.test(text) ||
      /\b(updated|live|world|europe|politics|business|technology|health|culture|arts|travel|audio|video)\b/i.test(text) ||
      /[|•]/.test(text);
  }

  function isTagLike(element, text) {
    if (text.length < MIN_META_TEXT_LENGTH || text.length > MAX_TAG_TEXT_LENGTH) {
      return false;
    }

    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length || words.length > MAX_TAG_WORDS) {
      return false;
    }

    if (/[.!?]/.test(text)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.height > MICRO_MAX_HEIGHT || rect.width > MICRO_MAX_WIDTH * 1.4) {
      return false;
    }

    if (hasBlockingMediaDescendant(element)) {
      return false;
    }

    return hasDecorativeChild(element) || looksLikeCategoryWords(words);
  }

  function hasDecorativeChild(element) {
    for (const child of element.children) {
      if (!(child instanceof Element)) {
        continue;
      }

      const text = child.textContent ? child.textContent.replace(/\s+/g, " ").trim() : "";
      if (text) {
        continue;
      }

      const rect = child.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return true;
      }
    }

    return false;
  }

  function looksLikeCategoryWords(words) {
    return words.every((word) => /^[A-Z][A-Za-z&-]*$/.test(word) || /^[A-Z]+$/.test(word));
  }

  function isHeadingTag(tagName) {
    return /^h[1-6]$/.test(tagName);
  }

  function isOverlayMutation(mutation, overlay) {
    const target = mutation.target instanceof Node ? mutation.target : null;
    if (target && (target === overlay || overlay.contains(target))) {
      return true;
    }

    for (const node of mutation.addedNodes) {
      if (node === overlay || (node instanceof Node && overlay.contains(node))) {
        return true;
      }
    }

    return false;
  }

  function isInsideAnyRect(rect, rects) {
    return rects.some((candidate) => overlapRatio(candidate, rect) > 0.96);
  }

  function isMediaLike(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName === "img" || tagName === "svg" || tagName === "figure" || tagName === "object";
  }

  function toAbsoluteRect(element, docWidth, docHeight) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const left = clamp(rect.left + window.scrollX, 0, docWidth);
    const top = clamp(rect.top + window.scrollY, 0, docHeight);
    const right = clamp(rect.right + window.scrollX, 0, docWidth);
    const bottom = clamp(rect.bottom + window.scrollY, 0, docHeight);
    const width = right - left;
    const height = bottom - top;

    if (width <= 0 || height <= 0) {
      return null;
    }

    return { left, top, right, bottom, width, height };
  }

  function isVisible(style) {
    return !(
      style.display === "none" ||
      style.display === "contents" ||
      style.visibility === "hidden" ||
      Number.parseFloat(style.opacity || "1") < 0.05
    );
  }

  function overlapLength(startA, endA, startB, endB) {
    return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
  }

  function centerOf(start, end) {
    return (start + end) / 2;
  }

  function overlapRatio(left, right) {
    const overlapWidth = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
    const overlapHeight = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
    const overlapArea = overlapWidth * overlapHeight;

    if (!overlapArea) {
      return 0;
    }

    const smallerArea = Math.min(left.width * left.height, right.width * right.height);
    return overlapArea / smallerArea;
  }

  function rectOverlapScore(left, right) {
    const overlapWidth = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
    const overlapHeight = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
    const overlapArea = overlapWidth * overlapHeight;
    if (!overlapArea) {
      return 0;
    }

    const unionArea = left.width * left.height + right.width * right.height - overlapArea;
    return overlapArea / Math.max(1, unionArea);
  }

  function rectCenterDistance(left, right) {
    const leftCenterX = centerOf(left.left, left.right);
    const leftCenterY = centerOf(left.top, left.bottom);
    const rightCenterX = centerOf(right.left, right.right);
    const rightCenterY = centerOf(right.top, right.bottom);
    const dx = leftCenterX - rightCenterX;
    const dy = leftCenterY - rightCenterY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
