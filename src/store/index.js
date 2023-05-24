const { createPinia } = require('pinia')

const store = createPinia()

function setupStore(app) {
  app.use(store)
}

module.exports = {
  store,
  setupStore
}