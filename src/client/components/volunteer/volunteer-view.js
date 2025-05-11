import {
  calculateElapsedTime,
  getRaceById,
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
    this.checkpoint = Number(params.get('checkpoint'));

    this.race = null;
    this.raceTimerElement = null;

    this.scheduledCheckInTime = null;
  }

  async connectedCallback() {
    if (!this.raceId) {
      this.renderNotFound();
      return;
    }

    await this.fetchRaceData();

    if (!this.race) return;

    const raceStarted = this.race.race_start_time && typeof this.race.race_start_time === 'number';


    if (!this.task || !this.tasks.includes(this.task)) {
      return this.renderChooseTask();
    }

    if ((this.task === 'checkOut' || this.task === 'checkpoint') && !raceStarted) {
      this.renderWaitingForStart();
      return;
    }


    this.render();
  }


  async fetchRaceData() {
    const result = await getRaceById(this.raceId, true, true);

    if (!result.success) {
      this.renderNotFound();
      this.race = null;
      return false;
    }

    this.race = result.race;
    this.parseScheduledCheckInTime();
    console.log('Race data fetched for volunteer:', this.race);
    return true;
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = '<div><h1>Race Not Found</h1><p>The race with ID ${this.raceId} could not be loaded.</p></div>';
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
                <p>Scheduled Race Start Time: ${this.race && this.race.race_start_time && typeof this.race.race_start_time === 'string' ? this.race.race_start_time : 'N/A'}</p>
                <p>Waiting for the race to start...</p>
                ${this.task
? `
                   <div>
                     <button data-task="checkIn">Go to Check-in</button>
                     <button data-task="checkOut" disabled>Check Out (Race not started)</button>
                     <button data-task="checkpoint" disabled>Checkpoint (Race not started)</button>
                   </div>
                `
: ''}
            </div>
        `;
    this.shadowRoot.querySelectorAll('button[data-task]').forEach(button => {
      button.addEventListener('click', () => {
        const task = button.dataset.task;
        if (task === 'checkIn' || !button.disabled) {
          const params = new URLSearchParams(window.location.search);
          params.set('task', task);
          params.delete('checkpoint'); // Clear checkpoint when switching tasks
          window.location.search = params.toString();
        }
      });
    });
  }


  parseScheduledCheckInTime() {
    if (!this.race || !this.race.race_date || !this.race.check_in_open_time) {
      console.warn('Missing required race data to parse scheduled check-in time.');
      this.scheduledCheckInTime = null;
      return;
    }

    try {
      const raceDate = new Date(this.race.race_date);
      if (isNaN(raceDate.getTime())) throw new Error('Invalid race date format.');
      const [checkInHours, checkInMinutes] = this.race.check_in_open_time.split(':').map(Number);
      if (checkInHours === undefined || checkInMinutes === undefined) throw new Error('Invalid check-in time format (expected hh:mm).');
      this.scheduledCheckInTime = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate(), checkInHours, checkInMinutes, 0);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (this.scheduledCheckInTime.getTime() < now - oneDay) {
        console.warn('Scheduled check-in time is more than a day in the past. It might be for a future date.');
      }
    } catch (error) {
      console.error('Error parsing scheduled check-in time:', error);
      this.scheduledCheckInTime = null;
    }
  }


  render() {
    if (!this.race) return;

    this.shadowRoot.innerHTML = '';

    const container = document.createElement('div');

    const title = document.createElement('h1');
    title.textContent = this.race.race_name;
    container.append(title);

    const raceDateElem = document.createElement('p');
    raceDateElem.textContent = `Race date: ${this.race.race_date}`;
    container.append(raceDateElem);

    const checkInTimeElem = document.createElement('p');
    checkInTimeElem.textContent = `Scheduled Check In Open Time: ${this.scheduledCheckInTime ? this.scheduledCheckInTime.toLocaleTimeString() : 'N/A'}`;
    container.append(checkInTimeElem);

    const startTimeElem = document.createElement('p');
    startTimeElem.textContent = `Race Start Time: ${this.race.race_start_time ? new Date(this.race.race_start_time).toLocaleTimeString() : 'Not started yet'}`;
    container.append(startTimeElem);

    const endTimeElem = document.createElement('p');
    endTimeElem.textContent = `Race End Time: ${this.race.race_end_time ? new Date(this.race.race_end_time).toLocaleTimeString() : 'Not ended yet'}`;
    container.append(endTimeElem);

    this.raceTimerElement = document.createElement('race-timer');
    // Pass the actual start time (timestamp) to the timer only if race has started and not ended
    if (this.race.race_start_time && typeof this.race.race_start_time === 'number' && !this.race.race_end_time) {
      this.raceTimerElement.setAttribute('start-time', this.race.race_start_time);
    }
    container.append(this.raceTimerElement);


    const tabBar = document.createElement('div');
    for (const task of this.tasks) {
      const button = document.createElement('button');
      button.textContent = task;
      button.dataset.task = task;
      const raceStarted = this.race.race_start_time && typeof this.race.race_start_time === 'number';
      if ((task === 'checkOut' || task === 'checkpoint') && !raceStarted) {
        button.disabled = true;
      }

      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('task', task);
        if (this.checkpoint && task === 'checkpoint') {
          params.set('checkpoint', this.checkpoint);
        } else {
          params.delete('checkpoint');
        }
        window.location.search = params.toString();
      });
      tabBar.append(button);
    }
    container.append(tabBar);


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
    const now = Date.now();
    const startTimeTimestamp = this.race.race_start_time && typeof this.race.race_start_time === 'number' ? this.race.race_start_time : Infinity;

    if (this.scheduledCheckInTime && now < this.scheduledCheckInTime.getTime()) {
      wrapper.append(this.createText('Check-in is not open yet.'));
    } else if (now >= startTimeTimestamp) {
      wrapper.append(this.createText('Check-in is closed. The race has already started.'));
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
    const header = document.createElement('h2');
    const checkpoints = this.race.race_checkpoint;
    const validCheckpoint = this.checkpoint && (this.checkpoint > 0 && this.checkpoint <= checkpoints.length);

    header.textContent = validCheckpoint ? `Checkpoint ${this.checkpoint}` : 'Choose checkpoint';
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
        <h2>Finish</h2>
        <span>Record participants crossing the finish line.</span>
      `;
      const recordFinish = document.createElement('button');
      recordFinish.textContent = 'Record Finish';
      recordFinish.addEventListener('click', () => {
        const now = Date.now();
        // Use race.race_start_time (timestamp) which is guaranteed to exist here
        const time = calculateElapsedTime(this.race.race_start_time, now);
        this.positions.push(time); // positions needs to be stored somewhere persistent for a real app
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
      button.textContent = 'Go to Check-in';
      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('task', 'checkIn');
        params.delete('checkpoint');
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

  createText(text) {
    const el = document.createElement('p');
    el.textContent = text;
    return el;
  }
}

customElements.define('volunteer-view', VolunteerView);
