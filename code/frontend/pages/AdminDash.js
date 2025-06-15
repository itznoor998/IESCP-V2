export default {
  template: `
        <div class="container mt-4">
        <!-- Sponsors/Influencers not found -->
        <div class="alert alert-info" v-if="sponsors.length===0">We currently do not have any active sponsors</div>
        <div class="alert alert-info" v-if="influencers.length===0">We currently do not have any active influencers</div>

        <!-- Sponsors/Influencers Details -->
        <div v-if="sponsors.length>0">
            <h2>Sponsors</h2>
            <table class="table table-striped table-bordered">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Budget</th>
                    <th>Actions</th>
                </tr>
                <tr v-for="sponsor in sponsors" :key="sponsor.id">
                    <td>{{sponsor.id}} </td>
                    <td>{{sponsor.name}}</td>
                    <td>{{sponsor.company_name}} </td>
                    <td>{{sponsor.industry}} </td>
                    <td>$\{{sponsor.budget}} </td>
                    <td>
                        <div v-if="!sponsor.flagged">
                            <button class="btn btn-danger m-3" @click="flagUser(sponsor.id,sponsor.role)">Flag</button>
                        </div>
                        <div v-else>
                            <button class="btn btn-primary m-3" @click="unflagUser(sponsor.id,sponsor.role)">Unflag</button>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        
        <div v-if="influencers.length>0">
            <h2>Influencers</h2>
            <table class="table table-striped table-bordered">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Platform</th>
                    <th>Followers</th>
                    <th>Ratings</th>
                    <th>Actions</th>
                </tr>
                <tr v-for="influencer in influencers" :key="influencer.id">
                    <td>{{influencer.id}} </td>
                    <td>{{influencer.name}} </td>
                    <td>{{influencer.category}} </td>
                    <td>{{influencer.platform}} </td>
                    <td>{{influencer.followers}}</td>
                    <td>{{influencer.ratings}}</td>
                    <td>
                        <div v-if="!influencer.flagged">
                        <button class="btn btn-danger" @click=" flagUser(influencer.id,influencer.role) "> Flag </button>
                        </div>
                        <div v-else>
                        <button class="btn btn-primary" @click=" unflagUser(influencer.id,influencer.role) "> Unflag </button>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    `,
  data() {
    return {
      sponsors: [],
      influencers: [],
      token: this.$store.state.auth_token,
    };
  },
  methods: {
    async getSponsors() {
      try {
        const result = await fetch(`${location.origin}/get/sponsors/list`, {
          method: "GET",
          headers: {
            "Conntent-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await result.json();
        if (data.success) {
          this.sponsors = data.sponsors;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getInfluencers() {
      try {
        const res = await fetch(`${location.origin}/get/influencers/list`, {
          method: "GET",
          headers: {
            "Conntent-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await res.json();
        if (data.success) {
          this.influencers = data.influencers;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async flagUser(id, role) {
      try {
        if (confirm("Do you want to flag the user ?")) {
          const result = await fetch(`${location.origin}/flag/user/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ flagged: true, role: role }),
          });
          const data = await result.json();
          if (data.success) {
            alert(data.message);
            this.getInfluencers();
            this.getSponsors();
          } else {
            alert(data.message);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async unflagUser(id, role) {
      try {
        if (confirm("Do you want to unflag the user ?")) {
          const result = await fetch(`${location.origin}/unflag/user/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ flagged: false, role: role }),
          });
          const data = await result.json();
          if (data.success) {
            alert(data.message);
            this.getInfluencers();
            this.getSponsors(); // refresh to see their flagged state
          } else {
            alert(data.message);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  mounted() {
    this.getSponsors();
    this.getInfluencers();
  },
};