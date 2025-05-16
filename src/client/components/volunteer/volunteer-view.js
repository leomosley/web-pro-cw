import { templates } from '../../index.mjs';
import { localStore } from '../../lib/localStore.mjs';
import {
  calculateElapsedTime,
  getRaceById,
  convertTimeToTimestamp,
} from '../../lib/utils.mjs';

class VolunteerView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });

    this.tasks = ['checkIn', 'checkOut', 'checkpoint'];
    const params = new URLSearchParams(window.location.search);
    this.raceId = params.get('id');
    this.task = params.get('task');
    this.checkpoint = params.has('checkpoint')
      ? Number(params.get('checkpoint'))
      : undefined;
    this.race = null;

    this.checkInTime = null;
    this.positions = [];
    this.passed = 0;
  }

  async connectedCallback() {
    if (!this.raceId) {
      this.renderNotFound();
      return;
    }

    await this.fetchRaceData();

    if (!this.race) {
      return;
    }

    this.loadFromlocalStore();

    const raceStarted =
      this.race.race_start_time && typeof this.race.race_start_time === 'string';

    if (!this.task || !this.tasks.includes(this.task)) {
      return this.renderChooseTask();
    }

    if ((this.task === 'checkOut' || this.task === 'checkpoint') && !raceStarted) {
      this.renderWaitingForStart();
      return;
    }

    this.render();
  }

  loadFromlocalStore() {
    const positionsKey = `${this.raceId}-positions`;
    const passedKey = `${this.raceId}-passed-${this.checkpoint}`;

    const savedPositions = localStore.getItem(positionsKey);
    if (savedPositions) {
      try {
        this.positions = JSON.parse(savedPositions);
      } catch (error) {
        this.positions = [];
      }
    }

    if (this.checkpoint !== undefined) {
      const savedPassed = localStore.getItem(passedKey);
      if (savedPassed) {
        try {
          this.passed = Number(savedPassed);
        } catch (error) {
          this.passed = 0;
        }
      }
    }
  }

  savePositionsTolocalStore() {
    const positionsKey = `${this.raceId}-positions`;
    localStore.setItem(positionsKey, JSON.stringify(this.positions));
  }

  savePassedTolocalStore() {
    if (this.checkpoint !== undefined) {
      const passedKey = `${this.raceId}-passed-${this.checkpoint}`;
      localStore.setItem(passedKey, String(this.passed));
    }
  }

  async fetchRaceData() {
    const result = await getRaceById(this.raceId, true, true);

    if (!result.success) {
      this.renderNotFound();
      this.race = null;
      return false;
    }

    this.race = result.race;
    this.parseCheckInTime();

    return true;
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = `<div><h1>Race Not Found</h1><p>The race with ID ${this.raceId} could not be loaded.</p></div>`;
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

  renderWaitingForStart() {
    this.shadowRoot.innerHTML = `
            <div>
                <h1>${this.race ? this.race.race_name : 'Race'}</h1>
                <p>Race date: ${this.race ? this.race.race_date : 'N/A'}</p>
                <p>Scheduled Race Start Time: ${this.race && this.race.race_start_time
        ? this.race.race_start_time
        : 'N/A'
      }</p>
                <p>Waiting for the race to start...</p>
                ${this.task
        ? `
                   <div>
                     <button data-task="checkIn">Go to Check-in</button>
                     <button data-task="checkOut" disabled>Check Out (Race not started)</button>
                     <button data-task="checkpoint" disabled>Checkpoint (Race not started)</button>
                   </div>
                `
        : ''
      }
            </div>
        `;
    this.shadowRoot.querySelectorAll('button[data-task]').forEach(button => {
      button.addEventListener('click', () => {
        const task = button.dataset.task;
        if (task === 'checkIn' || !button.disabled) {
          const params = new URLSearchParams(window.location.search);
          params.set('task', task);
          params.delete('checkpoint');
          window.location.search = params.toString();
        }
      });
    });
  }

  parseCheckInTime() {
    if (!this.race || !this.race.race_date || !this.race.check_in_open_time) {
      this.checkInTime = null;
      return;
    }

    try {
      this.checkInTime = convertTimeToTimestamp(this.race.check_in_open_time);
    } catch (error) {
      this.checkInTime = null;
    }
  }

  render() {
    if (!this.race) {
      return;
    }

    this.shadowRoot.innerHTML = '';


    const view = templates.volunteerView.content.cloneNode(true);


    view.querySelector('h1').textContent = this.race.race_name;
    view.querySelector('#race-date').textContent = `Race date: ${this.race.race_date}`;
    view.querySelector('#check-in-open-time').textContent = `Scheduled Check In Open Time: ${this.checkInTime ? new Date(this.checkInTime).toLocaleTimeString() : 'N/A'
      }`;
    view.querySelector('#race-start-time').textContent = `Race Start Time: ${this.race.race_start_time || 'Not started yet'
      }`;
    view.querySelector('#race-end-time').textContent = `Race End Time: ${this.race.race_end_time || 'Not ended yet'
      }`;


    const isRunning = this.race.race_start_time && !this.race.race_end_time;
    if (isRunning) {
      const startTimeStamp = convertTimeToTimestamp(this.race.race_start_time);
      const raceTimer = view.querySelector('race-timer');
      raceTimer.setAttribute('is-running', true);
      raceTimer.setAttribute('start-time', startTimeStamp);
    }


    const taskButtons = view.querySelector('#task-buttons');
    for (const task of this.tasks) {
      const button = document.createElement('button');
      button.textContent = task;
      button.dataset.task = task;

      const raceStarted =
        this.race.race_start_time && typeof this.race.race_start_time === 'string';
      if ((task === 'checkOut' || task === 'checkpoint') && !raceStarted) {
        button.disabled = true;
      }
      if (this.task === task) {
        button.disabled = true;
      }

      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('task', task);
        if (this.checkpoint !== undefined && task === 'checkpoint') {
          params.set('checkpoint', this.checkpoint);
        } else {
          params.delete('checkpoint');
        }
        params.set('id', this.raceId);
        window.location.search = params.toString();
      });

      taskButtons.append(button);
    }


    const taskContent = view.querySelector('[data-section="task-content"]');
    switch (this.task) {
      case 'checkIn':
        this.buildCheckInContent(taskContent);
        break;
      case 'checkOut':
        this.buildCheckOutContent(taskContent);
        break;
      case 'checkpoint':
        this.buildCheckpointContent(taskContent);
        break;
      default:
        taskContent.textContent = 'Invalid task.';
        break;
    }


    this.shadowRoot.append(view);
  }

  buildCheckInContent(wrapper) {
    const now = Date.now();
    let startTimeTimestamp = Infinity;
    try {
      if (this.race.race_start_time && typeof this.race.race_start_time === 'string') {
        startTimeTimestamp = convertTimeToTimestamp(this.race.race_start_time);
      }
    } catch (error) {
      // hanle error
    }

    if (this.checkInTime && now < this.checkInTime) {
      wrapper.append(this.createText('Check-in is not open yet.'));
    } else if (now >= startTimeTimestamp) {
      wrapper.append(
        this.createText('Check-in is closed. The race has already started.'),
      );
    } else {
      wrapper.append(this.createText('Check-in is open!'));
      const checkIn = document.createElement('check-in');
      checkIn.setAttribute('raceId', this.raceId);
      wrapper.append(checkIn);
    }
  }

  buildCheckOutContent(wrapper) {
    wrapper.append(this.createText('Check-out available.'));
    const checkOut = document.createElement('check-out');
    checkOut.setAttribute('raceId', this.raceId);
    wrapper.append(checkOut);
  }

  buildCheckpointContent(wrapper) {
    const header = document.createElement('header');
    const checkpoints = this.race.race_checkpoint || [];

    const validCheckpoint =
      this.checkpoint !== undefined &&
      !isNaN(this.checkpoint) &&
      this.checkpoint > 0 &&
      this.checkpoint <= checkpoints.length;

    const title = document.createElement('h2');
    title.textContent = validCheckpoint
      ? `Checkpoint ${this.checkpoint}`
      : 'Choose checkpoint';
    header.append(title);

    header.append(
      'Ask the race organiser where you checkpoint is located and head to it in order to fufil your role.',
    );
    wrapper.append(header);

    if (!validCheckpoint) {
      const list = document.createElement('ol');
      for (const checkpoint of checkpoints) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = checkpoint.checkpoint_name;
        button.addEventListener('click', () => {
          const params = new URLSearchParams(window.location.search);
          params.set('task', this.task);
          params.set('checkpoint', checkpoint.checkpoint_position);
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
        <span>Record participants crossing the finish line.</span>
      `;
      const recordFinish = document.createElement('button');
      recordFinish.textContent = 'Record Finish';
      recordFinish.addEventListener('click', () => {
        const now = Date.now();
        let startTime = 0;
        try {
          if (this.race.race_start_time && typeof this.race.race_start_time === 'string') {
            startTime = convertTimeToTimestamp(this.race.race_start_time);
          }
        } catch (error) {
          // handle error
        }

        const time = calculateElapsedTime(startTime, now, true);
        this.positions.push(time);
        this.savePositionsTolocalStore();
        this.renderPositionsList(wrapper);
      });
      wrapper.append(recordFinish);

      const undoButton = document.createElement('button');
      undoButton.textContent = 'Undo';
      undoButton.addEventListener('click', () => {
        if (this.positions.length > 0) {
          this.positions.pop();
          this.savePositionsTolocalStore();
          this.renderPositionsList(wrapper);
        }
      });
      wrapper.append(undoButton);
      this.renderPositionsList(wrapper);

      const submitRecording = document.createElement('button');
      submitRecording.textContent = 'Submit Recordings';
      submitRecording.addEventListener('click', this.handleSubmitPositions.bind(this));
      wrapper.append(submitRecording);
    }

    if (this.checkpoint === 1) {
      wrapper.innerHTML += `
         <h2>Start</h2>
         <span>This is the start of the race. Participants begin from here.</span>
       `;
      const button = document.createElement('button');
      button.textContent = 'Go to Check-in';
      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('task', 'checkIn');
        params.delete('checkpoint');
        window.location.search = params.toString();
      });
      wrapper.append(button);
    }

    if (this.checkpoint > 1 && this.checkpoint < checkpoints.length) {
      const recordPass = document.createElement('button');
      recordPass.textContent = 'Record Pass';
      recordPass.addEventListener('click', () => {
        this.passed++;
        this.savePassedTolocalStore();
        this.renderPassedCounter(wrapper);
      });
      wrapper.append(recordPass);

      const undoButton = document.createElement('button');
      undoButton.textContent = 'Undo';
      undoButton.addEventListener('click', () => {
        if (this.passed > 0) {
          this.passed--;
          this.savePassedTolocalStore();
          this.renderPassedCounter(wrapper);
        }
      });
      wrapper.append(undoButton);
      this.renderPassedCounter(wrapper);

      const submitRecording = document.createElement('button');
      submitRecording.textContent = 'Submit Recordings';
      submitRecording.addEventListener('click', this.handleSubmitPassed.bind(this));
      wrapper.append(submitRecording);
    }
  }

  renderPassedCounter(wrapper) {
    const existingCounter = wrapper.querySelector('#passed-counter');
    if (!existingCounter) {
      const container = document.createElement('div');
      container.id = 'passed-counter-container';

      const label = document.createElement('span');
      label.textContent = 'Participants Passed: ';
      container.append(label);

      const countSpan = document.createElement('span');
      countSpan.id = 'passed-counter';
      countSpan.textContent = this.passed;
      container.append(countSpan);

      wrapper.append(container);
      return;
    }

    existingCounter.textContent = this.passed;
  }

  renderPositionsList(wrapper) {
    const existingList = wrapper.querySelector('#position-list');
    if (existingList) {
      existingList.remove();
    }

    const positionList = document.createElement('ol');
    positionList.id = 'position-list';
    for (const time of this.positions) {
      const li = document.createElement('li');
      li.textContent = time;
      positionList.append(li);
    }
    wrapper.append(positionList);
  }

  async handleSubmitPositions() {
    if (!this.positions || this.positions.length === 0) {
      return;
    }

    const response = await fetch(`/api/race/${this.raceId}/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        positions: this.positions,
      }),
    });

    if (response.ok) {
      localStore.removeItem(`${this.raceId}-positions`);
      this.positions = [];
      this.renderPositionsList(this.shadowRoot.querySelector(
        '[data-section="task-content"]',
      ));
    }
  }

  async handleSubmitPassed() {
    //
  }

  createText(text) {
    const el = document.createElement('p');
    el.textContent = text;
    return el;
  }
}

customElements.define('volunteer-view', VolunteerView);
