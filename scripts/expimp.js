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
      if(data.atlas) atlas = data.atlas;
      if(data.planetDetails) planetDetails = data.planetDetails;
      if(data.planetData) planetData = data.planetData;
      if(data.textures) {
        textures.length = 0;        // wyczyść obecną listę
        textures.push(...data.textures); // wczytaj importowane
        currentTexturePage = 0;     // ustaw początkową stronę
        renderTexturePage();        // odtwórz galerię
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

      alert("Import zakończony!");
    } catch(err){ 
      console.error(err);
      alert("Błąd importu JSON"); 
    }
  };
  reader.readAsText(file);
}
