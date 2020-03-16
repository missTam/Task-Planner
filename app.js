// find web elements
const form = document.querySelector('#task-form');
const taskInput = document.querySelector('#task');
const filter = document.querySelector('#filter');
const taskList = document.querySelector('#taskList');
const clearBtn = document.querySelector('.clear-tasks');
const completedTasks = document.querySelector('#completedTasks');
const initText = document.querySelector('#initText');
let clearCompletedBtn = clearBtn.cloneNode(true);
let intervalContainer;
let timer;
let timerCounter = 0;

// load all event listeners
loadEventListeners();

// define event listeners that get loaded
function loadEventListeners() {
  document.addEventListener('DOMContentLoaded', getTasks);
  form.addEventListener('submit', addTask);
  taskList.addEventListener('click', deleteItem);
  taskList.addEventListener('click', completeTask);
  taskList.addEventListener('click', runTimer);
  clearBtn.addEventListener('click', clearTasks);
  filter.addEventListener('keyup', filterTasks);
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);
}

function getTasks() {
  let completed = checkLocalStorage('completed');
  let tasks = checkLocalStorage('tasks');
  tasks.forEach(function(task) {
    createTask(task);
  })
  completed.forEach(function(task) {
    createCompletedTask(task);
  })
  adjustParagraph(); 
}

function addTask(e) {
  if(taskInput.value === '') {
    alert('please add a task');
  } else {
    taskInput.value = truncateStr(taskInput.value);
    createTask(taskInput.value);
    addToLocalStorage(taskInput.value, false);
    taskInput.value = '';
  }
  e.preventDefault();
}

function createLink(nameClass, icon, li, txt) {
  const link = document.createElement('a');
  link.className = `${nameClass} secondary-content`;
  link.innerHTML = `<i class="fa fa-${icon}" id="${icon}">${txt}</i>`;
  addSpace(link);
  li.appendChild(link);
}

function runTimer(e) {
  if(e.target.parentElement.classList.contains('start-item') && e.target.tagName === 'I') {
    timerCounter++;
    if(timerCounter > 1) {
      clearInterval(intervalContainer);
    }
    taskTimes[`time${timerCounter}`] = 0;
    taskTimes[`time${timerCounter}`] = taskTimes.time1;
    timer = document.createElement('div');
    timer.setAttribute('id', `timer${timerCounter}`);
    e.target.parentElement.appendChild(timer);
    e.target.remove();
    intervalContainer = setInterval(displayTime, 1000);
  }
}

let taskTimes = {};

function displayTime() {
  taskTimes['time1']++;
  console.log(taskTimes['time1']);
  for(i = 1; i <= timerCounter; i++) {
    if(document.querySelector(`#timer${i}`) === null) {
      continue;
    }
    console.log("this is i: " + i);
    let currentTaskTime = taskTimes['time1'];
    if(i !== 1) {
      currentTaskTime = taskTimes['time1'] - taskTimes[`time${i}`];
    }
    let hrs = Math.floor(currentTaskTime/3600);
    let min = Math.floor(currentTaskTime/60);
    let sec = currentTaskTime;
    sec = adjustOutput(sec);
    min = adjustOutput(min);
    hrs = adjustOutput(hrs);
    if (sec >= 60) {
      sec = sec % 60;
      if (sec % 60 < 10) {
        sec = "0" + sec;
      }
    }
    if (min >= 60) {
      min = min % 60;
    }
    if (hrs >= 24) {
      // placeholder for error handling
    }
    console.log(hrs);
    console.log(min);
    console.log(sec);
    document.querySelector(`#timer${i}`).innerHTML = hrs + ":" + min + ":" + sec;
  }
}

function adjustOutput(timeUnit) {
  if (timeUnit < 10) {
    timeUnit = "0" + timeUnit;
  }
  return timeUnit;
}

function deleteItem(e) {
  if(e.target.parentElement.classList.contains('delete-item')) {
    let li = e.target.parentElement.parentElement;
    if(checkIfItemHasTimer(li)) {
      removeFromLocalStorage(li.textContent.slice(0, -8));
    } else {
      removeFromLocalStorage(li.textContent);
    }
    li.remove();
    checkAndClearInterval();
  }
}

function clearTasks(e) {
  taskList.innerHTML = '';
  localStorage.removeItem('tasks');
  e.preventDefault();
}

function clearCompletedTasks(e) {
  completedTasks.innerHTML = '';
  localStorage.removeItem('completed');
  e.preventDefault();
  initText.textContent = "You've cleared all your completed tasks.";
}

function filterTasks(e) {
  const text = e.target.value.toLowerCase();
  taskList.querySelectorAll('li').forEach
  (function(task) {
    const item = task.textContent;
    if(item.toLowerCase().includes(text)) {
      task.style.display = 'block';
    } else {
      task.style.display = 'none';
    }
  });
}

function createTask(taskContent) {
  const li = document.createElement('li');
  li.className = 'collection-item';
  li.textContent = taskContent;
  // create a delete link
  createLink('delete-item', 'remove', li, "");
  // create a completed link
  createLink('done-item', 'check', li, "");
  // create a start record link
  createLink('start-item', 'clock-o', li, "");
  // append task li to ul
  taskList.appendChild(li);
}

function createCompletedTask(taskContent) {
  const li = document.createElement('li');
  li.className = 'collection-item';
  li.textContent = taskContent;
  completedTasks.appendChild(li);
}

function completeTask(e) {
  if(e.target.parentElement.classList.contains('done-item')) {
    const li = e.target.parentElement.parentElement;
    let liText = li.textContent;
    if(checkIfItemHasTimer(li)) {
      const substring = liText.substring(liText.length - 8);
      liText = liText.slice(0, -8);
      removeFromLocalStorage(liText);
      liText += '. completed in: ' + substring;
    } else {
      removeFromLocalStorage(li.textContent);  
    }
    // add to completed tasks
    createCompletedTask(liText);
    // add to local storage completed
    addToLocalStorage(liText, true);
    // remove from task list
    e.target.parentElement.parentElement.remove();
    // if there are no ongoing time measurements, stop the timer
    checkAndClearInterval();
    adjustParagraph(); 
  }
}

function addToLocalStorage(task, completed) {
  switch(completed) {
    case false:
      let tasks = checkLocalStorage('tasks');
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      break;
    case true:
      let completed = checkLocalStorage('completed');
      completed.push(task);
      localStorage.setItem('completed', JSON.stringify(completed));
      break;
  }  
}

function removeFromLocalStorage(itemTxt) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const filteredTasks = tasks.filter(task => task != itemTxt);
  localStorage.setItem('tasks', JSON.stringify(filteredTasks));
}

function adjustParagraph() {
  if(completedTasks.hasChildNodes()) {
    initText.textContent = "Way to go. Keep it coming!";
    clearCompletedBtn.className = 'clear-completed-tasks btn';
    completedTasks.parentNode.insertBefore(clearCompletedBtn, completedTasks.nextSibling);
  }
}

function checkLocalStorage(arrayName) {
  let tasks;
  if(localStorage.getItem(arrayName) === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem(arrayName));
  }
  return tasks;
}

function addSpace(link) {
  const space = document.createElement('div');
  space.className = 'col s2';
  link.appendChild(space);
}

function checkIfItemHasTimer(li) {
  return (Array.from(li.querySelector('.start-item').children).filter(el => el.id.includes('timer')).length === 1);  
}

function checkAndClearInterval() {
  if(document.querySelectorAll(`[id^="timer"]`).length === 0) {
    clearInterval(intervalContainer);
  }
}

function truncateStr(str) {
  if (str.length > 50) {
    return str.substring(0, 50 - 3) + '...';
  } else {
    return str;
  }
}
