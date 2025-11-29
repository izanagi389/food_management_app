// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,

  nitro: {
    preset: 'static'
  },

  css: [
    // Ionic Core CSS
    '@ionic/vue/css/core.css',
    '@ionic/vue/css/normalize.css',
    '@ionic/vue/css/structure.css',
    '@ionic/vue/css/typography.css',
    '@ionic/vue/css/padding.css',
    '@ionic/vue/css/float-elements.css',
    '@ionic/vue/css/text-alignment.css',
    '@ionic/vue/css/text-transformation.css',
    '@ionic/vue/css/flex-utils.css',
    '@ionic/vue/css/display.css',
    '@ionic/vue/css/palettes/dark.system.css',
    // Custom CSS
    '~/assets/css/ionic-variables.css',
    '~/assets/css/custom-ionic.css',
    '~/assets/css/components.css',
    '~/assets/css/pages.css'
  ],

  app: {
    head: {
      title: 'Food Management App',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no',
      meta: [
        { name: 'description', content: 'Food and health management application' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'msapplication-tap-highlight', content: 'no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'theme-color', content: '#3880ff' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  modules: [],

  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['@ionic/vue', '@ionic/vue-router']
    },
    server: {
      watch: {
        ignored: [
          '**/ios/**',
          '**/android/**',
          '**/Pods/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/.output/**',
          '**/public/assets/sql-wasm.wasm'
        ],
        usePolling: false
      }
    }
  }
})