import 'vuetify/styles'

import {
  mdiAccountCircleOutline,
  mdiAccountOutline,
  mdiContentCopy,
  mdiDeleteOutline,
  mdiDotsVertical,
  mdiEmailOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiLockOutline,
  mdiLogout,
  mdiMagnify,
  mdiPencilOutline,
  mdiPlus,
  mdiSortAscending,
  mdiSortDescending
} from '@mdi/js'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const lightTheme = {
  dark: false,
  colors: {
    background: '#f6f6f3',
    surface: '#ffffff',
    'surface-variant': '#f0f0eb',
    primary: '#111111',
    'primary-darken-1': '#000000',
    secondary: '#3f3f46',
    error: '#b42318',
    success: '#067647',
    warning: '#b54708',
    info: '#111111',
    'on-background': '#111111',
    'on-surface': '#111111',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-error': '#ffffff'
  }
}

export function createVuetifyInstance () {
  return createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases: {
        ...aliases,
        accountCircleOutline: mdiAccountCircleOutline,
        accountOutline: mdiAccountOutline,
        contentCopy: mdiContentCopy,
        deleteOutline: mdiDeleteOutline,
        dotsVertical: mdiDotsVertical,
        emailOutline: mdiEmailOutline,
        eyeOffOutline: mdiEyeOffOutline,
        eyeOutline: mdiEyeOutline,
        lockOutline: mdiLockOutline,
        logout: mdiLogout,
        magnify: mdiMagnify,
        pencilOutline: mdiPencilOutline,
        plus: mdiPlus,
        sortAscending: mdiSortAscending,
        sortDescending: mdiSortDescending
      },
      sets: {
        mdi
      }
    },
    theme: {
      defaultTheme: 'lightTheme',
      themes: {
        lightTheme
      }
    },
    defaults: {
      global: {
        ripple: true
      },
      VBtn: {
        rounded: 'pill',
        minHeight: 48
      },
      VCard: {
        rounded: 'xl'
      },
      VTextField: {
        variant: 'solo',
        density: 'comfortable',
        hideDetails: 'auto'
      },
      VTextarea: {
        variant: 'solo',
        density: 'comfortable',
        hideDetails: 'auto'
      },
      VSelect: {
        variant: 'solo',
        density: 'comfortable',
        hideDetails: 'auto'
      },
      VDialog: {
        maxWidth: 720
      }
    },
    display: {
      mobileBreakpoint: 'sm'
    }
  })
}
