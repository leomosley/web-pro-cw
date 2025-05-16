import { icons, templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';

class HomeView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.roles = [
      { label: 'Organise', view: 'organise', icon: icons.organiser, description: 'Create new races or manage previously created ones.' },
      { label: 'View', view: 'view', icon: icons.view, description: 'Spectate ongoing races when invited to by the organiser.' },
      { label: 'Volunteer', view: 'volunteer', icon: icons.volunteer, description: 'Carry out duties as a marshal when asked to by an organiser.' },
      { label: 'Participant', view: 'participant', icon: icons.participant, description: 'Check into an upcoming race or view races you competed in the past.' },
    ];

    this.handleUserChange = this.handleUserChange.bind(this);
    this.renderRoles = this.renderRoles.bind(this);
    this.favoritedRoleIndex = null;
    this.updateFavoritedDisplay = this.updateFavoritedDisplay.bind(this);
  }

  connectedCallback() {
    this.user = userStore.get();
    this.render();

    this.unsubscribe = userStore.watch(this.handleUserChange);
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    this.render();
  }

  updateFavoritedDisplay() {
    const favoritedContainer = this.shadowRoot.querySelector('figure');
    if (!favoritedContainer) {
      return;
    }

    favoritedContainer.innerHTML = '';

    switch (this.user?.role) {
      case 'organiser':
        this.favoritedRoleIndex = 0;
        break;
      case 'viewer':
        this.favoritedRoleIndex = 1;
        break;
      case 'volunteer':
        this.favoritedRoleIndex = 2;
        break;
      default:
        this.favoritedRoleIndex = 3;
        break;
    }

    const favoritedRoleItem = templates.favoritedRoleItem.content.cloneNode(true);
    const navButton = favoritedRoleItem.querySelector('nav-button');
    const favoritedItem = this.roles[this.favoritedRoleIndex];

    navButton.setAttribute('view', favoritedItem.view);

    const label = navButton.querySelector('h2');
    label.innerHTML = favoritedItem.icon;
    label.append(' ' + favoritedItem.label);

    const description = navButton.querySelector('span');
    description.textContent = favoritedItem.description;

    favoritedContainer.append(favoritedRoleItem);
  }

  renderRoles() {
    const routeListUl = this.shadowRoot.querySelector('nav ul');
    if (!routeListUl) {
      return;
    }

    routeListUl.innerHTML = '';

    const filteredRoles = this.roles.filter((_, index) => index !== this.favoritedRoleIndex);

    for (const role of filteredRoles) {
      const roleItem = templates.roleItem.content.cloneNode(true);
      const navButton = roleItem.querySelector('nav-button');

      const label = navButton.querySelector('h2');
      label.innerHTML = role.icon;
      label.append(' ' + role.label);

      const description = navButton.querySelector('span');
      description.textContent = role.description;

      navButton.setAttribute('view', role.view);

      routeListUl.append(roleItem);
    }
  }

  render() {
    this.shadowRoot.innerHTML = '';

    this.shadowRoot.append(templates.homeView.content.cloneNode(true));
    this.updateFavoritedDisplay();
    this.renderRoles();
  }
}

customElements.define('home-view', HomeView);
