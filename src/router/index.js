import { createRouter, createWebHashHistory } from 'vue-router'
import EnvelopePage from '../views/EnvelopePage.vue'
import EditPage from '../views/EditPage.vue'

const routes = [
  { path: '/:code', component: EnvelopePage },
  { path: '/:code/edit', component: EditPage }
]

export default createRouter({
  history: createWebHashHistory('/keyfinity/'),
  routes
})