export default {
  template: `
    <div class="container mt-4">
        <h2 class="text-center">Campaign Management</h2>

      <!-- No Campaigns Found -->
        <div v-if="camps.length === 0">
            <p class="alert alert-info">No campaigns found.</p>
        </div>

      <!-- Campaigns List -->
        <table v-if="camps.length > 0" class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Goals</th>
                    <th>Category</th>
                    <th>Visibility</th>
                    <th>No of Ads</th>
                    <th>Sponsor Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="camp in camps" :key="camp.id">
                    <td>{{ camp.name }}</td>
                    <td>{{ camp.goal }}</td>
                    <td>{{ camp.category }}</td>
                    <td>{{ camp.visibility }}</td>
                    <td>{{ camp.no_of_ads }}</td>
                    <td>{{ camp.sponsor_name}}</td>
                    <td>{{ camp.description }}</td>
                    <td>
                        <div v-if="!camp.flagged">
                            <button class="btn btn-danger" @click="flagCamp(camp.id)">Flag</button>
                        </div>
                        <div v-else>
                            <button class="btn btn-primary" @click="unflagCamp(camp.id)">Unflag</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  `,
  data() {
    return {
      token: this.$store.state.auth_token,
      camps: [],
    };
  },
  methods: {
    // Fetch campaigns from API
    async fetchCampaigns() {
      try {
        const response = await fetch(`${location.origin}/get/camps/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        if (data.success) {
          this.camps = data.camps;
        } else {
          alert("Error fetching campaigns");
        }
      } catch (error) {
        alert("Error fetching campaigns: " + error.message);
      }
    },

    // Toggle flagging/unflagging a campaign
    async flagCamp(id) {
      try {
        const response = await fetch(
          `${location.origin}/flag/camp/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ flagged: true }),
          }
        );
        const data = await response.json();
        if (data.success) {
          this.fetchCampaigns();
        } else {
          alert("Error flagging campaign");
        }
      } catch (error) {
        alert("Error flagging campaign: " + error.message);
      }
    },
    async unflagCamp(id) {
      try {
        const response = await fetch(
          `${location.origin}/unflag/camp/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ flagged: false }),
          }
        );
        const data = await response.json();
        if (data.success) {
          this.fetchCampaigns();
        } else {
          alert("Error unflagging campaign");
        }
      } catch (error) {
        alert("Error unflagging campaign: " + error.message);
      }
    },
  },
  mounted() {
    this.fetchCampaigns();
  },
};
