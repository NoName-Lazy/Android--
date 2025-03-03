import { defineStore } from "pinia";

export const useCounterStore = defineStore("counterState", {
  state: () => {
    return {
      articleCounter: 0,
      commentCounter: 0,
      timerId: null,
      articleCounterEnabled: false,
      commentCounterEnabled: false,
      interval: 1000,
    };
  },
  getters: {},
  actions: {
    resetCounter() {
      (this.articleCounter = 0), (this.commentCounter = 0);
    },
    incrementArticleCounter() {
      this.articleCounter++;
    },
    incrementCommentCounter() {
      this.commentCounter++;
    },
    timerArticleCounter() {
      if (this.articleCounterEnabled) {
        this.incrementArticleCounter();
      }
    },
    timerCommentCounter() {
      if (this.commentCounterEnabled) {
        this.incrementCommentCounter();
      }
    },
    setArticleCounterEnabled(status = true) {
      this.articleCounterEnabled = status;
    },
    setCommentCounterEnabled(status = true) {
      this.commentCounterEnabled = status;
    },
    incrementTimerCounter() {
      this.timerArticleCounter();
      this.timerCommentCounter();
    },
    setInterval(interval = 1000) {
      this.interval = interval;
      this.stopTimer();
      this.startTimer();
    },
    startTimer() {
      this.timerId = setInterval(
        () => this.incrementTimerCounter(),
        this.interval
      );
    },
    stopTimer() {
      clearInterval(this.timerId);
    },
  },
  persist: true,
});
