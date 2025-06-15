export default {
  template: `
    <div>
        <router-link to='/' class="nav-item navbar-toggler">Home</router-link>
        <router-link v-if="!$store.state.loggedIn" to='/login' class="nav-item navbar-toggler">Login</router-link>
        <router-link v-if="!$store.state.loggedIn" to='/register' class="nav-item navbar-toggler">Register</router-link>
        



        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to='/admin/dashboard'>Admin Dash</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to='/admin/campaigns'>Campaign</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to='/admin/categories'>Category</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'admin'" to='/admin/summary'>Summary</router-link>




        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'sponsor'" to='/sponsor/dashboard'>Sponsor Dashboard</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'sponsor'" to='/sponsor/profile'>Profile</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'sponsor'" to='/sponsor/campaign'>Campaign</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'sponsor'" to='/sponsor/ads'>Ads</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'sponsor'" to='/sponsor/search'>Search Influencer</router-link>




        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'influencer'" to='/influencer/dashboard'>Influencer Dashboard</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'influencer'" to='/influencer/profile'>Profile</router-link>
        <router-link class="nav-item navbar-toggler" v-if="$store.state.loggedIn && $store.state.role == 'influencer'" to='/influencer/search'>Find Campaign</router-link>
        
        
        <button class="btn btn-secondary m-3" v-if="$store.state.loggedIn" @click="logout">Logout</button>
        
        <h2 v-if="!$store.state.loggedIn" class="display-3 text-center bg-light p-3">Welcome to CampaignHub</h2>

        <div class="alert alert-danger" v-if="flagged"> You're flagged. Contact support team for more information </div>
    </div>
    `,
  data() {
    return {
      flagged: false,
      loggedIn: this.$store.state.loggedIn,
      token : ''
      }
    },
  methods: {
    logout() {
      this.$store.dispatch('logoutToHome', this.$router);
    },
    async getUser() {
      try {
        const response = await fetch(`${location.origin}/get/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token
          }
        });
        const data = await response.json();
        this.flagged = data.flagged;
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted() {
    if (this.loggedIn) {
      this.token = this.$store.state.auth_token;
      this.getUser();
    }
  }
};
