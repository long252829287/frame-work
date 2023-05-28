import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStore = defineStore("main", {
  state:()=>{
    return {
      count:0,
      csrfToken: '',
    }
  },
  actions: {
    setToken(string){
      this.csrfToken = string
    }
  }
})

