import { localStore } from "../lib/localStore.mjs";

class RaceList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.races = [];
  }

  connectedCallback() {
    this.loadRaces();
    window.addEventListener("storage", this.handleStorageChange);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("storage", this.handleStorageChange);
  }

  handleStorageChange = (event) => {
    if (event.key === "race") {
      this.loadRaces();
      this.render();
    }
  };

  loadRaces() {
    const storedRaces = localStore.getItem("race");
    this.races = storedRaces ?? [];
  }

  render() {
    this.shadowRoot.innerHTML = "";

    const listItemTemplate = document.createElement("template");
    listItemTemplate.innerHTML = `<li><a></a></li>`;

    if (this.races.length === 0) {
      const noRacesMessage = document.createElement("p");
      noRacesMessage.textContent = "No races available.";
      this.shadowRoot.appendChild(noRacesMessage);
    } else {
      const list = document.createElement("ul");
      for (const race of this.races) {
        const listItem = listItemTemplate.content.cloneNode(true)
          .querySelector("a");

        listItem.textContent = race.race_name;
        listItem.setAttribute("href", `/app/organise/race?&id=${1}`)
        list.appendChild(listItem);
      }
      this.shadowRoot.appendChild(list);
    }
  }
}

customElements.define("race-list", RaceList);