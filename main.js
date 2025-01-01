const getData = async function () {
  const res = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?metacritic=80&upperprice=10&sortBy=Savings&lowerPrice=1`
  );
  const data = await res.json();
  console.log(data);

  return data;
};

let itemsCounter = 0;
function createSpecialOffers(data) {
  const salesContainer = document.querySelector(".sales__row");

  const newArr = data.filter((item, pos, arr) => {
    return arr.findIndex((el) => el.title === item.title) === pos;
  });

  const itemsLeft = Math.min(10, newArr.length - itemsCounter);

  itemsLeft === 0 ? (showMoreBtn.disabled = true) : true;

  for (let i = 0; i < itemsLeft; i++) {
    const { title, metacriticScore, normalPrice, salePrice, savings, thumb } = newArr[itemsCounter];
    itemsCounter++;

    const html = `
        <div class="sales__item">
          <div class="sales__item-img">
            <img
              src="${thumb}"
              alt="${title}"
            />
          </div>
          <div class="sales__item-text">
            <div class="sales__item-title">${title}</div>
            <div class="sales__item-rating">Rating <br> <span>${metacriticScore}</span> / 100</div>
            <div class="sales__item-price__wrapper">
              <div class="sales__item-percent">-${parseFloat(savings).toFixed(0)}%</div>
              <div class="sales__item-price">
                <span>$${parseFloat(normalPrice)}</span> <br />
                $${parseFloat(salePrice)}
              </div>
            </div>
          </div>
        </div>
      `;

    salesContainer.insertAdjacentHTML("beforeend", html);
  }
}

const showMoreBtn = document.querySelector("[data-show-more-btn]");
showMoreBtn.addEventListener("click", () => {
  getData().then((data) => {
    createSpecialOffers(data);
  });
});

getData().then((data) => {
  createSpecialOffers(data);
});

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

async function getGameFromSearch(val) {
  const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${val}&limit=20`);
  const data = res.json();

  return data;
}

const mainElems = document.querySelector("main").children;
const catalog = document.querySelector(".catalog");
const profile = document.querySelector(".profile");

const debouncedSearch = debounce((value) => {
  for (const elem of mainElems) {
    if (value === "") {
      elem.classList.remove("hidden");
      catalog.classList.add("hidden");
    } else {
      catalog.classList.remove("hidden");
      elem.classList.add("hidden");
      profile.classList.add("hidden");
    }
  }

  const catalogContainer = document.querySelector(".catalog__grid");
  catalogContainer.innerHTML = "";

  const loader = document.querySelector(".loader");
  loader.classList.remove("hidden");

  getGameFromSearch(value).then((data) => {
    loader.classList.add("hidden");

    const newArr = data.filter((item, pos, arr) => {
      return arr.findIndex((el) => el.external === item.external) === pos;
    });

    newArr.forEach((item) => {
      const { cheapest, external, steamAppID, thumb } = item;

      const html = `
        <div class="catalog__item">
        <div class="catalog__item-name">${external}</div>
        <div class="catalog__item-img">
        <img src=${thumb} alt=${external}>
        </div>
        <div class="catalog__item-price">$${cheapest}</div>
        <div class="catalog__item-link">
        <a href="https://store.steampowered.com/app/${steamAppID}">Check this game on Steam</a>
        </div>
        </div>
        `;

      catalogContainer.insertAdjacentHTML("beforeend", html);
    });
  });
}, 500);

const searchInput = document.querySelector(".search__input");
searchInput.addEventListener("input", () => {
  debouncedSearch(searchInput.value);
});

let cardsData = [];
let username = "Enter your name";

// LocalStorage
function saveToLocalStorage() {
  localStorage.setItem("cardsData", JSON.stringify(cardsData));
  localStorage.setItem("username", profileName.innerText);
}

if (localStorage.getItem("cardsData")) {
  cardsData = JSON.parse(localStorage.getItem("cardsData"));
  changeStats();
  username = localStorage.getItem("username");
}

const modal = document.querySelector(".modal-add");
const modalCard = document.querySelector(".modal-add__card");
const modalSelectedTitle = document.querySelector(".modal-add__card-selected");
const modalRemoveItem = document.querySelector(".modal-add__card-select__item--remove");
const modalCardSelect = document.querySelector(".modal-add__card-select");
const modalCardTitle = document.querySelector(".modal-add__card-title");

modalCard.addEventListener("click", (event) => {
  if (event.target.matches(".modal-add__card-selected")) {
    modalCardSelect.classList.remove("hidden");
  }

  // open categories and delete card from array and counter
  if (event.target.matches(".modal-add__card-select__item")) {
    modalSelectedTitle.innerText = event.target.innerText;
    modalRemoveItem.classList.remove("hidden");

    if (modalSelectedTitle.innerText === modalRemoveItem.innerText) {
      modalSelectedTitle.innerHTML = "<strong>+</strong>Add to...";
      for (let i = 0; i < cardsData.length; i++) {
        const elem = cardsData[i];

        if (elem.title === selectedCardInfo.title) {
          cardsData.splice(i, 1);
          break;
        }
      }
      modal.classList.add("hidden");
      changeStats();
    }

    modalCardSelect.classList.add("hidden");

    saveToLocalStorage();
  }

  // Update selected and push to array
  if (event.target.matches(".modal-add__card-btn")) {
    if (modalSelectedTitle.textContent === "+Add to...") return;

    const newCardInfo = { ...selectedCardInfo };
    newCardInfo.selected = modalSelectedTitle.textContent;

    let isUpdated = false;
    for (let i = 0; i < cardsData.length; i++) {
      if (newCardInfo.title === cardsData[i].title) {
        cardsData[i].selected = newCardInfo.selected;
        isUpdated = true;
        break;
      }
    }

    if (!isUpdated) {
      cardsData.push(newCardInfo);
    }

    changeStats();

    modal.classList.add("hidden");

    saveToLocalStorage();
  }
});

const selectedCardInfo = {};
// Update selectedCardInfo and modalSelectedTitle
document.addEventListener("click", (event) => {
  const catalogCard = event.target.closest(".catalog__item");
  const salesCard = event.target.closest(".sales__item");

  if (catalogCard || salesCard) {
    modal.classList.remove("hidden");

    if (catalogCard) {
      selectedCardInfo.title = catalogCard.querySelector(".catalog__item-name").innerText;
      selectedCardInfo.img = catalogCard.querySelector("img").src;
    } else if (salesCard) {
      selectedCardInfo.title = salesCard.querySelector(".sales__item-title").innerText;
      selectedCardInfo.img = salesCard.querySelector("img").src;
    }

    modalCardTitle.innerText = selectedCardInfo.title;

    for (const elem of cardsData) {
      if (elem.title === selectedCardInfo.title) {
        modalSelectedTitle.innerText = elem.selected;
        break;
      } else {
        modalSelectedTitle.innerHTML = "<strong>+</strong>Add to...";
      }
    }
  }
});

// Change ProfileStats on home page
function changeStats() {
  const profileStatsTitles = document.querySelectorAll(".profile-stats__grid-item__title");

  for (const profileStatTitle of profileStatsTitles) {
    profileStatTitle.nextElementSibling.innerText = 0;
  }

  cardsData.forEach((item) => {
    for (const profileStatTitle of profileStatsTitles) {
      if (item.selected.toLowerCase() === profileStatTitle.dataset.stats.toLowerCase()) {
        profileStatTitle.nextElementSibling.innerText =
          parseInt(profileStatTitle.nextElementSibling.innerText) + 1;
      }
    }
  });
}

// toggle profile
const headerRow = document.querySelector(".header__row");

headerRow.addEventListener("click", (event) => {
  if (event.target.closest(".logo") || event.target.closest(".nav__item")) {
    catalog.classList.add("hidden");
  }

  if (event.target.closest(".nav__item")) {
    profile.classList.remove("hidden");
    for (const elem of mainElems) {
      elem.classList.add("hidden");
    }

    applyCurrentFilter();
  }
  if (event.target.closest(".logo")) {
    profile.classList.add("hidden");
    for (const elem of mainElems) {
      elem.classList.remove("hidden");
    }
  }

  updateProfileStats();
});

// PROFILE
const profileStats = document.querySelectorAll(".profile__stats-item");

function updateProfileStats() {
  profileStats.forEach((item) => {
    const profileStatsCounter = {
      total: 0,
      wishlist: 0,
      reviews: 0,
    };
    const profileStatNum = item.querySelector(".profile__stats-item__num");

    for (const card of cardsData) {
      if (
        card.selected === "Played" ||
        card.selected === "Dropped" ||
        card.selected === "Favorite"
      ) {
        profileStatsCounter.total += 1;
      } else if (card.selected === "Wishlist") {
        profileStatsCounter.wishlist += 1;
      }
    }

    if (profileStatNum.dataset.profile === "total") {
      addZerosToProfileStat("total", profileStatNum, profileStatsCounter);
    }

    if (profileStatNum.dataset.profile === "wishlist") {
      addZerosToProfileStat("wishlist", profileStatNum, profileStatsCounter);
    }
  });
}

function addZerosToProfileStat(category, stat, counter) {
  if (cardsData.length > 99) stat.innerText = counter[category];
  else if (cardsData.length < 10) stat.innerText = `00${counter[category]}`;
  else stat.innerText = `0${counter[category]}`;
}

// tabs
const tabsBtns = document.querySelectorAll(".profile__tab");
const profileTabs = document.querySelectorAll("[data-profile-tab]");

tabsBtns.forEach((item, index) => {
  item.addEventListener("click", () => {
    tabsBtns.forEach((item) => item.classList.remove("profile__tab--active"));
    item.classList.add("profile__tab--active");

    profileTabs.forEach((item) => item.classList.add("hidden"));
    profileTabs[index].classList.remove("hidden");
  });
});

function addGameToProfile(arr = cardsData) {
  const profileGamesContainer = document.querySelector(".profile__games-grid");
  profileGamesContainer.innerHTML = "";

  for (const item of arr) {
    const { img, selected, title } = item;

    const html = `
      <div class="profile-game__item">
        <div class="profile-game__name">${title}</div>
        <div class="profile-game__img">
          <img
          src=${img}
          alt=${title}>
        </div>
        <div class="profile-game__selected">${selected}</div>
      </div>
    `;

    profileGamesContainer.insertAdjacentHTML("beforeend", html);
  }
}

let currentFilter = "All";
function applyCurrentFilter() {
  const profileGamesFilterItems = document.querySelectorAll(".profile__games-filter__item");
  profileGamesFilterItems.forEach((item) =>
    item.classList.remove("profile__games-filter__item--active")
  );

  const activeFilter = Array.from(profileGamesFilterItems).find(
    (item) => item.innerText === currentFilter
  );

  if (activeFilter) activeFilter.classList.add("profile__games-filter__item--active");

  if (currentFilter === "All") {
    addGameToProfile();
  } else {
    const filteredGames = cardsData.filter((item) => item.selected == currentFilter);
    addGameToProfile(filteredGames);
  }
}

const profileGamesFilter = document.querySelector(".profile__games-filter");
profileGamesFilter.addEventListener("click", (event) => {
  if (event.target.matches(".profile__games-filter__item")) {
    const profileGamesFilterItems = document.querySelectorAll(".profile__games-filter__item");

    profileGamesFilterItems.forEach((item) =>
      item.classList.remove("profile__games-filter__item--active")
    );

    event.target.classList.add("profile__games-filter__item--active");
    currentFilter = event.target.innerText;

    if (currentFilter === "All") {
      addGameToProfile();
    } else {
      const newArr = cardsData.filter((item) => item.selected == currentFilter);
      addGameToProfile(newArr);
    }
  }
});

// profile customization
const profileName = document.querySelector(".profile__person-name");
const profileNameInput = document.querySelector(".profile__person-name__input");
console.log(username);

profileName.innerText = username;

profileName.addEventListener("click", () => {
  profileName.classList.add("hidden");
  profileNameInput.classList.remove("hidden");
  profileNameInput.focus();
});

profileNameInput.addEventListener("blur", () => {
  profileName.classList.remove("hidden");
  profileName.innerText = profileNameInput.value;
  profileNameInput.classList.add("hidden");

  saveToLocalStorage();
});
