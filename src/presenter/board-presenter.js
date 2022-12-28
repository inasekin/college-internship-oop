import BoardView from '../view/board-view.js';
import TaskListView from '../view/task-list-view.js';
import NoTaskView from '../view/no-task-view.js';
import LoadMoreButtonView from '../view/load-more-button-view.js';
import TaskPresenter from './task-presenter.js';
import TaskNewPresenter from './task-new-presenter.js';
import { render, RenderPosition, remove } from '../utils/render.js';
import { UpdateType, UserAction } from '../utils/constants.js';

const TASK_COUNT_PER_STEP = 12;

export default class BoardPresenter {
  #boardContainer = null;
  #tasksModel = null;

  #boardComponent = new BoardView();
  #taskListComponent = new TaskListView();
  #noTaskComponent = null;
  #sortComponent = null;
  #loadMoreButtonComponent = null;

  #renderedTaskCount = TASK_COUNT_PER_STEP;
  #taskPresenter = new Map();
  #taskNewPresenter = null;

  constructor(boardContainer, tasksModel) {
    this.#boardContainer = boardContainer;
    this.#tasksModel = tasksModel;

    this.#taskNewPresenter = new TaskNewPresenter(
      this.#taskListComponent,
      this.#handleViewAction
    );

    this.#tasksModel.addObserver(this.#handleModelEvent);
  }

  get tasks() {
    return this.#tasksModel.tasks;
  }

  init = () => {
    render(
      this.#boardContainer,
      this.#boardComponent,
      RenderPosition.BEFOREEND
    );
    render(
      this.#boardComponent,
      this.#taskListComponent,
      RenderPosition.BEFOREEND
    );

    this.#renderBoard();
  };

  createTask = (callback) => {
    this.#taskNewPresenter.init(callback);
  };

  #handleModeChange = () => {
    this.#taskNewPresenter.destroy();
    this.#taskPresenter.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_TASK:
        this.#tasksModel.updateTask(updateType, update);
        break;
      case UserAction.ADD_TASK:
        this.#tasksModel.addTask(updateType, update);
        break;
      case UserAction.DELETE_TASK:
        this.#tasksModel.deleteTask(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#taskPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetRenderedTaskCount: true, resetSortType: true });
        this.#renderBoard();
        break;
    }
  };

  #renderTask = (task) => {
    const taskPresenter = new TaskPresenter(
      this.#taskListComponent,
      this.#handleViewAction,
      this.#handleModeChange
    );
    taskPresenter.init(task);
    this.#taskPresenter.set(task.id, taskPresenter);
  };

  #renderTasks = (tasks) => {
    tasks.forEach((task) => this.#renderTask(task));
  };

  #renderNoTasks = () => {
    this.#noTaskComponent = new NoTaskView();
    render(
      this.#boardComponent,
      this.#noTaskComponent,
      RenderPosition.AFTERBEGIN
    );
  };

  #handleLoadMoreButtonClick = () => {
    const taskCount = this.tasks.length;
    const newRenderedTaskCount = Math.min(
      taskCount,
      this.#renderedTaskCount + TASK_COUNT_PER_STEP
    );
    const tasks = this.tasks.slice(
      this.#renderedTaskCount,
      newRenderedTaskCount
    );

    this.#renderTasks(tasks);
    this.#renderedTaskCount = newRenderedTaskCount;

    if (this.#renderedTaskCount >= taskCount) {
      remove(this.#loadMoreButtonComponent);
    }
  };

  #renderLoadMoreButton = () => {
    this.#loadMoreButtonComponent = new LoadMoreButtonView();
    this.#loadMoreButtonComponent.setClickHandler(
      this.#handleLoadMoreButtonClick
    );

    render(
      this.#boardComponent,
      this.#loadMoreButtonComponent,
      RenderPosition.BEFOREEND
    );
  };

  #clearBoard = ({
    resetRenderedTaskCount = false,
    resetSortType = false,
  } = {}) => {
    const taskCount = this.tasks.length;

    this.#taskNewPresenter.destroy();
    this.#taskPresenter.forEach((presenter) => presenter.destroy());
    this.#taskPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#loadMoreButtonComponent);

    if (this.#noTaskComponent) {
      remove(this.#noTaskComponent);
    }

    if (resetRenderedTaskCount) {
      this.#renderedTaskCount = TASK_COUNT_PER_STEP;
    } else {
      this.#renderedTaskCount = Math.min(taskCount, this.#renderedTaskCount);
    }
  };

  #renderBoard = () => {
    const tasks = this.tasks;
    const taskCount = tasks.length;

    if (taskCount === 0) {
      this.#renderNoTasks();
      return;
    }

    this.#renderTasks(
      tasks.slice(0, Math.min(taskCount, this.#renderedTaskCount))
    );

    if (taskCount > this.#renderedTaskCount) {
      this.#renderLoadMoreButton();
    }
  };
}
