import SiteMenuView from './view/site-menu-view.js';
import TasksModel from './model/tasks-model.js';
import { generateTask } from './mock/task.js';
import { render, RenderPosition } from './utils/render.js';

const TASK_COUNT = 22;

const tasks = Array.from({ length: TASK_COUNT }, generateTask);

const tasksModel = new TasksModel();
tasksModel.tasks = tasks;

const siteMainElement = document.querySelector('.main');
const siteHeaderElement = siteMainElement.querySelector('.main__control');
const siteMenuComponent = new SiteMenuView();

render(siteHeaderElement, siteMenuComponent, RenderPosition.BEFOREEND);
