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
    try{
      const data = JSON.parse(e.target.result);

      // 1️⃣ Atlas planet
      if(data.atlas) atlas = data.atlas;

      // 2️⃣ Planet details i inicjalizacja resources
      if(data.planetDetails) {
        planetDetails = data.planetDetails;
        Object.keys(planetDetails).forEach(p => {
          if (!Array.isArray(planetDetails[p].resources)) planetDetails[p].resources = [];
        });
      }

      // 3️⃣ Dodatkowe dane
      if(data.planetData) planetData = data.planetData;
      if(data.textures) {
        textures.length = 0;
        textures.push(...data.textures);
        currentTexturePage = 0;
        renderTexturePage();
      }

      // 4️⃣ Ustawienie aktualnej planety
      const planets = Object.keys(atlas);
      currentPlanet = planets[0] || null;
      if (currentPlanet) selectPlanet(currentPlanet);
      else globe.globeImageUrl(blackTextureURL);

      // 5️⃣ Odświeżenie UI
      updateCurrentPlanetHeader();
      refreshPlanetList();
      refreshPointsList();
      refreshGlobePoints();
      updateNoPlanetsMessage();
      refreshPlanetSidebar();
      refreshGalaxySidebar();
      renderPlanetResourcesPanel(); // checkboxy pierwiastków
      updatePlanetMiniPanel();      // mini-panel aktualny

      alert("Import zakończony!");
    } catch(err){ 
      console.error(err);
      alert("Błąd importu JSON"); 
    }
  };

  reader.readAsText(file);
}
