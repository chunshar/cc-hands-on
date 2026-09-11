'use strict';

/**
 * 新しいタスクオブジェクトを作成する
 * @param {number} id
 * @param {string} title
 * @param {'high'|'medium'|'low'} priority
 */
function createTask(id, title, priority = 'medium') {
  if (!title || title.trim() === '') {
    throw new Error('タイトルは必須です');
  }
  return {
    id,
    title: title.trim(),
    priority,
    completed: false,
  };
}

/**
 * タスク一覧に新しいタスクを追加した新しい配列を返す
 * @param {Array} tasks
 * @param {string} title
 * @param {'high'|'medium'|'low'} priority
 */
function addTask(tasks, title, priority = 'medium') {
  const id = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const newTask = createTask(id, title, priority);
  return [...tasks, newTask];
}

/**
 * 指定したIDのタスクを完了状態にした新しい配列を返す
 * @param {Array} tasks
 * @param {number} id
 */
function completeTask(tasks, id) {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: true } : task
  );
}

/**
 * 指定したIDのタスクを除いた新しい配列を返す
 * @param {Array} tasks
 * @param {number} id
 */
function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

/**
 * 完了済みのタスク一覧を返す
 * @param {Array} tasks
 */
function getCompletedTasks(tasks) {
  return tasks.filter((task) => task.completed);
}

/**
 * 完了率をパーセント（0〜100の整数）で返す
 * タスクが0件の場合は 0 を返す
 * @param {Array} tasks
 */
function calculateProgress(tasks) {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * タスクを優先度順（high → medium → low）に並べた新しい配列を返す
 * @param {Array} tasks
 */
function sortByPriority(tasks) {
  const order = { high: 1, medium: 2, low: 3 };
  return [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
}

module.exports = {
  createTask,
  addTask,
  completeTask,
  deleteTask,
  getCompletedTasks,
  calculateProgress,
  sortByPriority,
};
