import { templates } from '../../index.mjs';

class CreateRaceForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentStep = 1;
    this.formData = {};
    this.totalSteps = 2;
    this.handles = {};
    this.checkpoints = [];

    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.saveStepData = this.saveStepData.bind(this);
    this.loadStepData = this.loadStepData.bind(this);
    this.updateButtonVisibility = this.updateButtonVisibility.bind(this);
    this.getHandles = this.getHandles.bind(this);
    this.handleAddCheckpoint = this.handleAddCheckpoint.bind(this);
    this.handleDeleteCheckpoint = this.handleDeleteCheckpoint.bind(this);
    this.renderCheckpoints = this.renderCheckpoints.bind(this);
  }

  resetForm() {
    this.currentStep = 1;
    this.formData = {};
    this.checkpoints = [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  getHandles() {
    this.handles.stepSections = this.shadowRoot.querySelectorAll('section[data-step]');
    this.handles.prevButton = this.shadowRoot.querySelector('[data-type="prev"]');
    this.handles.nextButton = this.shadowRoot.querySelector('[data-type="next"]');
    this.handles.submitButton = this.shadowRoot.querySelector('[data-type="submit"]');
    this.handles.addCheckpointButton = this.shadowRoot.querySelector('button[data-type="add-checkpoint"]');
    this.handles.checkpointList = this.shadowRoot.querySelector('section[data-step="2"] ol');
    this.handles.finishCheckpointInput = this.shadowRoot.querySelector('section[data-step="2"] input[placeholder="Finish"]');
  }

  saveStepData() {
    const currentStepSection = this.handles.stepSections[this.currentStep - 1];
    const inputs = currentStepSection.querySelectorAll('input');

    for (const input of inputs) {
      if (input.name) {
        this.formData[input.name] = input.value;
      }
    }

    this.formData.checkpoints = this.checkpoints;
  }

  loadStepData() {
    const currentStepSection = this.handles.stepSections[this.currentStep - 1];
    const inputs = currentStepSection.querySelectorAll('input');

    for (const input of inputs) {
      if (input.name && this.formData[input.name] !== undefined) {
        input.value = this.formData[input.name];
      }
    }
    if (this.currentStep === 2) {
      this.renderCheckpoints();
    }
  }

  updateButtonVisibility() {
    this.handles.prevButton.disabled = this.currentStep === 1;
    this.handles.nextButton.classList.toggle('hidden', this.currentStep === this.totalSteps);
    this.handles.submitButton.classList.toggle('hidden', this.currentStep !== this.totalSteps);
  }

  handleNext() {
    this.saveStepData();

    if (this.currentStep < this.totalSteps) {
      this.currentStep += 1;
      this.render();
    }
  }

  handlePrev() {
    this.saveStepData();

    if (this.currentStep > 1) {
      this.currentStep -= 1;
      this.render();
    }
  }

  handleAddCheckpoint() {
    const finishInputValue = this.handles.finishCheckpointInput.value.trim();
    if (finishInputValue) {
      const newCheckpoint = {
        position: this.checkpoints.length + 1,
        name: finishInputValue,
      };
      this.checkpoints.push(newCheckpoint);
      this.handles.finishCheckpointInput.value = '';
      this.renderCheckpoints();
    }
  }

  handleDeleteCheckpoint(event) {
    const button = event.target;
    const positionToDelete = parseInt(button.dataset.position, 10);

    this.checkpoints = this.checkpoints
      .filter(checkpoint => checkpoint.position !== positionToDelete)
      .map((checkpoint, index) => ({ position: index + 1, name: checkpoint.name }));

    this.renderCheckpoints();
  }

  renderCheckpoints() {
    if (!this.handles.checkpointList) {
      return;
    }

    this.handles.checkpointList.innerHTML = '';

    const startCheckpointLi = document.createElement('li');
    const startInput = document.createElement('input');
    startInput.type = 'text';
    startInput.value = 'Start';
    startInput.setAttribute('data-type', 'checkpoint');
    startCheckpointLi.append(startInput);
    this.handles.checkpointList.append(startCheckpointLi);


    for (const checkpoint of this.checkpoints) {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = checkpoint.name;
      input.setAttribute('data-type', 'checkpoint');
      input.setAttribute('data-position', checkpoint.position);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('data-position', checkpoint.position);
      deleteButton.addEventListener('click', this.handleDeleteCheckpoint);

      li.append(input);
      li.append(deleteButton);
      this.handles.checkpointList.append(li);
    }
  }


  async handleSubmit() {
    this.saveStepData();

    try {
      const response = await fetch('/api/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formData),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const raceId = await response.text();

      this.resetForm();
      window.location.href = `/app/organise/race?id=${raceId}`;
    } catch (error) {
      // handle error
    }
  }

  render() {
    const clone = templates.createRaceForm.content.cloneNode(true);
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(clone);

    this.getHandles();

    this.handles.stepSections.forEach((section, index) => {
      section.style.display = this.currentStep === index + 1 ? 'flex' : 'none';
    });

    this.handles.nextButton.addEventListener('click', this.handleNext);
    this.handles.prevButton.addEventListener('click', this.handlePrev);
    this.handles.submitButton.addEventListener('click', this.handleSubmit);

    if (this.handles.addCheckpointButton) {
      this.handles.addCheckpointButton.addEventListener('click', this.handleAddCheckpoint);
    }

    this.loadStepData();
    this.updateButtonVisibility();
  }
}

customElements.define('create-race-form', CreateRaceForm);
