const createTask = document.querySelector('.create-task')
const taskCreator = document .querySelector('.crt')
const cross = document.querySelector('.fa-times-circle')
createTask.addEventListener('click', () => {
    createTask.classList.add('hidden')
    taskCreator.classList.add('visible-grid')
    taskCreator.style.transition = "all 2s"
    cross.classList.add('visible')
})
cross.addEventListener('click', () => {
    cross.classList.remove('visible')
    taskCreator.classList.remove('visible-grid')
    createTask.classList.remove('hidden')
})