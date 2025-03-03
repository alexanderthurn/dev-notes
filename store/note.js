import Vue from 'vue'

export const state = () => ({
  notes: [],
  deletedNotes: [],
  noteOrder: [],
  overdueAlarm: []
})

export const mutations = {
  loadNotes(state, {notes, order, deleted}) {
    //transfer date-strings to date
    for(let note of notes) {
      if(note && note.content && note.content.date) {
        note.content.date = new Date(note.content.date)
      }
    }
    for(let note of deleted) {
      if(note && note.content && note.content.date) {
        note.content.date = new Date(note.content.date)
      }
    }

    state.notes.push(...notes)
    state.deletedNotes.push(...deleted)
    state.noteOrder.push(...order)
  },
  setNoteOrder(state, order) {
    if(state.notes.length !== order.length) {
      console.log("Try to set invalid note order!")
      return false
    }

    state.noteOrder = order
    this.$localStore.setNoteOrder(state.noteOrder)
  },
  addNote(state, note) {
    if(!note || !note.id || !note.type || !note.title || !note.content) {
      console.log("Try to add invalid note: " + JSON.stringify(note))
      return false
    }

    state.notes.push(note)
    state.noteOrder.push(note.id)
    this.$localStore.setNote(note)
    this.$localStore.setNoteOrder(state.noteOrder)
  },
  editNote(state, note) {
    let index = state.notes.findIndex(r => r.id === note.id)
    if(index === -1) {
      console.log("Try to edit unknown note: " + JSON.stringify(note))
      return false
    }

    Vue.set(state.notes, index, note)
    this.$localStore.setNote(note)
  },
  deleteNote(state, noteId) {
    let index = state.notes.findIndex(r => r.id === noteId)
    state.notes.splice(index, 1)

    index = state.deletedNotes.findIndex(r => r.id === noteId)
    state.deletedNotes.splice(index, 1)

    index = state.noteOrder.findIndex(nId => nId === noteId)
    state.noteOrder.splice(index, 1)

    this.$localStore.removeNote(noteId)
    this.$localStore.removeDeletedNote(noteId)
    this.$localStore.setNoteOrder(state.noteOrder)
  },
  deleteNoteSoft(state, noteId){
    let index = state.notes.findIndex(r => r.id === noteId)
    const toDelete = state.notes[index]
    state.notes.splice(index, 1)

    index = state.noteOrder.findIndex(nId => nId === noteId)
    state.noteOrder.splice(index, 1)

    state.deletedNotes.push(toDelete)

    this.$localStore.removeNote(noteId)
    this.$localStore.setDeletedNote(toDelete)
    this.$localStore.setNoteOrder(state.noteOrder)
  },
  restoreDeletedNote(state, noteId) {
    let index = state.deletedNotes.findIndex(r => r.id === noteId)
    const toRestore = state.deletedNotes[index]
    state.deletedNotes.splice(index, 1)

    state.notes.push(toRestore)
    state.noteOrder.push(noteId)

    this.$localStore.removeDeletedNote(noteId)
    this.$localStore.setNote(toRestore)
    this.$localStore.setNoteOrder(state.noteOrder)
  },
  clearNotes(state){
    state.notes = []
    state.noteOrder = []

    this.$localStore.clearNotes()
  },
  clearDeletedNotes(state){
    state.deletedNotes = []

    this.$localStore.clearDeletedNotes()
  },
  triggerOverdueAlarm(state, noteId) {
    if(!state.overdueAlarm.includes(noteId)) {
      state.overdueAlarm.push(noteId)
    }
  },
  removeOverdueAlarm(state, noteId) {
    let index = state.overdueAlarm.findIndex(n => n.id === noteId)
    if(index) {
      state.overdueAlarm.splice(index, 1)
    }

    let note = state.notes.find(n => n.id === noteId)
    note.content.noticed = true
    this.$localStore.setNote(note)
  }
}

export const getters = {
  getNoteById: (state) => (id) => {
    return state.notes.filter(n => n.id === id)[0]
  },
  getAvailableTags(state) {
    let tagMap = {}
    for(let note of state.notes) {
      if(note.tags) {
        for(let curTag of note.tags) {
          tagMap[curTag] = true
        }
      }
    }

    return Object.keys(tagMap).sort()
  },
  getOverdueNotes(state) {
    return state.overdueAlarm.map(nId => state.notes.find(n => n.id === nId))
  },
  hasDeletedNotes: (state) => {
    return state.deletedNotes.length > 0
  }
}

export const actions = {
  init(ctx) {
    return Promise.all([this.$localStore.getNotes(), this.$localStore.getNoteOrder(), this.$localStore.getDeletedNotes()])
      .then(([notes, order, deleted]) => ctx.commit('loadNotes', {notes, order, deleted}))
  },
  checkOverdueNotes(ctx) {
    ctx.state.notes
      .filter(n => n.type === 'reminder')
      .filter(n => n.content.date)
      .filter(n => new Date() > n.content.date)
      .filter(n => !n.content.noticed)
      .forEach(n => {
        ctx.commit('triggerOverdueAlarm', n.id)
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
