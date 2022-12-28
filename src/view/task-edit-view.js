import he from 'he';
import SmartView from './smart-view.js';
import { COLORS } from '../utils/constants.js';
import { formatTaskDueDate } from '../utils/common.js';
import flatpickr from 'flatpickr';

import '../../node_modules/flatpickr/dist/flatpickr.min.css';

const BLANK_TASK = {
  color: COLORS[0],
  description: '',
  dueDate: null,
};

const createTaskEditDateTemplate = (dueDate, isDueDate) =>
  `<button class="card__date-deadline-toggle" type="button">
      дата: <span class="card__date-status">${isDueDate ? 'yes' : 'no'}</span>
    </button>

    ${
      isDueDate
        ? `<fieldset class="card__date-deadline">
      <label class="card__input-deadline-wrap">
        <input
          class="card__date"
          type="text"
          placeholder=""
          name="date"
          value="${formatTaskDueDate(dueDate)}"
        />
      </label>
    </fieldset>`
        : ''
    }
  `;

const createTaskEditColorsTemplate = (currentColor) =>
  COLORS.map(
    (color) => `<input
    type="radio"
    id="color-${color}"
    class="card__color-input card__color-input--${color} visually-hidden"
    name="color"
    value="${color}"
    ${currentColor === color ? 'checked' : ''}
  />
  <label
    for="color-${color}"
    class="card__color card__color--${color}"
    >${color}</label
  >`
  ).join('');

const createTaskEditTemplate = (data) => {
  const { color, description, dueDate, isDueDate } = data;

  const dateTemplate = createTaskEditDateTemplate(dueDate, isDueDate);

  const colorsTemplate = createTaskEditColorsTemplate(color);

  const isSubmitDisabled = isDueDate && dueDate === null;

  return `<article class="card card--edit card--${color}">
    <form class="card__form" method="get">
      <div class="card__inner">
        <div class="card__color-bar">
          <svg class="card__color-bar-wave" width="100%" height="10">
            <use xlink:href="#wave"></use>
          </svg>
        </div>

        <div class="card__textarea-wrap">
          <label>
            <textarea
              class="card__text"
              placeholder="Start typing your text here..."
              name="text"
            >${he.encode(description)}</textarea>
          </label>
        </div>

        <div class="card__settings">
          <div class="card__details">
            <div class="card__dates">
              ${dateTemplate}
            </div>
          </div>

          <div class="card__colors-inner">
            <h3 class="card__colors-title">Цвет</h3>
            <div class="card__colors-wrap">
              ${colorsTemplate}
            </div>
          </div>
        </div>

        <div class="card__status-btns">
          <button class="card__save" type="submit" ${
            isSubmitDisabled ? 'disabled' : ''
          }>сохранить</button>
          <button class="card__delete" type="button">удалить</button>
        </div>
      </div>
    </form>
  </article>`;
};

export default class TaskEditView extends SmartView {
  #datepicker = null;

  constructor(task = BLANK_TASK) {
    super();
    this._data = TaskEditView.parseTaskToData(task);

    this.#setInnerHandlers();
    this.#setDatepicker();
  }

  get template() {
    return createTaskEditTemplate(this._data);
  }

  removeElement = () => {
    super.removeElement();

    if (this.#datepicker) {
      this.#datepicker.destroy();
      this.#datepicker = null;
    }
  };

  reset = (task) => {
    this.updateData(TaskEditView.parseTaskToData(task));
  };

  restoreHandlers = () => {
    this.#setInnerHandlers();
    this.#setDatepicker();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setDeleteClickHandler(this._callback.deleteClick);
  };

  setFormSubmitHandler = (callback) => {
    this._callback.formSubmit = callback;
    this.element
      .querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
  };

  setDeleteClickHandler = (callback) => {
    this._callback.deleteClick = callback;
    this.element
      .querySelector('.card__delete')
      .addEventListener('click', this.#formDeleteClickHandler);
  };

  #setDatepicker = () => {
    if (this._data.isDueDate) {
      this.#datepicker = flatpickr(this.element.querySelector('.card__date'), {
        dateFormat: 'j F',
        defaultDate: this._data.dueDate,
        onChange: this.#dueDateChangeHandler, // На событие flatpickr передаём наш колбэк
      });
    }
  };

  #setInnerHandlers = () => {
    this.element
      .querySelector('.card__date-deadline-toggle')
      .addEventListener('click', this.#dueDateToggleHandler);
    this.element
      .querySelector('.card__text')
      .addEventListener('input', this.#descriptionInputHandler);

    this.element
      .querySelector('.card__colors-wrap')
      .addEventListener('change', this.#colorChangeHandler);
  };

  #dueDateToggleHandler = (evt) => {
    evt.preventDefault();
    this.updateData({
      isDueDate: !this._data.isDueDate,
    });
  };

  #descriptionInputHandler = (evt) => {
    evt.preventDefault();
    this.updateData(
      {
        description: evt.target.value,
      },
      true
    );
  };

  #dueDateChangeHandler = ([userDate]) => {
    this.updateData({
      dueDate: userDate,
    });
  };

  #colorChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateData({
      color: evt.target.value,
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit(TaskEditView.parseDataToTask(this._data));
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.deleteClick(TaskEditView.parseDataToTask(this._data));
  };

  static parseTaskToData = (task) => ({
    ...task,
    isDueDate: task.dueDate !== null,
  });

  static parseDataToTask = (data) => {
    const task = { ...data };

    if (!task.isDueDate) {
      task.dueDate = null;
    }

    delete task.isDueDate;

    return task;
  };
}
