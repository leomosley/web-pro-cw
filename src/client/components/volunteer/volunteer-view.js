import { calculateElapsedTime, getRaceById } from '../../lib/utils.mjs';

class VolunteerView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.tasks = ['checkIn', 'checkOut', 'checkpoint'];
    const params = new URLSearchParams(window.location.search);
    this.raceId = params.get('id');
    this.task = params.get('task');
    this.checkpoint = Number(params.get('checkpoint'));

    this.race = null;
    this.raceTimerElement = null;
    this.autoStartTimer = null;
    this.positions = [];
  }

  connectedCallback() {
    if (!this.raceId) return this.renderNotFound();
    this.race = getRaceById(this.raceId);
    if (!this.race) return this.renderNotFound();

    if (!this.task || !this.tasks.includes(this.task)) {
      return this.renderChooseTask();
    }

    this.render();
    this.checkAndAutoStartRace();
  }

  disconnectedCallback() {
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
    }
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = '<div><h1>Race Not Found</h1></div>';
  }

  renderChooseTask() {
    this.shadowRoot.innerHTML = '<h1>Choose Task</h1>';
    for (const task of this.tasks) {
      const button = document.createElement('button');
      button.textContent = task;
      button.dataset.task = task;
      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('task', task);
        window.location.search = params.toString();
      });
      this.shadowRoot.append(button);
    }
  }

  render() {
    this.shadowRoot.innerHTML = '';

    const container = document.createElement('div');

    const title = document.createElement('h1');
    title.textContent = this.race.race_name;
    container.append(title);

    const now = new Date();
    const offset = Math.random() > 0.5 ? 0 : 30;

    this.startTime = new Date(now.getTime() + (offset * 60000));
    this.checkInTime = new Date((this.startTime.getTime() - 20) * 60000);

    const startTimeElem = document.createElement('p');
    startTimeElem.textContent = `Race Start Time: ${this.startTime.toLocaleTimeString()}`;
    container.append(startTimeElem);

    this.raceTimerElement = document.createElement('race-timer');
    this.raceTimerElement.setAttribute('start-time', this.startTime.getTime());
    container.append(this.raceTimerElement);

    if (this.task) {
      const tabBar = document.createElement('div');
      for (const task of this.tasks) {
        const button = document.createElement('button');
        button.textContent = task;
        button.dataset.task = task;
        button.addEventListener('click', () => {
          const params = new URLSearchParams(window.location.search);
          params.set('task', task);
          window.location.search = params.toString();
        });
        tabBar.append(button);
      }
      container.append(tabBar);
    }

    const taskContentWrapper = document.createElement('div');
    taskContentWrapper.dataset.section = 'task-content';

    switch (this.task) {
      case 'checkIn':
        this.buildCheckInContent(taskContentWrapper);
        break;
      case 'checkOut':
        this.buildCheckOutContent(taskContentWrapper);
        break;
      case 'checkpoint':
        this.buildCheckpointContent(taskContentWrapper);
        break;
      default:
        taskContentWrapper.textContent = 'Invalid task.';
        break;
    }

    container.append(taskContentWrapper);
    this.shadowRoot.append(container);
  }

  buildCheckInContent(wrapper) {
    const now = new Date();

    if (now < this.checkInTime) {
      wrapper.append(this.createText('Check-in is not open yet.'));
    } else if (now >= this.startTime) {
      wrapper.append(this.createText('Check-in is closed. The race has already started.'));
    } else {
      wrapper.append(this.createText('Check-in is open!'));
      const checkIn = document.createElement('check-in');
      checkIn.setAttribute('raceId', this.raceId);
      wrapper.append(checkIn);
    }
  }

  buildCheckOutContent(wrapper) {
    const now = new Date();

    if (now < this.startTime) {
      wrapper.append(this.createText('Check-out not available. The race hasn’t started yet.'));
    } else {
      wrapper.append(this.createText('Check-out available.'));
      const checkOut = document.createElement('check-out');
      checkOut.setAttribute('raceId', this.raceId);
      wrapper.append(checkOut);
    }
  }

  buildCheckpointContent(wrapper) {
    const header = document.createElement('h2');
    const checkpoints = [
      { position: 1, name: 'Start' },
      { position: 2, name: '2' },
      { position: 3, name: '3' },
      { position: 4, name: '4' },
      { position: 5, name: 'Finish' },
    ];

    const validCheckpoint = this.checkpoint && (this.checkpoint > 0 && this.checkpoint <= checkpoints.length);

    header.textContent = validCheckpoint ? `Checkpoint ${this.checkpoint}` : 'Choose checkpoint';
    wrapper.append(header);

    if (!validCheckpoint) {
      const list = document.createElement('ol');
      for (const checkpoint of checkpoints) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = checkpoint.name;
        button.addEventListener('click', () => {
          const params = new URLSearchParams(window.location.search);
          params.set('checkpoint', checkpoint.position);
          window.location.search = params.toString();
        });
        li.append(button);
        list.append(li);
      }
      wrapper.append(list);
      return;
    }


    if (this.checkpoint === checkpoints.length) {
      wrapper.innerHTML += `
        <h2>Finish</h2>
        <span>Record participants crossing the finish line.</span>
      `;
      const recordFinish = document.createElement('button');
      recordFinish.textContent = 'Record Finish';
      recordFinish.addEventListener('click', () => {
        const now = new Date();
        const time = calculateElapsedTime(this.startTime, now.getTime());
        this.positions.push(time);
        this.renderPositionsList(wrapper);
      });
      wrapper.append(recordFinish);

      const undoButton = document.createElement('button');
      undoButton.textContent = 'Undo';
      undoButton.addEventListener('click', () => {
        if (this.positions.length > 0) {
          this.positions.pop();
          this.renderPositionsList(wrapper);
        }
      });
      wrapper.append(undoButton);
      this.renderPositionsList(wrapper);

      return;
    }

    if (this.checkpoint === 1) {
      wrapper.innerHTML += `
        <h2>Start</h2>
        <span>This is the start of the race.</span>
      `;
      const button = document.createElement('button');
      button.textContent = 'Check In Runners';
      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('task', 'checkIn');
        window.location.search = params.toString();
      });
      wrapper.append(button);
    }
  }

  renderPositionsList(wrapper) {
    const existingList = wrapper.querySelector('ol');
    if (existingList) {
      existingList.remove();
    }

    const positionList = document.createElement('ol');
    for (const time of this.positions) {
      const li = document.createElement('li');
      li.textContent = time;
      positionList.append(li);
    }
    wrapper.append(positionList);
  }

  createTimeLabel(label, value) {
    const el = document.createElement('p');
    el.textContent = `${label}: ${value}`;
    return el;
  }

  createText(text) {
    const el = document.createElement('p');
    el.textContent = text;
    return el;
  }

  checkAndAutoStartRace() {
    if (!this.startTime || !this.raceTimerElement) return;

    const now = Date.now();
    const delay = this.startTime - now;

    if (delay <= 0) {
      this.startRace();
    } else {
      this.autoStartTimer = setTimeout(() => {
        this.startRace();
        console.log('Race started automatically.');
      }, delay);
    }
  }

  startRace() {
    if (this.raceTimerElement?.timerInterval) {
      console.log('Race timer is already running.');
    } else {
      this.raceTimerElement.startTime = Date.now();
      this.raceTimerElement.saveStartTime();
      this.raceTimerElement.startTimer();
      console.log('Race started manually.');
    }
  }

  stopRace() {
    if (this.raceTimerElement?.timerInterval) {
      this.raceTimerElement.stopTimer();
      console.log('Race stopped manually.');
    } else {
      console.log('Race timer is already stopped or missing.');
    }
  }
}

customElements.define('volunteer-view', VolunteerView);
