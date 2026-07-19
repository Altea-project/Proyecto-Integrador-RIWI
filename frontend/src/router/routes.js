import { LandingView } from "../views/LandingView.js";
import { LoginView, mountLoginView } from "../views/LoginView.js";
import {
  ChangePasswordView,
  mountChangePasswordView,
} from "../views/ChangePasswordView.js";
import { NotFoundView } from "../views/NotFoundView.js";
import { AdminView, mountAdminView } from "../views/AdminView.js";
import {
  CoderDashboard,
  mountCoderDashboard,
} from "../views/CoderDashboard.js";
import {
  ProjectDetailRouterView,
  mountProjectDetailRouterView,
} from "../views/ProjectDetailRouterView.js";
import { TLDashboard, mountTLDashboard } from "../views/TLDashboard.js";
import {
  PublicProfileView,
  mountPublicProfileView,
} from "../views/PublicProfileView.js";

// import { RecruiterView, mountRecruiterView } from "../views/RecruiterView.js";
// import { GalleryView, mountGalleryView } from "../views/GalleryView.js";

export const routes = [
  { path: "/", view: LandingView },
  { path: "/login", view: LoginView, mount: mountLoginView },
  {
    path: "/change-password",
    view: ChangePasswordView,
    mount: mountChangePasswordView,
  },
  { path: "/admin", view: AdminView, mount: mountAdminView, roles: ["admin"] },
  {
    path: "/dashboard",
    view: CoderDashboard,
    mount: mountCoderDashboard,
    roles: ["coder"],
  },
  {
    path: "/tl",
    view: TLDashboard,
    mount: mountTLDashboard,
    roles: ["instructor"],
  },
  {
    path: "/project/:id",
    view: ProjectDetailRouterView,
    mount: mountProjectDetailRouterView,
    roles: ["instructor", "coder"],
  },
  {
    path: "/profile/:id",
    view: PublicProfileView,
    mount: mountPublicProfileView,
    roles: ["instructor", "coder"],
  },
  // {
  //   path: "/recruiter",
  //   view: RecruiterView,
  //   mount: mountRecruiterView,
  //   roles: ["recruiter"],
  // },
  // { path: "/gallery", view: GalleryView, mount: mountGalleryView },

  { path: "*", view: NotFoundView, roles: null },
];
