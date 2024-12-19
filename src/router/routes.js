import PersonalRecord from "../PersonalRecord/PersonalRecord.vue";

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
  },
  { path: '', component: () => import('pages/IndexPage.vue') },
  {
    path: "/released/:id",
    name: "PersonalRecorded",
    component: PersonalRecord,
    meta: { title: "Filtering Summary" },
  },
  {
    path: "/release/:id",
    name: "PersonalRecord",
    component: PersonalRecord,
    meta: { title: "Filtering Summary" },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
