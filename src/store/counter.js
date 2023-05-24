import {defineStore} from "pinia"

export const useCounterStore = defineStore("counter",{
  state:()=>{
    return {
      count:0,
      csrfToken: '',
      canvasFingerPoint: ''
    }
  },
  actions:{
    increment(){
      this.count++
    }
  }
})