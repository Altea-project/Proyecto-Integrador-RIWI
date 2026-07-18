let currentUser = null;

export function setUser(user) {
  currentUser = user;
}

export function getUser() {
  return currentUser;
}

export function clearUser() {
  currentUser = null;
}

export function isAuthenticated() {
  return currentUser !== null;
}
