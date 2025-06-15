export default {
  template: `
    <div class="container mt-4">
      <h2 class="text-center">Summary</h2>

      <div class="row">
        <!-- Influencers Summary -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Influencers</h5>
              <p class="card-text">Total: {{ summary.influencers_count }}</p>
              <p class="card-text text-danger">Flagged: {{ summary.flagged_influencers_count }}</p>
            </div>
          </div>
        </div>

        <!-- Sponsors Summary -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Sponsors</h5>
              <p class="card-text">Total: {{ summary.sponsors_count }}</p>
              <p class="card-text text-danger">Flagged: {{ summary.flagged_sponsors_count }}</p>
            </div>
          </div>
        </div>

        <!-- Campaigns Summary -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Campaigns</h5>
              <p class="card-text">Total: {{ summary.campaigns_count }}</p>
              <p class="card-text text-danger">Flagged: {{ summary.flagged_campaigns_count }}</p>
            </div>
          </div>
        </div>

        <!-- Ads Summary -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Ads</h5>
              <p class="card-text">Accepted: {{ summary.ads.accepted }}</p>
              <p class="card-text">Rejected: {{ summary.ads.rejected }}</p>
              <p class="card-text">Pending: {{ summary.ads.pending }}</p>
              <p class="card-text text-danger">Flagged: {{ summary.ads.flagged }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      token: this.$store.state.auth_token,
      summary: {
        influencers_count: 0,
        flagged_influencers_count: 0,
        sponsors_count: 0,
        flagged_sponsors_count: 0,
        campaigns_count: 0,
        flagged_campaigns_count: 0,
        ads: {
          accepted: 0,
          rejected: 0,
          pending: 0,
          flagged: 0,
        },
      },
    };
  },
  methods: {
    async fetchSummary() {
      try {
        const response = await fetch(`${location.origin}/admin/summary`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token, 
          },
        });
        const data = await response.json();
        if (data.success) {
          this.summary = data.summary;
        } else {
          alert("Error fetching summary data");
        }
      } catch (error) {
        alert("Error fetching summary data: " + error.message);
      }
    },
  },
  mounted() {
    this.fetchSummary();
  },
};
