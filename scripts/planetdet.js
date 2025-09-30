////////////////////////////////////////////////////////////////////
//------------------- Detale planety ----------------------------//
////////////////////////////////////////////////////////////////////
	
// Detale planety 

function loadPlanetDetails(){
  if(!currentPlanet) return;
  const details = planetDetails[currentPlanet] || {};

  // galaxyInput - selektor z autouzupełnianiem)
  const galaxyEl = document.getElementById("galaxyInput");
  if (galaxyEl) {
    galaxyEl.value = details.galaxy || "";
    // synchronizuj zmienną globalną
    currentGalaxy = details.galaxy || currentGalaxy;
  }

  document.getElementById("detailStarSystem").value = details.starSystem || "";
  document.getElementById("detailPlanetSystem").value = details.planetSystem || "";
  document.getElementById("detailBiome").value = details.biome || "";
  document.getElementById("detailWeather").value = details.weather || "";
  document.getElementById("detailSentinels").value = details.sentinels || "";
  document.getElementById("detailFlora").value = details.flora || "";
  document.getElementById("detailFauna").value = details.fauna || "";
  document.getElementById("detailDiscovered").value = details.discovered || "";
  document.getElementById("detailMode").value = details.mode || "";
  document.getElementById("detailUpdated").value = details.updated || "";
  document.getElementById("detailCoords").value = details.coords || "";
  document.getElementById("detailNotes").value = details.notes || "";
 
	// Przywróć checkboxy pierwiastków
  if (icons && icons.length) {
    icons.forEach(res => {
      const checkbox = document.getElementById(`resCheckbox-${res.name}`);
      if (checkbox) {
        checkbox.checked = details.resources?.includes(res.name) || false;
      }
    });
  }
}


function savePlanetDetails(){
  if(!currentPlanet) return;

  // pobierz galaktykę z inputa (fallback na currentGalaxy)
  const galaxyEl = document.getElementById("galaxyInput");
  const galaxyVal = (galaxyEl && galaxyEl.value) ? galaxyEl.value : (currentGalaxy || "");
  let starSystemVal = document.getElementById("detailStarSystem").value.trim();
  let planetSystemVal = document.getElementById("detailPlanetSystem").value.trim();

  // Jeśli podano tylko planetSystem, spróbuj odnaleźć istniejący starSystem, gdzie ten planetSystem już występuje
  if (!starSystemVal && planetSystemVal) {
    for (const details of Object.values(planetDetails)) {
      if (details.planetSystem === planetSystemVal && details.starSystem) {
        starSystemVal = details.starSystem;
        break;
      }
    }
  }

  // Jeśli podano starSystem ale nie planetSystem — blokujemy zapisu (zgodnie z regułą)
  if (starSystemVal && !planetSystemVal) {
    alert("Wprowadź nazwę układu planetarnego aby poprawnie wyświetlić planetę na liście!");
    return;
  }

  // zachowaj istniejące resources jeśli są
  const existingResources = planetDetails[currentPlanet]?.resources || [];
	
  planetDetails[currentPlanet] = {
    galaxy: galaxyVal,
    starSystem: starSystemVal,
    planetSystem: planetSystemVal || "Nieznany", // jeśli brak – ląduje w „Nieznany”
    biome: document.getElementById("detailBiome").value,
    weather: document.getElementById("detailWeather").value,
    sentinels: document.getElementById("detailSentinels").value,
    flora: document.getElementById("detailFlora").value,
    fauna: document.getElementById("detailFauna").value,
    discovered: document.getElementById("detailDiscovered").value,
    mode: document.getElementById("detailMode").value,
    updated: document.getElementById("detailUpdated").value,
    coords: document.getElementById("detailCoords").value,
    notes: document.getElementById("detailNotes").value,
	resources: existingResources
  };
 
 // synchronizuj globalną zmienną (opcjonalne, ale wygodne)
  currentGalaxy = galaxyVal;

  alert("Opis zapisany!");
  refreshPlanetList();
  updateCurrentPlanetHeader();
  refreshPlanetSidebar();
  refreshGalaxySidebar();
  updatePlanetMiniPanel();
}
 
