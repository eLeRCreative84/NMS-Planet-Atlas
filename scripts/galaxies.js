////////////////////////////////////////////////////////////////////
//------------------- Sidebar galaktyk ----------------------------//
////////////////////////////////////////////////////////////////////

function refreshGalaxySidebar() {
  const galaxyList = document.getElementById("galaxyList");
  galaxyList.innerHTML = "";

  // zbierz unikalne galaktyki z detali planet
  const galaxies = [...new Set(Object.values(planetDetails)
    .map(d => d.galaxy)
    .filter(Boolean))];

  // jeśli nic nie ma, pokaż Euclid jako domyślną
  if (galaxies.length === 0) galaxies.push("Euclid");

  galaxies.forEach(g => {
    const li = document.createElement("li");
    li.textContent = g;
    li.style.cursor = "pointer";

    li.onclick = () => {
      currentGalaxy = g;          // ustawiamy globalną zmienną
      refreshPlanetSidebar();     // odśwież listę planet dla tej galaktyki
    };

    galaxyList.appendChild(li);
  });
}

// Selektor galaktyk
const galaxies = [
  "Euclid", "Hilbert Dimension", "Calypso", "Hesperius Dimension", "Hyades", "Ickjamatew", "Budullangr", "Kikolgallr", "Eltiensleen", "Eissentam", "Elkupalos", "Aptarkaba", "Ontiniangp", "Odiwagiri", "Ogtialabi", "Muhacksonto", "Hitonskyer", "Rerasmutul", "Isdoraijung", "Doctinawyra", "Loychazinq", "Zukasizawa", "Ekwathore", "Yeberhahne", "Twerbetek", "Sivarates", "Eajerandal", "Aldukesci", "Wotyarogii", "Sudzerbal", "Maupenzhay", "Sugueziume", "Brogoweldian", "Ehbogdenbu", "Ijsenufryos", "Nipikulha", "Autsurabin", "Lusontrygiamh", "Rewmanawa", "Ethiophodhe", "Urastrykle", "Xobeurindj", "Oniijialdu", "Wucetosucc", "Ebyeloof", "Odyavanta", "Milekistri", "Waferganh", "Agnusopwit", "Teyaypilny", "Zalienkosm", "Ladgudiraf", "Mushonponte", "Amsentisz", "Fladiselm", "Laanawemb", "Ilkerloor", "Davanossi", "Ploehrliou", "Corpinyaya", "Leckandmeram", "Quulngais", "Nokokipsechl", "Rinblodesa", "Loydporpen", "Ibtrevskip", "Elkowaldb", "Heholhofsko", "Yebrilowisod", "Husalvangewi", "Ovna'uesed", "Bahibusey", "Nuybeliaure", "Doshawchuc", "Ruckinarkh", "Thorettac", "Nuponoparau", "Moglaschil", "Uiweupose", "Nasmilete", "Ekdaluskin", "Hakapanasy", "Dimonimba", "Cajaccari", "Olonerovo", "Umlanswick", "Henayliszm", "Utzenmate", "Umirpaiya", "Paholiang", "Iaereznika", "Yudukagath", "Boealalosnj", "Yaevarcko", "Coellosipp", "Wayndohalou", "Smoduraykl", "Apmaneessu", "Hicanpaav", "Akvasanta", "Tuychelisaor", "Rivskimbe", "Daksanquix", "Kissonlin", "Aediabiel", "Ulosaginyik", "Roclaytonycar", "Kichiaroa", "Irceauffey", "Nudquathsenfe", "Getaizakaal", "Hansolmien", "Bloytisagra", "Ladsenlay", "Luyugoslasr", "Ubredhatk", "Cidoniana", "Jasinessa", "Torweierf", "Saffneckm", "Thnistner", "Dotusingg", "Luleukous", "Jelmandan", "Otimanaso", "Enjaxusanto", "Sezviktorew", "Zikehpm", "Bephembah", "Broomerrai", "Meximicka", "Venessika", "Gaiteseling", "Zosakasiro", "Drajayanes", "Ooibekuar", "Urckiansi", "Dozivadido", "Emiekereks", "Meykinunukur", "Kimycuristh", "Roansfien", "Isgarmeso", "Daitibeli", "Gucuttarik", "Enlaythie", "Drewweste", "Akbulkabi", "Homskiw", "Zavainlani", "Jewijkmas", "Itlhotagra", "Podalicess", "Hiviusauer", "Halsebenk", "Puikitoac", "Gaybakuaria", "Grbodubhe", "Rycempler", "Indjalala", "Fontenikk", "Pasycihelwhee", "Ikbaksmit", "Telicianses", "Oyleyzhan", "Uagerosat", "Impoxectin", "Twoodmand", "Hilfsesorbs", "Ezdaranit", "Wiensanshe", "Ewheelonc", "Litzmantufa", "Emarmatosi", "Mufimbomacvi", "Wongquarum", "Hapirajua", "Igbinduina", "Wepaitvas", "Sthatigudi", "Yekathsebehn", "Ebedeagurst", "Nolisonia", "Ulexovitab", "Iodhinxois", "Irroswitzs", "Bifredait", "Beiraghedwe", "Yeonatlak", "Cugnatachh", "Nozoryenki", "Ebralduri", "Evcickcandj", "Ziybosswin", "Heperclait", "Sugiuniam", "Aaseertush", "Uglyestemaa", "Horeroedsh", "Drundemiso", "Ityanianat", "Purneyrine", "Dokiessmat", "Nupiacheh", "Dihewsonj", "Rudrailhik", "Tweretnort", "Snatreetze", "Iwundaracos", "Digarlewena", "Erquagsta", "Logovoloin", "Boyaghosganh", "Kuolungau", "Pehneldept", "Yevettiiqidcon", "Sahliacabru", "Noggalterpor", "Chmageaki", "Veticueca", "Vittesbursul", "Nootanore", "Innebdjerah", "Kisvarcini", "Cuzcogipper", "Pamanhermonsu", "Brotoghek", "Mibittara", "Huruahili", "Raldwicarn", "Ezdartlic", "Badesclema", "Isenkeyan", "Iadoitesu", "Yagrovoisi", "Ewcomechio", "Inunnunnoda", "Dischiutun", "Yuwarugha", "Ialmendra", "Reponudrle", "Rinjanagrbo", "Zeziceloh", "Oeileutasc", "Zicniijinis", "Dugnowarilda", "Neuxoisan", "Ilmenhorn", "Rukwatsuku", "Nepitzaspru", "Chcehoemig", "Haffneyrin", "Uliciawai", "Tuhgrespod", "Iousongola", "Odyalutai"
];

let currentGalaxy = "Euclid"; // domyślna

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("galaxyInput");
  const dropdown = document.getElementById("galaxyDropdown");

  // ustaw wartość inputa i odśwież sidebary na starcie
  if (input) input.value = currentGalaxy || "";
  refreshGalaxySidebar();
  refreshPlanetSidebar();

  if (!input || !dropdown) return;

  // pokazanie listy przy wpisywaniu
  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    dropdown.innerHTML = "";

    if (!val) {
      dropdown.style.display = "none";
      return;
    }

    const filtered = galaxies.filter(g => g.toLowerCase().includes(val));

    if (filtered.length === 0) {
      dropdown.style.display = "none";
      return;
    }

    filtered.forEach(g => {
      const option = document.createElement("div");
      option.textContent = g;
      option.addEventListener("click", () => {
        input.value = g;
        currentGalaxy = g; // ustawiamy aktualną galaktykę
        dropdown.style.display = "none";
        // od razu odświeżamy listy aby widać było filtrację
        refreshGalaxySidebar();
        refreshPlanetSidebar();
        console.log("Wybrano galaktykę:", currentGalaxy);
      });
      dropdown.appendChild(option);
    });

    dropdown.style.display = "block";
  });

  // zamknięcie dropdownu po kliknięciu poza
  document.addEventListener("click", e => {
    if (!e.target.closest(".galaxy-selector")) {
      dropdown.style.display = "none";
    }
  });
});
