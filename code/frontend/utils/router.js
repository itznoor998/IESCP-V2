import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Register from "../pages/Register.js";

import InfDash from "../pages/InfDash.js";
import InfProfile from "../pages/InfProfile.js";
import InfSearch from "../pages/InfSearch.js";

import SponCamp from "../pages/SponCamp.js";
import SponDash from "../pages/SponDash.js";
import SponProfile from "../pages/SponProfile.js";
import SponAds from "../pages/SponAds.js";

import AdminDash from "../pages/AdminDash.js";
import AdminCamp from "../pages/AdminCamp.js";
import SponSearch from "../pages/SponSearch.js";
import AdminCategory from "../pages/AdminCategory.js";
import AdminSummary from "../pages/AdminSummary.js";


import store from "./store.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  {
    path: "/influencer/dashboard",
    component: InfDash,
    meta: { requiresLogin: true, role: "influencer" },
  },
  {
    path: "/influencer/profile",
    component: InfProfile,
    meta: { requiresLogin: true, role: "influencer" },
  },
  {
    path: "/influencer/search",
    component: InfSearch,
    meta: { requiresLogin: true, role: "influencer" },
  },
  {
    path: "/sponsor/campaign",
    component: SponCamp,
    meta: { requiresLogin: true, role: "sponsor" },
  },
  {
    path: "/sponsor/dashboard",
    component: SponDash,
    meta: { requiresLogin: true, role: "sponsor" },
  },
  {
    path: "/sponsor/profile",
    component: SponProfile,
    meta: { requiresLogin: true, role: "sponsor" },
  },
  {
    path: "/sponsor/ads",
    component: SponAds,
    meta: { requiresLogin: true, role: "sponsor" },
  },
  {
    path: '/sponsor/search',
    component: SponSearch,
    meta: { requiresLogin: true, role: "sponsor" }
  },
  {
    path: '/admin/dashboard',
    component: AdminDash,
    meta: { requiresLogin: true, role: "admin" }
  },
  {
    path: '/admin/campaigns',
    component: AdminCamp,
    meta: { requiresLogin: true, role: "admin" }
  },
  {
    path: '/admin/categories',
    component: AdminCategory,
    meta: { requiresLogin: true, role: "admin" }
  },
  {
    path: '/admin/summary',
    component: AdminSummary,
    meta: { requiresLogin: true, role: "admin" }
  },
  { path: "*", redirect: "/" },
];

const router = new VueRouter({
  routes,
});

// navigation guards
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!store.state.loggedIn) {
      next({ path: "/login" });
    } else if (to.meta.role && to.meta.role != store.state.role) {
      alert("role not authorized");
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
