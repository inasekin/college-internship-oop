import he from 'he';
import AbstractView from './abstract-view.js';
import { isTaskExpired, formatTaskDueDate } from '../utils/common.js';

const createTaskTemplate = (task) => {
  const { color, description, dueDate } = task;

  const date = formatTaskDueDate(dueDate);

  const deadlineClassName = isTaskExpired(dueDate) ? 'card--deadline' : '';

  return `<article class="card card--${color} ${deadlineClassName}">
    <div class="card__form">
      <div class="card__inner">
        <div class="card__control">
          <button type="button" class="card__btn card__btn--edit">
            изменить
          </button>
        </div>

        <div class="card__color-bar">
          <svg class="card__color-bar-wave" width="100%" height="10">
            <use xlink:href="#wave"></use>
          </svg>
        </div>

        <div class="card__textarea-wrap">
          <p class="card__text">${he.encode(description)}</p>
        </div>

        <div class="card__settings">
          <div class="card__details">
            <div class="card__dates">
              <div class="card__date-deadline">
                <p class="card__input-deadline-wrap">
                  <span class="card__date">${date}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>`;
};

export default class TaskView extends AbstractView {
  #task = null;

  constructor(task) {
    super();
    this.#task = task;
  }

  get template() {
    return createTaskTemplate(this.#task);
  }

  setEditClickHandler = (callback) => {
    this._callback.editClick = callback;
    this.element
      .querySelector('.card__btn--edit')
      .addEventListener('click', this.#editClickHandler);
  };

  setFavoriteClickHandler = (callback) => {
    this._callback.favoriteClick = callback;
    this.element
      .querySelector('.card__btn--favorites')
      .addEventListener('click', this.#favoriteClickHandler);
  };

  setArchiveClickHandler = (callback) => {
    this._callback.archiveClick = callback;
    this.element
      .querySelector('.card__btn--archive')
      .addEventListener('click', this.#archiveClickHandler);
  };

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.editClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };

  #archiveClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.archiveClick();
  };
}
