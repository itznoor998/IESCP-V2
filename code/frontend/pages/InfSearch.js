export default {
  template: `
        <div class="container mt-4">
            <h2 class="text-center">Search for Ongoing Campaigns</h2>
            
            <!-- Filters Section -->
            <div class="filters mb-4">
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" v-model="filters.category" class="form-control">
                        <option value="all">All Categories</option>
                        <option v-for="category in categories" :key="category" :value="category">{{category}}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="min-budget">Min. Budget (USD)</label>
                    <input type="number" id="min-budget" v-model="filters.minBudget" class="form-control" placeholder="Min Budget" min="0" />
                </div>

                <div class="form-group">
                    <label for="max-budget">Max. Budget (USD)</label>
                    <input type="number" id="max-budget" v-model="filters.maxBudget" class="form-control" placeholder="Max Budget" min="0" />
                </div>

                <button class="btn btn-primary" @click="applyFilters">Apply Filters</button>
            </div>

            <!-- Camps List -->
            <div v-if="camps.length > 0">
                <h3>Ongoing Campaigns</h3>
                <div class="row">
                    <div class="col-md-4" v-for="camp in filteredCamps" :key="camp.id">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">{{ camp.name }}</h5>
                                <p class="card-text"><strong>Category:</strong> {{ camp.category }}</p>
                                <p class="card-text"><strong>Goals:</strong> {{ camp.goal }}</p>
                                <p class="card-text"><strong>Duration:</strong> From {{ formatDate(camp.start_date) }} to {{formatDate(camp.end_date)}} </p>
                                <p class="card-text"><strong>Budget:</strong> $\{{ camp.budget }}</p>
                                <p class="card-text"><strong>Sponsor:</strong> {{ camp.spon_name }}</p>
                                <p class="card-text"><strong>Description:</strong> {{ camp.description }}</p>
                                <button class="btn btn-info" @click="showInterest(camp.id)">Show Interest</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredCamps.length===0">
                <p>No campaigns found. Please adjust the filters and try again.</p>
            </div>
        </div>
    `,
  data() {
    return {
      categories: [],
      filters: {
        category: "all",
        minBudget: null,
        maxBudget: null,
      },
      camps: [], // All camps
      filteredCamps: [], // Filtered camps
    };
  },
  computed: {
    token() {
      return this.$store.state.auth_token;
    },
  },
  methods: {
    async fetchCategories() {
      try{
        const res = await fetch(`${location.origin}/get/categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await res.json();
        if (data.success) {
          this.categories = data.categories;
        } else {
          alert(data.message);
        }
      }catch {
        console.log("Error occured.");
      }
    },
    async fetchCamps() {
      try {
        const response = await fetch(`${location.origin}/get/public/camps`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        if (data.success) {
            this.camps = data.camps;
            this.filteredCamps = data.camps;
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Failed to fetch camps:", error);
      }
    },

    applyFilters() {
      let filtered = this.camps;

      if (this.filters.category !== "all") {
        filtered = filtered.filter(
          (camp) => camp.category === this.filters.category
        );
      }

      if (this.filters.minBudget !== null) {
        filtered = filtered.filter(
          (camp) => camp.budget >= this.filters.minBudget
        );
      }

      if (this.filters.maxBudget !== null) {
        filtered = filtered.filter(
          (camp) => camp.budget <= this.filters.maxBudget
        );
      }

      this.filteredCamps = filtered;
    },
    formatDate(date) {
      date = new Date(date);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    async showInterest(campId) {
      try {
        const response = await fetch(
          `${location.origin}/show/interest/camp/${campId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ message: "shows interest on" }),
          }
        );
        const data = await response.json();
        if (data.success) {
          alert(data.message);
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Failed to send interest:", error);
      }
    },
  },
  mounted() {
    this.fetchCamps();
    this.fetchCategories();
  },
};
