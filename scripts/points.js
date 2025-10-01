////////////////////////////////////////////////////////////////////
//--------------- Punkty, lista, tworzenie, edycja ---------------//
//////////////////////////////////////////////////////////////////// 
  
// Lista punktow
function refreshPointsList() {
    const list = document.getElementById("pointsList");
    list.innerHTML = "";
    if (!currentPlanet || !atlas[currentPlanet]) return;

    // Wszystkie zwykłe punkty (bez biegunów i mojej lokalizacji)
    let points = atlas[currentPlanet].filter(p => p.type !== "Pole" && p.type !== "Moja");

    // Filtrujemy przez wspólną funkcję
    points = getFilteredPoints(points);

    // Sortowanie
    const sort = document.getElementById("sortPoints").value;
    if (sort === "nameAsc") points.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sort === "nameDesc") points.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    if (sort === "type") points.sort((a, b) => (a.type || "").localeCompare(b.type || ""));
    if (sort === "newest") points.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (sort === "oldest") points.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // Tworzenie elementów <li>
    points.forEach(point => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.flexDirection = "column";
        li.style.alignItems = "flex-start";

        const info = document.createElement("span");
        info.innerHTML = `${point.name || "Bez nazwy"} (${point.type})<br>X:${point.lat}, Y:${point.lng}`;
        li.appendChild(info);

        const btnDiv = document.createElement("div");
        btnDiv.style.display = "flex";
        btnDiv.style.gap = "0.5rem";

        // Pokaż punkt
        const showBtn = document.createElement("button");
        showBtn.textContent = "Pokaż";
        showBtn.className = "show";
        showBtn.style.background = "#388e3c";
        showBtn.style.color = "white";
      
        showBtn.onclick = () => {
          globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);

          // usuń highlight ze wszystkich punktów
          atlas[currentPlanet].forEach(p => delete p.__highlight);
          if (myLocationPoint) delete myLocationPoint.__highlight;

          // zatrzymaj ewentualny stary timeout
          if (highlightTimeout) {
            clearTimeout(highlightTimeout);
            highlightTimeout = null;
          }

          // ustaw highlight na klikniętym punkcie
          point.__highlight = true;
          refreshGlobePoints();

          // zdejmij highlight po 2s
          highlightTimeout = setTimeout(() => {
            delete point.__highlight;
            refreshGlobePoints();
            highlightTimeout = null;
          }, 2000);
        };

        btnDiv.appendChild(showBtn);

        // Checkbox dla extracted/visited
        if (point.type === "Zasób" || ["Inne", "Ruiny", "Struktura"].includes(point.type)) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = point.type === "Zasób" ? !!point.extracted : !!point.visited;
            checkbox.onchange = () => {
                if (point.type === "Zasób") point.extracted = checkbox.checked;
                else point.visited = checkbox.checked;
                refreshGlobePoints();
                refreshPointsList();
            };
            btnDiv.appendChild(checkbox);
        }

        // Edycja punktu
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edytuj";
        editBtn.className = "edit";
        editBtn.onclick = () => editPoint(point.timestamp); // Musimy jednoznacznie wskazać który punkt w atlasie edytujemy. Najprościej przekazywać nie indeks, tylko unikalny identyfikator (timestamp, który już dodajemy do każdego punktu).
        btnDiv.appendChild(editBtn);

        // Usuwanie punktu
        const delBtn = document.createElement("button");
        delBtn.textContent = "Usuń";
        delBtn.className = "del";
        delBtn.onclick = () => {
            if (confirm(`Czy na pewno usunąć punkt "${point.name || "Bez nazwy"}" typu "${point.type}" o współrzędnych X:${point.lat}, Y:${point.lng}?`)) {
                const idx = atlas[currentPlanet].findIndex(p => p.timestamp === point.timestamp);
                if (idx !== -1) {
                    atlas[currentPlanet].splice(idx, 1);
                    refreshPointsList();
                    refreshGlobePoints();
                }
            }
        };
        btnDiv.appendChild(delBtn);

        li.appendChild(btnDiv);
        list.appendChild(li);
    });
}

function getFilteredPoints(points) {
    const activeTypes = getActivePointTypes(); // checkboxy typów
    const activeExtras = Array.from(document.querySelectorAll(".extraFilter:checked"))
        .map(cb => cb.value); // checkboxy dodatkowe

    return points.filter(p => {
        // filtr po typach
        if (!activeTypes.includes(p.type)) return false;
        // filtr Wydobyty / Niewydobyty dla Zasób
        if (p.type === "Zasób") {
            const extracted = !!p.extracted;
            if (extracted && !activeExtras.includes("Wydobyty")) return false; // wydobyty, ale filtr Wydobyty nie zaznaczony → ukryj
            if (!extracted && !activeExtras.includes("Niewydobyty")) return false; // niewydobyty, ale filtr Niewydobyty nie zaznaczony → ukryj
        }
        // filtr Odwiedzony / Nieodwiedzony dla Ruiny/Struktura/Inne
        if (["Ruiny", "Struktura", "Inne"].includes(p.type)) {
            const visited = !!p.visited;
            if (visited && !activeExtras.includes("Odwiedzony")) return false; // odwiedzony, filtr Odwiedzony nie zaznaczony → ukryj
            if (!visited && !activeExtras.includes("Nieodwiedzony")) return false; // nieodwiedzony, filtr Nieodwiedzony nie zaznaczony → ukryj
        }

        return true;
    });
}

 // Kliknięcie Edytuj nie usuwa punktu od razu.
//Punkt jest tymczasowo przygotowany do edycji (ładuje się do formularza).
//Dopiero kliknięcie Nadpisz punkt faktycznie zmienia dane.
//Jak klikniesz „Punkty” bez zapisania → lista zostaje nietknięta.
//Przycisk zmienia podpis w zależności od trybu.
  
function addPoint(){
  if (!currentPlanet) {
    alert("Najpierw wybierz planetę w zakładce 'Planety'!");
    return;
  }

  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);
  const name = document.getElementById("name").value.trim();
  const type = document.getElementById("type").value;
  const notes = document.getElementById("notes").value.trim();

  // Sprawdzenie duplikatu
  const exists = atlas[currentPlanet].some(p =>
    p.lat === lat &&
    p.lng === lng &&
    p.name === name &&
    p.type === type &&
    p.notes === notes
  );
  if (exists) {
    alert(`Punkt typu "${type}" o współrzędnych X:${lat}, Y:${lng} z taką samą notatką już istnieje!`);
    return;
  }
  
  if (isNaN(lat) || isNaN(lng)) {
    alert("Podaj współrzędne X i Y!");
    return;
  }

  const point = {planet: currentPlanet, lat, lng, name, type, notes, timestamp: Date.now()};
  // Domyślnie wszystkie punkty są odwiedzone i wydobyte
    if(type === "Zasób") point.extracted = true; 
    if(["Inne", "Ruiny", "Struktura"].includes(type)) point.visited = true; 
    if (editIndex !== null && atlas[currentPlanet][editIndex]) {
  atlas[currentPlanet][editIndex] = point;
  // po nadpisaniu resetujemy stan edycji i chowamy Anuluj
  cancelEditPoint();
  openTab("punkty");
} else {
  atlas[currentPlanet].push(point);
}
  refreshPlanetList();
  refreshGlobePoints();
  refreshPointsList();
}

function editPoint(timestamp){   
  if(!currentPlanet || !atlas[currentPlanet]) return;
   
  isEditing = true;
  setButtonsDisabled(true);
  
  const index = atlas[currentPlanet].findIndex(p => p.timestamp === timestamp);
  if(index === -1) return;

  const p = atlas[currentPlanet][index];
  document.getElementById("lat").value = p.lat;
  document.getElementById("lng").value = p.lng;
  document.getElementById("name").value = p.name;
  document.getElementById("type").value = p.type;
  document.getElementById("notes").value = p.notes;

  editIndex = index; // zapamiętaj indeks prawidłowego punktu w atlasie
  const addBtn = document.querySelector("button[onclick='addPoint()']");
  addBtn.textContent = "Nadpisz punkt";

  showCancelEditButton();

  // przełączenie na zakładkę START
  openTab('start');
}

function showCancelEditButton() {
  let cancelBtn = document.getElementById("cancelEditBtn");
  if (!cancelBtn) {
    const addBtn = document.querySelector("button[onclick='addPoint()']");
    
    // kontener na przyciski, jeśli jeszcze nie istnieje
    let btnWrapper = document.getElementById("editBtnWrapper");
    if (!btnWrapper) {
      btnWrapper = document.createElement("div");
      btnWrapper.id = "editBtnWrapper";
      btnWrapper.style.display = "flex";
      btnWrapper.style.flexDirection = "column";
      btnWrapper.style.gap = "0.5rem";
      addBtn.parentNode.insertBefore(btnWrapper, addBtn);
      btnWrapper.appendChild(addBtn);
    }

    cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.textContent = "Anuluj";
    cancelBtn.style.backgroundColor = "#d32f2f"; // czerwony
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.style.padding = "0.5rem";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.onmouseover = () => cancelBtn.style.backgroundColor = "#b71c1c";
    cancelBtn.onmouseout = () => cancelBtn.style.backgroundColor = "#d32f2f";

    cancelBtn.onclick = cancelEditPoint;

    btnWrapper.appendChild(cancelBtn);
  }
}

function cancelEditPoint() {
  editIndex = null;
  const addBtn = document.querySelector("button[onclick='addPoint()']");
  addBtn.textContent = "Dodaj punkt";

  const cancelBtn = document.getElementById("cancelEditBtn");
  if(cancelBtn) cancelBtn.remove();

  document.getElementById("lat").value = "";
  document.getElementById("lng").value = "";
  document.getElementById("name").value = "";
  document.getElementById("type").value = "Zasób";
  document.getElementById("notes").value = "";

  isEditing = false;
  setButtonsDisabled(false);
  openTab("punkty");
}

// Utomatyczne tworzenie biegunów
function addPoles(planet){
  if(!atlas[planet]) atlas[planet] = [];
  if(!atlas[planet].some(p => p.type==="Pole")){
    atlas[planet].push({lat:90,lng:0,name:"Biegun Północny",type:"Pole"});
    atlas[planet].push({lat:-90,lng:0,name:"Biegun Południowy",type:"Pole"});
  }
}
 
// odświeżamy glob z uwzględnieniem mnożnika wysokości
 function refreshGlobePoints() {
    if (!currentPlanet) return;

    let allPoints = atlas[currentPlanet] ? [...atlas[currentPlanet]] : [];
    if (myLocationPoint) allPoints.push(myLocationPoint);

    const filteredPoints = getFilteredPoints(allPoints);

    globe.pointsData(filteredPoints)
        .pointAltitude(d => (d.altitude || 0.02) * pointsDistanceMultiplier);

    globe.htmlElementsData(filteredPoints.filter(d => d.type === "Pole" || d.type === "Moja"));
}

// System filtrowania punktów
function getActivePointTypes() {
  return Array.from(document.querySelectorAll(".pointFilter:checked"))
              .map(cb => cb.value);
}
