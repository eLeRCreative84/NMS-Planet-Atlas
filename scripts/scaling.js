////////////////////////////////////////////////////////////////////
//---------------- Skalowanie Globu i Punktów ----------------//
////////////////////////////////////////////////////////////////////  
  
// Skalowanie punktów
function updatePointScale(){
  pointScale = parseFloat(document.getElementById("pointScale").value);
  document.getElementById("pointScaleValue").textContent = pointScale;
  refreshGlobePoints();
}
function resetPointScale(){
  document.getElementById("pointScale").value = 0.4;
  updatePointScale();
}

// Sklaowanie wysokości słupka
function updatePointsDistanceMultiplier() {
  pointsDistanceMultiplier = parseFloat(document.getElementById("pointsDistanceMultiplier").value);
  document.getElementById("pointsDistanceMultiplierValue").textContent = pointsDistanceMultiplier;
  refreshGlobePoints();
}
function resetPointsDistanceMultiplier(){
  document.getElementById("pointsDistanceMultiplier").value = 1;
  updatePointsDistanceMultiplier();
}

//Skalowanie wielkości planety
function updateGlobeZoomMultiplier() {
  globeZoomMultiplier = parseFloat(document.getElementById("globeZoomMultiplier").value);
  document.getElementById("globeZoomMultiplierValue").textContent = globeZoomMultiplier;
  globe.scene().scale.set(globeZoomMultiplier, globeZoomMultiplier, globeZoomMultiplier);
}
function resetGlobeZoomMultiplier(){
  document.getElementById("globeZoomMultiplier").value = 1;
  updateGlobeZoomMultiplier();
}

function toggleAutoRotate() {
  const controls = globe.controls();
  if (document.getElementById("autoRotateCheckbox").checked) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7; // prędkość obrotu, możesz zmieniać
  } else {
    controls.autoRotate = false;
  }
}
