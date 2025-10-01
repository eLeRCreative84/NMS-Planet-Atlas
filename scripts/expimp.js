////////////////////////////////////////////////////////////////////
//---------------- Eksport / Import Atlasu ---------------//
////////////////////////////////////////////////////////////////////  

function exportAtlas(){
  const blob = new Blob([JSON.stringify({
    atlas,
    planetDetails,
    planetData,
    textures // dodajemy listę galerii do JSON
  }, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "atlas.json";
  a.click();
  URL.revokeObjectURL(url);
}

// główny loader, wspólny dla obu metod
function loadAtlasData(data) {
  if(data.atlas) atlas = data.atlas;
  if(data.planetDetails) planetDetails = data.planetDetails;
  if(data.planetData) planetData = data.planetData;
  if(data.textures) {
    textures.length = 0;
    textures.push(...data.textures);
    currentTexturePage = 0;
    renderTexturePage();
  }

  const planets = Object.keys(atlas);
  currentPlanet = planets[0] || null;
  if (currentPlanet) selectPlanet(currentPlanet);
  else globe.globeImageUrl(blackTextureURL);

  updateCurrentPlanetHeader();
  refreshPlanetList();
  refreshPointsList();
  refreshGlobePoints();
  updateNoPlanetsMessage();
  refreshPlanetSidebar();
  refreshGalaxySidebar();
  renderPlanetResourcesPanel();
  updatePlanetMiniPanel();
}

// import z pliku (input type=file)
function importAtlas(event){
  const file = event?.target?.files?.[0];
  if(!file) {
    alert("Nie wybrano pliku!");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      loadAtlasData(data);
      alert("Import zakończony!");
    } catch(err){ 
      console.error(err);
      alert("Błąd importu JSON"); 
    }
  };
  reader.readAsText(file);
}

// import z atlas.json na serwerze (np. GitHub Pages)
async function importAtlasFromServer(url = "atlas.json") {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Błąd HTTP: " + response.status);
    const data = await response.json();
    loadAtlasData(data);
    console.log("Atlas załadowany z serwera:", url);
  } catch (err) {
    console.error("Błąd ładowania atlas.json:", err);
  }
}
