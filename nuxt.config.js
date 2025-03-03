import colors from 'vuetify/es5/util/colors'

// only add `router.base = '/<repository-name>/'` if `DEPLOY_ENV` is `GH_PAGES`
const routerBase = process.env.DEPLOY_ENV === 'GH_PAGES' ? {
  router: {
    base: '/dev-notes/'
  }
} : {
  router: {
    base: '/'
  }
}
routerBase.router.middleware = ['encryption', 'dropbox']

export default {
  ...routerBase,

  mode: 'spa',

  generate: {
    dir: 'docs'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: `${routerBase.router.base}favicon.ico` }
    ]
  },

  env: {
    appName: process.env.npm_package_name,
    routerBase: routerBase.router.base,
    version: process.env.npm_package_version,
    builtDate: new Date(),
    revision: process.env.COMMIT_HASH || 'development',
    dropbox: {
      clientId: process.env.DROPBOX_CLIENT_ID || 'h89z3y690lntrca',
      redirectUrl: ( routerBase.router.base + '?recall=dropbox' )
    },
  },

  manifest: {
    "name": "DevNotes",
    "short_name": "DevNotes",
    "start_url": routerBase.router.base,
    "scope": routerBase.router.base + ".",
    "display": "standalone",
    "orientation": "portrait-primary",
    "background_color": "#FFE7A2",
    "theme_color": "#74B392",
    "dir": "ltr",
    "lang": "de-DE"
  },

  icon: {
    sizes: [16, 32, 120, 144, 152, 192, 384, 512]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/localStore',
    '~/plugins/i18n',
    '~/plugins/init',
    '~/plugins/style',
    '~/plugins/notification',
    '~/plugins/reminder',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
  ],
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
     /* theme: {
        dark: true,
        themes: {
          dark: {
            primary: '#16282C',
            accent: '#FF4081',
            secondary: '#FFE18D',
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FB8C00',
            error: '#FF5252'
          },
          light: {
            primary: '#1976D2',
            accent: '#e91e63',
            secondary: '#30b1dc',
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FB8C00',
            error: '#FF5252'
          }
        }
    }*/
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      //we need the compiler-included build for template-notes!
      config.resolve.alias['vue'] = 'vue/dist/vue.common'
    }
  }
}
