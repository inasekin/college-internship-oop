import SiteMenuView from './view/site-menu-view.js';
import TasksModel from './model/tasks-model.js';
import { generateTask } from './mock/task.js';
import { render, RenderPosition } from './utils/render.js';
import BoardPresenter from './presenter/board-presenter.js';
import { MenuItem } from './utils/constants.js';

const TASK_COUNT = 22;

const tasks = Array.from({ length: TASK_COUNT }, generateTask);

const tasksModel = new TasksModel();
tasksModel.tasks = tasks;

const siteMainElement = document.querySelector('.main');
const siteHeaderElement = siteMainElement.querySelector('.main__control');
const siteMenuComponent = new SiteMenuView();

render(siteHeaderElement, siteMenuComponent, RenderPosition.BEFOREEND);

const boardPresenter = new BoardPresenter(siteMainElement, tasksModel);

const handleTaskNewFormClose = () => {
  siteMenuComponent.setMenuItem(MenuItem.TASKS);
};

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.ADD_NEW_TASK:
      boardPresenter.createTask(handleTaskNewFormClose);
      break;
  }
};

siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);

boardPresenter.init();
