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
  mountPublicProfileView,
  PublicProfileView,
} from "../views/PublicProfileView.js";
import { TLDashboard, mountTLDashboard } from "../views/TLDashboard.js";
// import { RecruiterView, mountRecruiterView } from "../views/RecruiterView.js";
import {
  ProjectDetailView,
  mountProjectDetailView,
} from "../views/ProjectDetailView.js";
// import { PublicProfileView, mountPublicProfileView } from "../views/PublicProfileView.js";
// import { GalleryView, mountGalleryView } from "../views/GalleryView.js";

// Tabla de rutas de la aplicación: ruta, vista y función de montaje
export const routes = [
  { path: "/", view: LandingView },
  { path: "/login", view: LoginView, mount: mountLoginView },
  {
    path: "/change-password",
    view: ChangePasswordView,
    mount: mountChangePasswordView,
  },
  { path: "*", view: NotFoundView, mount: "", roles: null },
  { path: "/admin", view: AdminView, mount: mountAdminView, roles: ["admin"] },
  {
    path: "/dashboard",
    view: CoderDashboard,
    mount: mountCoderDashboard,
    roles: ["coder"],
  },
  {
    path: "/profile/:id",
    view: PublicProfileView,
    mount: mountPublicProfileView,
    roles: null,
  },

  {
    path: "/tl",
    view: TLDashboard,
    mount: mountTLDashboard,
    roles: ["instructor"],
  },
  {
    path: "/project/:id",
    view: ProjectDetailView,
    mount: mountProjectDetailView,
    roles: ["instructor"],
  },
  // {
  //   path: "/recruiter",
  //   view: RecruiterView,
  //   mount: mountRecruiterView,
  //   roles: ["recruiter"],
  // },

  // { path: "/gallery", view: GalleryView, mount: mountGalleryView },
];
