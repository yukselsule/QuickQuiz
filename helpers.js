export const shuffleArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export function setLocalStorage(name, item) {
  localStorage.setItem(name, JSON.stringify(item));
}

export function resetLocalStorage(name) {
  localStorage.removeItem(name);
}

export function getLocalStorage(name) {
  return localStorage.getItem(name);
}
