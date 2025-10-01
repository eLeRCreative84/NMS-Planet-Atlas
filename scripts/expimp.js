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

function importAtlas(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      // atlas punktów
      if(data.atlas) atlas = data.atlas;

      // planetDetails z normalizacją resources
      if(data.planetDetails) {
        planetDetails = data.planetDetails;
        Object.keys(planetDetails).forEach(p => {
          if (!planetDetails[p].resources) planetDetails[p].resources = [];
        });
      }

      // dodatkowe dane planet
      if(data.planetData) planetData = data.planetData;

      // tekstury galerii
      if(data.textures) {
        textures.length = 0;
        textures.push(...data.textures);
        currentTexturePage = 0;
        renderTexturePage();
      }

      // wybierz pierwszą planetę, jeśli istnieje
      const planets = Object.keys(atlas);
      currentPlanet = planets[0] || null;
      if (currentPlanet) selectPlanet(currentPlanet);
      else globe.globeImageUrl(blackTextureURL);

      // odśwież wszystko w UI
      updateCurrentPlanetHeader();
      refreshPlanetList();
      refreshPointsList();
      refreshGlobePoints();
      updateNoPlanetsMessage();
      refreshPlanetSidebar();
      refreshGalaxySidebar();
      renderPlanetResourcesPanel();
      updatePlanetMiniPanel();

      alert("Import zakończony!");
    } catch(err){ 
      console.error(err);
      alert("Błąd importu JSON"); 
    }
  };
  reader.readAsText(file);
}
