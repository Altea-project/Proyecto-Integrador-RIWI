import {
  ProjectDetailView,
  mountProjectDetailView,
} from "./ProjectDetailView.js";
import {
  MyProjectDetailView,
  mountMyProjectDetailView,
} from "./MyProjectDetailView.js";
import { getUser } from "../state/store.js";
import { ROLES } from "../utils/constants.js";

export function ProjectDetailRouterView(params) {
  const user = getUser();
  return user?.roleName === ROLES.INSTRUCTOR
    ? ProjectDetailView(params)
    : MyProjectDetailView(params);
}

export function mountProjectDetailRouterView(params) {
  const user = getUser();
  return user?.roleName === ROLES.INSTRUCTOR
    ? mountProjectDetailView(params)
    : mountMyProjectDetailView(params);
}
