import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import type { Note } from '@/features/notes/types'
import { formatDate } from '@/shared/format'

import NoteCard from './NoteCard.vue'

vi.mock('vuetify/components', () => ({
  VCard: {
    template: '<article><slot /></article>'
  },
  VCardItem: {
    template: '<header><slot name="append" /><slot /></header>'
  },
  VCardText: {
    template: '<p><slot /></p>'
  },
  VCardTitle: {
    template: '<h2><slot /></h2>'
  },
  VIcon: {
    template: '<span />'
  },
  VList: {
    template: '<div><slot /></div>'
  },
  VListItem: {
    emits: ['click'],
    template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>'
  },
  VListItemTitle: {
    template: '<span><slot /></span>'
  },
  VMenu: {
    template: [
      '<div>',
      '<slot name="activator" :props="{}" />',
      '<slot />',
      '</div>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VCard', () => ({
  VCard: {
    template: '<article><slot /></article>'
  },
  VCardItem: {
    template: '<header><slot name="append" /><slot /></header>'
  },
  VCardText: {
    template: '<p><slot /></p>'
  },
  VCardTitle: {
    template: '<h2><slot /></h2>'
  }
}))

vi.mock('vuetify/components/VCardItem', () => ({
  VCardItem: {
    template: '<header><slot name="append" /><slot /></header>'
  }
}))

vi.mock('vuetify/components/VCardText', () => ({
  VCardText: {
    template: '<p><slot /></p>'
  }
}))

vi.mock('vuetify/components/VCardTitle', () => ({
  VCardTitle: {
    template: '<h2><slot /></h2>'
  }
}))

vi.mock('vuetify/components/VIcon', () => ({
  VIcon: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VList', () => ({
  VList: {
    template: '<div><slot /></div>'
  },
  VListItem: {
    emits: ['click'],
    template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>'
  },
  VListItemTitle: {
    template: '<span><slot /></span>'
  }
}))

vi.mock('vuetify/components/VListItem', () => ({
  VListItem: {
    emits: ['click'],
    template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>'
  }
}))

vi.mock('vuetify/components/VListItemTitle', () => ({
  VListItemTitle: {
    template: '<span><slot /></span>'
  }
}))

vi.mock('vuetify/components/VMenu', () => ({
  VMenu: {
    template: [
      '<div>',
      '<slot name="activator" :props="{}" />',
      '<slot />',
      '</div>'
    ].join('')
  }
}))

const note: Note = {
  content: '  First line\n\nSecond   line  ',
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 1,
  title: 'Release notes',
  updated_at: '2026-04-28T09:15:00Z'
}

function mountNoteCard (nextNote: Note = note) {
  return mount(NoteCard, {
    props: {
      note: nextNote
    }
  })
}

function createLongContent () {
  return `${'Long content '.repeat(24)}, trailing punctuation!!!`
}

describe('NoteCard', () => {
  describe('when note has content', () => {
    test('should show title, formatted date, and normalized preview', () => {
      const wrapper = mountNoteCard()

      expect(wrapper.text()).toContain('Release notes')
      expect(wrapper.text()).toContain(formatDate(note.updated_at))
      expect(wrapper.text()).toContain('First line Second line')
    })
  })

  describe('when note content is empty', () => {
    test('should hide preview content', () => {
      const wrapper = mountNoteCard({
        ...note,
        content: '   '
      })

      expect(wrapper.find('.note-card__content-copy').exists()).toBe(false)
      expect(wrapper.find('.note-card__content-gap').exists()).toBe(true)
    })
  })

  describe('when note content is long', () => {
    test('should truncate preview without trailing punctuation', () => {
      const wrapper = mountNoteCard({
        ...note,
        content: createLongContent()
      })
      const preview = wrapper.get('.note-card__content-copy').text()

      expect(preview).toHaveLength(223)
      expect(preview.endsWith('...')).toBe(true)
      expect(preview.at(-4)).not.toMatch(/[.,;:!?-]/)
    })
  })

  describe('when menu actions are clicked', () => {
    test('should emit selected action with note', async () => {
      const wrapper = mountNoteCard()
      const actions = wrapper.findAll('.note-card__menu-item')

      await actions[0]?.trigger('click')
      await actions[1]?.trigger('click')
      await actions[2]?.trigger('click')

      expect(wrapper.emitted('edit')?.[0]).toEqual([note])
      expect(wrapper.emitted('duplicate')?.[0]).toEqual([note])
      expect(wrapper.emitted('delete')?.[0]).toEqual([note])
    })
  })
})
