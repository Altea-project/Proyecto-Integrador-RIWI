import { LandingView } from "../views/LandingView.js";
import { LoginView } from "../views/LoginView.js";
import { NotFoundView } from "../views/NotFoundView.js";

// import { AdminView, mountAdminView } from "../views/AdminView.js";
// import { CoderDashboard, mountCoderDashboard } from "../views/CoderDashboard.js";
// import { TLDashboard, mountTLDashboard } from "../views/TLDashboard.js";
// import { RecruiterView, mountRecruiterView } from "../views/RecruiterView.js";
// import { ProjectDetailView, mountProjectDetailView } from "../views/ProjectDetailView.js";
// import { PublicProfileView, mountPublicProfileView } from "../views/PublicProfileView.js";
// import { GalleryView, mountGalleryView } from "../views/GalleryView.js";

// Tabla de rutas de la aplicación: ruta, vista y función de montaje
export const routes = [
  { path: "/", view: LandingView, mount: "", roles: null },
  { path: "/login", view: LoginView, mount: "", roles: null },
  { path: "*", view: NotFoundView, mount: "", roles: null },

  // { path: "/admin", view: AdminView, mount: mountAdminView, roles: ["admin"] },
  // {
  //   path: "/coder",
  //   view: CoderDashboard,
  //   mount: mountCoderDashboard,
  //   roles: ["coder"],
  // },
  // {
  //   path: "/tl",
  //   view: TLDashboard,
  //   mount: mountTLDashboard,
  //   roles: ["instructor"],
  // },
  // {
  //   path: "/recruiter",
  //   view: RecruiterView,
  //   mount: mountRecruiterView,
  //   roles: ["recruiter"],
  // },
  // { path: "/project/:id", view: ProjectDetailView, mount: mountProjectDetailView },
  // { path: "/profile/:username", view: PublicProfileView, mount: mountPublicProfileView },
  // { path: "/gallery", view: GalleryView, mount: mountGalleryView },
];
