function initJourney(container) {
    // jeśli canvas już istnieje, nie twórz nowego
    if (document.getElementById("renderCanvas")) {
        console.warn("Journey is already initialized.");
        return;
    }

    // ======= CANVAS =======
    const canvas = document.createElement("canvas");
    canvas.id = "renderCanvas";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.display = "block";
    canvas.style.touchAction = "none";

    // zamiast document.body, wstaw do container
    container.appendChild(canvas);

// ======= HUD =======
const hud = document.createElement("div");
hud.id = "hud";
hud.innerHTML = `
  <div>X: <input type="number" id="xInput" value="0">
      Y: <input type="number" id="yInput" value="0">
      Z: <input type="number" id="zInput" value="0">
  </div>
  <div style="height:0.5px; background:#102b56; margin:0.5rem 0; border-radius:4px;"></div>
  <div class="field">
    <label for="coordInput">Koordynaty:</label>
    <input id="coordInput" type="text">
  </div>
  <div class="field">
    <label for="nameInput">Nazwa układu:</label>
    <input id="nameInput" type="text">
  </div>
  <div style="height:0.5px; background:#102b56; margin:0.5rem 0; border-radius:4px;"></div>
  <div>
    <button id="addPointSolarSystem">Dodaj układ</button>
    <button id="zoomToPointSolarSystem">Zoom</button>
    <button id="editPointSolarSystem">Edytuj</button>
    <button id="deletePointSolarSystem">Usuń</button>
  </div>
`;
document.body.appendChild(hud);

const style = document.createElement("style");
style.textContent = `
body { margin:0; overflow:hidden; background:black; font-family:sans-serif; }
#renderCanvas { width:100vw; height:100vh; display:block; touch-action:none; }
#hud {
  position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6);
  color:white; padding:10px; border-radius:5px; font-size:14px;
}
#hud input { width:100px; margin:2px; }
#hud button { margin:3px; }
#hud .field { display: flex; align-items: center; margin-bottom: 6px; }
#hud label { width: 33%; text-align: left; color: #ccc; font-size: 13px; padding-right: 8px; box-sizing: border-box; }
#hud input { flex: 1; box-sizing: border-box; text-align: left; }
#regionMap {
  position:absolute; top:10px; right:10px; width:240px; height:240px;
  background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
  display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(4,1fr);
  gap:4px; padding:6px; box-sizing:border-box;
}
.regionTile {
  background:rgba(255,255,255,0.02);
  border:1px solid rgba(255,255,255,0.06);
  cursor:pointer; user-select:none;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; color:rgba(255,255,255,0.6);
}
.regionTile:hover { filter:brightness(1.2); }
.regionTile.selected { outline:2px solid rgba(0,200,0,0.9); }
#regionControls { position:absolute; top:260px; right:10px; display:flex; gap:6px; }
#regionControls button { padding:6px 8px; }
#regionControls button:disabled { opacity: 0.4; }
.regionTile.hasPoints { outline: 2px solid rgba(255, 230, 0, 0.8); box-shadow: 0 0 6px rgba(255, 230, 0, 0.5); }
#groupNameLabel { position:absolute; top:267px; right:90px; color:#fff; font-size:14px; opacity:0.8; font-weight:500; }
#solarList {
  position:absolute; top:320px; right:10px; width:240px; max-height:calc(100vh - 320px);
  overflow-y:auto; background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
  border-radius:6px; padding:6px; box-sizing:border-box; color:white; font-size:13px; backdrop-filter: blur(4px);
}
.solarItem { padding:4px 6px; margin-bottom:4px; border:1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); border-radius:4px; cursor:pointer; transition: background 0.2s; }
.solarItem:hover { background: rgba(0,0,0,0.5); }
.solarItem.selected { border-color: rgba(0,200,0,0.9); background: rgba(0,100,0,0.4); }
`;
document.head.appendChild(style);

/* ===============================
   Twój oryginalny kod — nie ruszałem niczego istotnego
   tylko dopisałem obsługę siatki regionów (2 poziomy).
   =============================== */

const engine = new BABYLON.Engine(canvas,true);
const scene = new BABYLON.Scene(engine);

// === Regiony (logiczne, nie fizyczne) ===
const REGION_WIDTH = 4096;
const REGION_DEPTH = 4096;
const REGION_HEIGHT = 256;
  
// === Kamera i światło ===
/* Uwaga: scena 3D zawsze obejmuje tylko jeden obszar — pojedynczy region
   (rozmiar określony niżej). Kamera i skybox nie będą przesuwane. */
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI/4, Math.PI/4, 600, new BABYLON.Vector3(REGION_WIDTH/2, 128, REGION_DEPTH/2), scene);
camera.attachControl(canvas,true);
camera.minZ = 0.1; 
camera.maxZ = 20000;
camera.lowerRadiusLimit = 50;
camera.upperRadiusLimit = 8000;

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);

// === Skybox ===
const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:10000}, scene);
const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMat", scene);
skyboxMaterial.backFaceCulling=false;
skyboxMaterial.disableLighting=true;
skyboxMaterial.diffuseColor=new BABYLON.Color3(0,0,0);
skyboxMaterial.specularColor=new BABYLON.Color3(0,0,0);
skyboxMaterial.reflectionTexture=new BABYLON.CubeTexture("https://raw.githubusercontent.com/eLeRCreative84/NMS-Planet-Atlasv2/main/textures/skybox/sky1", scene);
skyboxMaterial.reflectionTexture.coordinatesMode=BABYLON.Texture.SKYBOX_MODE;
skybox.material = skyboxMaterial;

// upewnij się, że skybox wygląda jak tło niezależne od położenia kamery
skybox.infiniteDistance = true;
scene.clearColor = new BABYLON.Color4(0,0,0,1);

/* Uwaga: tu traktujemy model uproszczony:
   - globalnie mamy 16 x 16 regionów ułożonych w siatkę (index 0..15 po X i Z)
   - te 16x16 regionów są pogrupowane w 16 grup 4x4 (czyli GROUPS_PER_AXIS = 4)
   - ALE scena 3D obejmuje tylko **jeden** region w danym momencie (0..4096)
*/
const GROUPS_PER_AXIS = 4;        // 4x4 grup = 16 grup (poziom GALAKTYKA)
const REGIONS_PER_GROUP = 4;      // 4x4 regionów w grupie = 16 regionów (poziom GRUPA)
const REGIONS_AXIS = GROUPS_PER_AXIS * REGIONS_PER_GROUP; // 16 regions per axis

let renderedPoints = []; // aktualnie wyrenderowane mesh'e w scenie (dla załadowanego regionu)
let renderedEdges = [];
let selectedPoint = null; // odnosi się do mesh'a w scenie (jeśli zaznaczony)
let regions = {}; // { "ix_iz": { pointsData: [ {id,x,y,z,galactic} ] } }
let uniqueIdCounter = 0;
let loadedRegionKey = null; // który region jest załadowany do sceny (np. "3_5")

// ===== inicjalizacja struktur danych regionów (puste) =====
for (let iz = 0; iz < REGIONS_AXIS; iz++) {
  for (let ix = 0; ix < REGIONS_AXIS; ix++) {
    const key = regionIndexKey(ix, iz);
    regions[key] = { pointsData: [], edges: [] }; 
  }
}

// Materiały punktów
const pointMat = new BABYLON.StandardMaterial("pointMat", scene);
pointMat.emissiveColor = new BABYLON.Color3(0,1,0);
const selectedMat = new BABYLON.StandardMaterial("selectedMat", scene);
selectedMat.emissiveColor = new BABYLON.Color3(1,0,0);

// ==== pomocnik: klucz regionu bazowany na indeksie regionu (0..15)
function regionIndexKey(ix, iz) {
    return `${ix}_${iz}`; // klucz do obiektów i tablic w kodzie
}

// ==== funkcja określająca indeks regionu z globalnych współrzędnych x,z
// (zachowujemy, ale w nowym modelu X/Z punktów są w zakresie 0..REGION_WIDTH/DEPTH)
function regionKeyFromPosition(x,z){
  const ix = Math.floor(x / REGION_WIDTH);
  const iz = Math.floor(z / REGION_DEPTH);
  const clampedX = Math.max(0, Math.min(REGIONS_AXIS-1, ix));
  const clampedZ = Math.max(0, Math.min(REGIONS_AXIS-1, iz));
  return regionIndexKey(clampedX, clampedZ);
}

// Wprowadzenie koordynatów AAAA:BBBB:CCCC:DDDD
function galacticToRegionCoords(address) {
  if (!address || !address.includes(":")) return null;
  const parts = address.split(":");

  if (parts.length !== 4) return null;

  const [A_str, B_str, C_str, D_str] = parts;

  // konwertujemy tylko B,C,D na liczby
  const B = parseInt(B_str, 16);
  const C = parseInt(C_str, 16);
  const D = parseInt(D_str, 16);

  if ([B,C,D].some(isNaN)) return null;

  // Normalizacja: 0–65535 → 0–REGION_WIDTH / REGION_DEPTH / REGION_HEIGHT
  const normX = (C / 65535) * REGION_WIDTH;
  const normZ = (D / 65535) * REGION_DEPTH;
  const normY = (B / 65535) * REGION_HEIGHT;

  // Wskaż region (16x16)
  const ix = Math.floor((C / 65535) * REGIONS_AXIS);
  const iz = Math.floor((D / 65535) * REGIONS_AXIS);
  const regionKey = regionIndexKey(ix, iz);

  return {
    x: normX,
    y: normY,
    z: normZ,
    regionKey,
    AAAA: A_str  // <-- przechowujemy jako string
  };
}

// === Kamera na punkt ===
function focusCameraOn(pointMesh, distance = 200) {
  if (!pointMesh) return;

  const target = pointMesh.position.clone();
  const dir = camera.position.subtract(camera.target || new BABYLON.Vector3(REGION_WIDTH/2, REGION_HEIGHT/2, REGION_DEPTH/2))
               .normalize()
               .scale(distance);
  const newPos = target.add(dir);

  // policz dystans i dopasuj długość animacji
  const dist = BABYLON.Vector3.Distance(camera.position, newPos);
  const frameCount = Math.min(120, Math.max(30, dist / 20)); // im dalej, tym dłuższy lot

  // animacja pozycji kamery z easingiem
  const posAnim = new BABYLON.Animation("camMoveSmooth", "position", 60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  posAnim.setKeys([
    { frame: 0, value: camera.position.clone() },
    { frame: frameCount, value: newPos }
  ]);

  // easing – bardzo miękki ease-in-out
  const easing = new BABYLON.CubicEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  posAnim.setEasingFunction(easing);

  // animacja celu kamery
  const targetAnim = new BABYLON.Animation("camTargetSmooth", "target", 60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  targetAnim.setKeys([
    { frame: 0, value: camera.target.clone() },
    { frame: frameCount, value: target }
  ]);
  targetAnim.setEasingFunction(easing);

  // przypisz i uruchom
  camera.animations = [posAnim, targetAnim];
  scene.beginAnimation(camera, 0, frameCount, false);
}


function createEdgeBetweenPoints(pd1, pd2) {
  // pd1 i pd2 to obiekty z x,y,z
  const points = [
    new BABYLON.Vector3(pd1.x, pd1.y, pd1.z),
    new BABYLON.Vector3(pd2.x, pd2.y, pd2.z)
  ];
  const line = BABYLON.MeshBuilder.CreateLines(`edge_${pd1.id}_${pd2.id}`, { points, updatable: true }, scene);
  line.color = new BABYLON.Color3(1, 1, 0); // żółty
  line.isPickable = false; // żeby nie przeszkadzało przy kliku

  renderedEdges.push(line); // dodaj do tablicy
  return line;              // zwróć dla logiki w addSolarSystemPoint
}


/* === addSolarSystemPoint: teraz dodaje dane do logicznego regionu (regions[key].pointsData)
   i ewentualnie przeładowuje scenę jeśli to ten region jest aktualnie załadowany.
*/
function addSolarSystemPoint(x, y, z, gal, targetRegionKey = null) {
  // jeśli podano współrzędne globalne (w obrębie jednego regionu), możemy policzyć klucz:
  // ALE często targetRegionKey zostanie przekazany (np. przy ręcznym dodawaniu)
  let key;
  if (targetRegionKey) {
    key = targetRegionKey;
  } else {
    key = regionKeyFromPosition(x, z);
  }

  // upewnij się, że punkt mieści się w obrębie jednego regionu (0..REGION_WIDTH), przyjmujemy clamp
  x = Math.min(Math.max(isNaN(x) ? REGION_WIDTH / 2 : x, 0), REGION_WIDTH);
  y = Math.min(Math.max(isNaN(y) ? REGION_HEIGHT / 2 : y, 0), REGION_HEIGHT);
  z = Math.min(Math.max(isNaN(z) ? REGION_DEPTH / 2 : z, 0), REGION_DEPTH);

  // inicjalizacja regionu jeśli nie istnieje
  if (!regions[key]) regions[key] = { pointsData: [], edges: [] };

  const id = `pt_${uniqueIdCounter++}`;
  const pd = { id, x, y, z, galactic: gal || "", name: nameInput.value.trim() || "" };

  regions[key].pointsData.push(pd);

  // rysujemy węzeł od zaznaczonego punktu, tylko jeśli istnieje zaznaczony w tym regionie
  if (selectedPoint && selectedPoint.metadata && selectedPoint.metadata.regionKey === key) {
    const prevPd = {
      x: selectedPoint.position.x,
      y: selectedPoint.position.y,
      z: selectedPoint.position.z,
      id: selectedPoint.metadata.id
    };
    const edgeMesh = createEdgeBetweenPoints(prevPd, pd);
   
   regions[key].edges.push({ fromId: prevPd.id, toId: pd.id });
 
    renderedEdges.push(edgeMesh); // dodajemy do globalnej tablicy
    pd.connectedToPrev = true;    // flaga, że jest połączony z poprzednim
  } else {
    pd.connectedToPrev = false;
  }

  // oznacz kafelek w mapie (jeśli pokazujemy grupę)
  markRegionTileHasPoints(key);

  // jeśli aktualnie załadowany region to ten do którego dodano punkt, przeładuj widok
  if (loadedRegionKey === key) {
    loadRegionByKey(key, { selectId: id });
  }
  return id;
}

/* ==============================
--- TUTAJ DOPISUJEMY SIATKĘ ---
 ============================== */

const regionMapEl = document.getElementById("regionMap");
const enterBtn = document.getElementById("enterGroup");
const exitBtn = document.getElementById("exitGroup");
const groupNameLabel = document.getElementById("groupNameLabel");

function updateControlsState() {
  if (level === 0) {
    // na poziomie galaktyki: można wejść, ale nie można wyjść
    enterBtn.disabled = false;
    exitBtn.disabled = true;
  } else if (level === 1) {
    // na poziomie grupy: można wyjść, ale nie można dalej wchodzić
    enterBtn.disabled = true;
    exitBtn.disabled = false;
  }
}
 

let level = 0; 
let selectedTile = null;
let currentGroupX = 0;
let currentGroupZ = 0;

// helper: wyczysc selection
function clearSelectionTile(){
  if(selectedTile) { selectedTile.classList.remove("selected"); selectedTile = null; }
}

// rysowanie widoku GALAKTYKI (4x4 grup)
function drawGalaxyGrid(){
  regionMapEl.innerHTML = "";
  clearSelectionTile();
  for(let gz=0; gz<4; gz++){
    for(let gx=0; gx<4; gx++){
      const tile = document.createElement("div");
      tile.className = "regionTile";
      tile.dataset.gx = gx;
      tile.dataset.gz = gz;
      tile.textContent = `G${gz*4+gx+1}`;
      tile.addEventListener("click", ()=> {
        if(selectedTile) selectedTile.classList.remove("selected");
        selectedTile = tile;
        tile.classList.add("selected");
      });
      regionMapEl.appendChild(tile);
    }
  }
  updateControlsState();
}

// helper: dodaje/usuwa klasę hasPoints dla kafelka regionu (jeśli jest aktualnie widoczny)
function markRegionTileHasPoints(regionKey) {
  // only applies when we're on level 1 (grupa widoczna)
  if (level !== 1) return;
  const parts = regionKey.split("_");
  const ix = parseInt(parts[0],10), iz = parseInt(parts[1],10);
  const el = regionMapEl.querySelector(`.regionTile[data-ix='${ix}'][data-iz='${iz}']`);
  if (el) {
    const has = regions[regionKey] && regions[regionKey].pointsData && regions[regionKey].pointsData.length>0;
    if (has) el.classList.add("hasPoints"); else el.classList.remove("hasPoints");
  }
}

// rysowanie widoku GRUPY (4x4 regionów)
function drawGroupGrid(groupX, groupZ){
  regionMapEl.innerHTML = "";
  clearSelectionTile();
  for(let rz=0; rz<4; rz++){
    for(let rx=0; rx<4; rx++){
      const tile = document.createElement("div");
      tile.className = "regionTile";
      const regionX = groupX * REGIONS_PER_GROUP + rx;
      const regionZ = groupZ * REGIONS_PER_GROUP + rz;

      // numeracja od 1 do 256 (tylko wizualna)
      const regionNumber = regionZ * REGIONS_AXIS + regionX + 1;
      tile.textContent = regionNumber;
      
      tile.dataset.ix = regionX;
      tile.dataset.iz = regionZ;
      
      // pokaż czy region ma punkty
      const key = regionIndexKey(regionX, regionZ);
      if (regions[key] && regions[key].pointsData && regions[key].pointsData.length>0) {
        tile.classList.add("hasPoints");
      }
      tile.addEventListener("click", ()=>{
        if(selectedTile) selectedTile.classList.remove("selected");
        selectedTile = tile;
        tile.classList.add("selected");

        // === Ładujemy logiczny region do sceny (scena zawsze ten sam obszar)
        const key = regionIndexKey(regionX, regionZ);
        loadRegionByKey(key);
        // ustaw kamere nad środkiem obszaru (nie przestawiamy sceny)
        camera.setTarget(new BABYLON.Vector3(REGION_WIDTH/2, REGION_HEIGHT/2, REGION_DEPTH/2));
        camera.alpha = Math.PI / 4;
        camera.beta = Math.PI / 4;
        camera.radius = 600;
      });
      regionMapEl.appendChild(tile);
    }
  }
}

enterBtn.addEventListener("click", ()=>{
  if(level !== 0) return;
  if(!selectedTile) return alert("Zaznacz grupę, w którą chcesz wejść.");
  const gx = parseInt(selectedTile.dataset.gx);
  const gz = parseInt(selectedTile.dataset.gz);
  currentGroupX = gx; currentGroupZ = gz;
  level = 1;
  const groupIndex = gz * GROUPS_PER_AXIS + gx + 1;
  groupNameLabel.textContent = `Grupa regionów ${groupIndex}`;
  drawGroupGrid(currentGroupX, currentGroupZ);
  updateControlsState();

  // === Po wejściu do grupy, ustaw kamerę nad środkiem obszaru
  camera.setTarget(new BABYLON.Vector3(REGION_WIDTH/2, REGION_HEIGHT/2, REGION_DEPTH/2));
  camera.alpha = Math.PI / 4;
  camera.beta = Math.PI / 4;
  camera.radius = 600;
  camera.minZ = 0.1;
  camera.maxZ = 20000;
});

exitBtn.addEventListener("click", ()=>{
  if(level !== 1) return;
  level = 0;
  currentGroupX = 0; currentGroupZ = 0;
  drawGalaxyGrid();
  groupNameLabel.textContent = "";
  // czyścimy załadowany region ze sceny (jeśli chcesz, możesz zostawić)
  clearRenderedPoints();
  updateControlsState();
  loadedRegionKey = null;
});

drawGalaxyGrid();
groupNameLabel.textContent = "";


// Funkcja aktualizuje kafelki grup (poziom galaktyki) pod kątem obecności punktów w regionach
function updateGalaxyTilesHasPoints() {
  if(level !== 0) return; // tylko dla poziomu galaktyki
  const tiles = regionMapEl.querySelectorAll(".regionTile");
  tiles.forEach(tile => {
    const gx = parseInt(tile.dataset.gx, 10);
    const gz = parseInt(tile.dataset.gz, 10);
    let hasPoints = false;

    // sprawdzamy 4x4 regiony w tej grupie
    for(let rz = 0; rz < REGIONS_PER_GROUP; rz++) {
      for(let rx = 0; rx < REGIONS_PER_GROUP; rx++) {
        const regionX = gx * REGIONS_PER_GROUP + rx;
        const regionZ = gz * REGIONS_PER_GROUP + rz;
        const key = regionIndexKey(regionX, regionZ);
        if(regions[key] && regions[key].pointsData && regions[key].pointsData.length > 0) {
          hasPoints = true;
          break;
        }
      }
      if(hasPoints) break;
    }

    if(hasPoints) tile.classList.add("hasPoints");
    else tile.classList.remove("hasPoints");
  });
}


/* ===============================
   SIDEBAR – lista układów
   =============================== */
const solarListEl = document.getElementById("solarList");

// funkcja tworząca nowy wpis w liście (tylko dla aktualnie załadowanego regionu)
function refreshSolarListForLoadedRegion() {
  solarListEl.innerHTML = "";
  if (!loadedRegionKey) return;
  const region = regions[loadedRegionKey];
  if (!region || !region.pointsData) return;
  region.pointsData.forEach(pd => {
    const item = document.createElement("div");
    item.className = "solarItem";
    item.textContent = pd.name || pd.galactic || `Układ ${pd.id}`;
    item.dataset.id = pd.id;
    item.addEventListener("click", () => {
      // usuwamy zaznaczenie poprzedniego
      document.querySelectorAll(".solarItem").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");

      // znajdź mesh odpowiadający temu id w renderedPoints i zaznacz
      const mesh = renderedPoints.find(m => m.metadata && m.metadata.id === pd.id);
      if (mesh) {
        if (selectedPoint) selectedPoint.material = pointMat.clone();
        selectedPoint = mesh;
        selectedPoint.material = selectedMat;
        // wypełnij inputy
        xInput.value = mesh.position.x.toFixed(2);
        yInput.value = mesh.position.y.toFixed(2);
        zInput.value = mesh.position.z.toFixed(2);
        coordInput.value = mesh.metadata.galactic || "";
        focusCameraOn(mesh);
      }
    });
    solarListEl.appendChild(item);
  });
}

// aktualizacja listy po usunięciu punktu (reload region)
function removeFromSolarListById(id) {
  if (!loadedRegionKey) return;
  refreshSolarListForLoadedRegion();
}

/* ================================
   Reszta Twojego HUD (bez zmian)
   ================================ */

const xInput=document.getElementById("xInput");
const yInput=document.getElementById("yInput");
const zInput=document.getElementById("zInput");
const coordInput=document.getElementById("coordInput");
const nameInput=document.getElementById("nameInput");


// --- WALIDACJA GALACTIC ---
coordInput.addEventListener("input", () => {
  // zamień na wielkie litery
  coordInput.value = coordInput.value.toUpperCase();

  const val = coordInput.value.trim();

  // regex: 4x hex + ":" + 4x hex + ":" + 4x hex + ":" + 4x hex
  const galacticRegex = /^[0-9A-F]{4}:[0-9A-F]{4}:[0-9A-F]{4}:[0-9A-F]{4}$/;

  if (galacticRegex.test(val)) {
    coordInput.style.borderColor = "#0f0"; // zielony – poprawny
  } else {
    coordInput.style.borderColor = "#f00"; // czerwony – niepoprawny
  }
});


// === Pomocnicze funkcje do renderowania/zarządzania mesh'ami w scenie ===
function clearRenderedPoints(){
  renderedPoints.forEach(m => {
    try { m.dispose(); } catch(e){ /* ignore */ }
  });
  renderedPoints = [];
  selectedPoint = null;
  
  // czyszczenie węzłów
  renderedEdges.forEach(e => {
    try { e.dispose(); } catch(e){ }
  });
  renderedEdges = [];
}

function createMeshForPointData(pd) {
  const sphere = BABYLON.MeshBuilder.CreateSphere(`m_${pd.id}`, { diameter: 2 }, scene);
  sphere.position.set(pd.x, pd.y, pd.z);
  sphere.material = pointMat.clone();
  sphere.metadata = { id: pd.id, galactic: pd.galactic, name: pd.name || "" };
  sphere.actionManager = new BABYLON.ActionManager(scene);
  sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,()=>{
    if(selectedPoint) selectedPoint.material = pointMat.clone();
    selectedPoint = sphere; selectedPoint.material = selectedMat;
    document.getElementById("xInput").value = sphere.position.x.toFixed(2);
    document.getElementById("yInput").value = sphere.position.y.toFixed(2);
    document.getElementById("zInput").value = sphere.position.z.toFixed(2);
    document.getElementById("coordInput").value = sphere.metadata.galactic || "";
	document.getElementById("nameInput").value = sphere.metadata.name || "";

    // highlight corresponding item in list
    document.querySelectorAll(".solarItem").forEach(el => el.classList.remove("selected"));
    const li = solarListEl.querySelector(`[data-id="${pd.id}"]`);
    if (li) li.classList.add("selected");
  }));
  return sphere;
}

// Ładuje region do sceny na podstawie klucza regionu (np. "3_5")
// opcje: { selectId: 'pt_x' } => po załadowaniu zaznacz ten punkt
function loadRegionByKey(regionKey, options = {}) {
  // czyścimy bieżące mesh'e
  clearRenderedPoints();
  loadedRegionKey = regionKey;

  const region = regions[regionKey];
  if (!region || !region.pointsData) {
    refreshSolarListForLoadedRegion();
    return;
  }

  // tworzymy mesh dla każdego punktu w data
  region.pointsData.forEach(pd => {
    const mesh = createMeshForPointData(pd);
    renderedPoints.push(mesh);
    mesh.metadata.regionKey = regionKey; // dodajemy info, z którego regionu mesh pochodzi
  });

  // renderujemy istniejące węzły w regionie
  if (region.edges && region.edges.length > 0) {
  region.edges.forEach(edgeObj => {
    const fromPd = region.pointsData.find(p => p.id === edgeObj.fromId);
    const toPd = region.pointsData.find(p => p.id === edgeObj.toId);
    if (fromPd && toPd) {
      const line = createEdgeBetweenPoints(fromPd, toPd);
      renderedEdges.push(line);
    }
  });
}

  // odśwież listę w sidebar
  refreshSolarListForLoadedRegion();

	// opcjonalnie zaznacz nowo dodany lub ostatni punkt
	let selectId = options.selectId;
	if (!selectId) {
	  const region = regions[regionKey];
	  if (region && region.pointsData.length > 0) {
		// automatycznie wybierz ostatnio dodany punkt
		selectId = region.pointsData[region.pointsData.length - 1].id;
	  }
	}

	if (selectId) {
	  const mesh = renderedPoints.find(m => m.metadata && m.metadata.id === selectId);
	  if (mesh) {
		if (selectedPoint) selectedPoint.material = pointMat.clone();
		selectedPoint = mesh;
		selectedPoint.material = selectedMat;
		// uzupełnij inputy
		xInput.value = mesh.position.x.toFixed(2);
		yInput.value = mesh.position.y.toFixed(2);
		zInput.value = mesh.position.z.toFixed(2);
		coordInput.value = mesh.metadata.galactic || "";
		nameInput.value = mesh.metadata.name || "";

		// highlight item
		const li = solarListEl.querySelector(`[data-id="${selectId}"]`);
		if (li) {
		  document.querySelectorAll(".solarItem").forEach(el => el.classList.remove("selected"));
		  li.classList.add("selected");
		}
		focusCameraOn(mesh, 200);
	  }
	}
}


// === Obsługa przycisku Dodaj punkt ===
document.getElementById("addPointSolarSystem").addEventListener("click", () => {
  const gal = coordInput.value.trim();

  // === PRZYPADEK 1: Koordynaty Galactic są wypełnione ===
  if (gal) {
    const galData = galacticToRegionCoords(gal);
    if (!galData) {
      alert("Niepoprawny adres Galactic! Wprowadź w formacie AAAA:BBBB:CCCC:DDDD");
      return;
    }

    // użyjemy normalizacji X/Y/Z z galacticToRegionCoords
    let { x, y, z, regionKey } = galData;

    // jeśli user nie podał inputów XYZ ręcznie, ustawiamy środek regionu
    if (isNaN(parseFloat(xInput.value))) x = REGION_WIDTH / 2;
    if (isNaN(parseFloat(yInput.value))) y = REGION_HEIGHT / 2;
    if (isNaN(parseFloat(zInput.value))) z = REGION_DEPTH / 2;

    const newId = addSolarSystemPoint(x, y, z, gal, regionKey);

    if (loadedRegionKey === regionKey) {
      loadRegionByKey(regionKey, { selectId: newId });
    } else {
      markRegionTileHasPoints(regionKey);
    }

	// nowo dodane – aktualizacja kafelków grupy
	if (level === 0) {
	  updateGalaxyTilesHasPoints();
	}

    return; // wychodzimy, nie przechodzimy do trybu ręcznego
  }

  // === PRZYPADEK 2: ręczne dodawanie punktu ===
  if (level !== 1 || !selectedTile || !selectedTile.dataset.ix) {
    alert("Wybierz region z mapy, zanim dodasz punkt ręcznie.");
    return;
  }

  const ix = parseInt(selectedTile.dataset.ix);
  const iz = parseInt(selectedTile.dataset.iz);
  const regionKey = regionIndexKey(ix, iz);

  let x = isNaN(parseFloat(xInput.value)) ? REGION_WIDTH / 2 : parseFloat(xInput.value);
  let y = isNaN(parseFloat(yInput.value)) ? REGION_HEIGHT / 2 : parseFloat(yInput.value);
  let z = isNaN(parseFloat(zInput.value)) ? REGION_DEPTH / 2 : parseFloat(zInput.value);

  const newId = addSolarSystemPoint(x, y, z, "", regionKey);
  if (loadedRegionKey === regionKey) {
    loadRegionByKey(regionKey, { selectId: newId });
  } else {
    markRegionTileHasPoints(regionKey);
  }
  
  if (level === 0) {
  updateGalaxyTilesHasPoints();
}

});


document.getElementById("zoomToPointSolarSystem").addEventListener("click",()=>{ if(selectedPoint) focusCameraOn(selectedPoint); });

document.getElementById("editPointSolarSystem").addEventListener("click",()=>{
  if(!selectedPoint) return alert("Nie zaznaczono punktu!");
  // znajdź entry w danych regionu i zaktualizuj
  const id = selectedPoint.metadata && selectedPoint.metadata.id;
  if (!id || !loadedRegionKey) return;
  const region = regions[loadedRegionKey];
  const entry = region.pointsData.find(p => p.id === id);
  if (!entry) return;
  entry.x = parseFloat(xInput.value);
  entry.y = parseFloat(yInput.value);
  entry.z = parseFloat(zInput.value);
  entry.galactic = coordInput.value.trim();
  entry.name = nameInput.value.trim();

  // zaktualizuj mesh
  selectedPoint.position.set(entry.x, entry.y, entry.z);
  selectedPoint.metadata.galactic = entry.galactic;
  selectedPoint.metadata.name = entry.name;

  // odśwież listę
  refreshSolarListForLoadedRegion();
});

document.getElementById("deletePointSolarSystem").addEventListener("click",()=>{
  if(!selectedPoint) return alert("Nie zaznaczono punktu!");
  const id = selectedPoint.metadata && selectedPoint.metadata.id;
  if (!id || !loadedRegionKey) return;

  // usuń z danych regionu
  const region = regions[loadedRegionKey];
  region.pointsData = region.pointsData.filter(p => p.id !== id);

  // usuń mesh i odśwież scenę/listę
  loadRegionByKey(loadedRegionKey);

  // odznacz kafelek jeśli region jest teraz pusty
  markRegionTileHasPoints(loadedRegionKey);
  if(level === 0) updateGalaxyTilesHasPoints();
});

// === Render ===
engine.runRenderLoop(()=>scene.render());
window.addEventListener("resize",()=>engine.resize());



}


window.initJourney = initJourney;

