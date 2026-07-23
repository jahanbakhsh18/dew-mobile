
const authStore = {
  resetLocalAuth: null as (() => Promise<void>) | null,

  setResetLocalAuth(fn: (() => Promise<void>) | null) { this.resetLocalAuth = fn; },
  
  async triggerResetLocalAuth() {
    if (this.resetLocalAuth) {
      await this.resetLocalAuth();
    }
  }
};

export default authStore;