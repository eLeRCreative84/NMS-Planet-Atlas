////////////////////////////////////////////////////////////////////
//------------------- Tekstury i kolory planet -------------------//
////////////////////////////////////////////////////////////////////  

  //Tworzy teksturę o rozmairze 1 piksel x 1 piksel o zadanym kolorze i zmienia na base64
function hexToBase64Texture(hex) {
  // Tworzymy canvas 1x1
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 1, 1);

  // Zamiana na base64 PNG
  return canvas.toDataURL("image/png");
}
	
function addTextureUrl() {
  const texture = document.getElementById('planetTextureUrl').value.trim();
  if (!texture) {
    alert("Podaj URL tekstury!");
    return;
  }

  // sprawdzenie podstawowe, URL musi zaczynać się od http(s):// lub textures/
  if (!/^https?:\/\/|^textures\//.test(texture)) {
    alert("Nieprawidłowy URL lub lokalna ścieżka!");
    return;
  }

  // sprawdzamy, czy plik istnieje
  const img = new Image();
  img.src = texture;
  img.onload = () => {
    // obraz istnieje → zapisujemy w planetData
    const planet = planetData.find(p => p.name === currentPlanet);
    if (!planet) {
      alert("Najpierw wybierz planetę!");
      return;
    }

    // zapisz nową teksturę w danych planety
    planet.texture = texture;

    // ustaw teksturę na globie
    globe.globeImageUrl(texture);

    // dopisanie do listy textures, jeśli nowa
    if (!textures.includes(texture)) {
      textures.push(texture);
      // ustaw stronę galerii tak, by nowa miniatura była widoczna
      currentTexturePage = Math.floor((textures.length - 1) / TEXTURES_PER_PAGE);
      renderTexturePage();
    }

    alert(`Dodano teksturę do planety ${currentPlanet}`);
  };
  img.onerror = () => {
    alert("Nie udało się załadować obrazu. Sprawdź URL lub lokalną ścieżkę.");
  };
}

  // Przełącznik aktywnej planety
  function selectPlanet(name) {
  // Szuka w tablicy planet obiektu, który ma taki sam 'name'
    const planet = planetData.find(p => p.name === name);
  // Jeśli nic nie znalazła → kończy działanie
    if (!planet) return; 

  // Ustawia globalną zmienną currentPlanet na tę planetę
    currentPlanet = planet.name;
       
  // Używamy tekstury planety jeśli istnieje, w przeciwnym razie czarna
  const textureToUse = planet.texture ? planet.texture : blackTextureURL;
globe.globeImageUrl(textureToUse);
}

  // Funkcja do zmiany koloru planety
function changePlanetColor() {
  if (!currentPlanet) {
    alert("Najpierw wybierz planetę!");
    return;
  }

  const colorHex = document.getElementById("PlanetColor").value || "#000000";
  const textureBase64 = hexToBase64Texture(colorHex);

  // znajdź wpis w planetData
  const idx = planetData.findIndex(p => p.name === currentPlanet);
  if (idx !== -1) {
    planetData[idx].texture = textureBase64;
    globe.globeImageUrl(textureBase64);
    }
}

   // Funkcja sprawdzająca, czy w polu tekstury coś wpisano 
function checkTextureInput() {
  const input = document.getElementById("planetTextureUrl");
  const button = input.nextElementSibling; // przycisk obok pola
  button.disabled = input.value.trim() === "";
}

//Galeria miniatur 
const textures = []; // lista wszystkich tekstur
let currentTexturePage = 0;
const TEXTURES_PER_PAGE = 12; // 2 wiersze x 6 kolumn

// renderuje aktualną stronę galerii
function renderTexturePage() {
  const gallery = document.getElementById('textureGallery');
  gallery.innerHTML = '';

  const start = currentTexturePage * TEXTURES_PER_PAGE;
  const end = start + TEXTURES_PER_PAGE;
  const pageTextures = textures.slice(start, end);

  pageTextures.forEach(tex => {
    const img = document.createElement('img');
    img.src = tex;
    img.className = 'texture-thumb';
    img.title = tex;
    img.onclick = () => {
      document.getElementById('planetTextureUrl').value = tex;
      addTextureUrl();
    };
    gallery.appendChild(img);
  });

  // włącz/wyłącz przyciski
  document.getElementById('prevTexturePage').disabled = currentTexturePage === 0;
  document.getElementById('nextTexturePage').disabled = end >= textures.length;
}

// zmiana strony galerii
function changeTexturePage(delta) {
  currentTexturePage += delta;
  renderTexturePage();
}
