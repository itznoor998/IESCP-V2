export default {
  template: `
    <div style="margin-left: 10px;">
        <h2 class="text-center">Influencer Search</h2>

        <!-- Search Filters -->
        <div class="form-row">
        <div class="col-md-4 mb-3">
            <label for="category">Category</label>
            <select id="category" class="form-control" v-model="currentCategory">
                <option value="all">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
        </div>

        <div class="col-md-4 mb-3">
            <label for="minFollowers">Min Followers</label>
            <input type="number" id="minFollowers" class="form-control" v-model="minFollowers" placeholder="Min Followers" />
        </div>

        <div class="col-md-4 mb-3">
            <label for="maxFollowers">Max Followers</label>
            <input type="number" id="maxFollowers" class="form-control" v-model="maxFollowers" placeholder="Max Followers" />
        </div>
        <button class="btn btn-info" @click="applyFilters">Apply</button>
        </div>

      <!-- No Influencers Found -->
      <div v-if="filteredInfluencers.length === 0">
        <p class="alert alert-info">No influencers found based on the selected filters.</p>
      </div>

      <!-- Influencer List -->
      <div v-if="filteredInfluencers.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Followers</th>
              <th>Platform</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="influencer in filteredInfluencers" :key="influencer.id">
              <td>{{ influencer.id }}</td>
              <td>{{ influencer.name }}</td>
              <td>{{ influencer.category }}</td>
              <td>{{ influencer.followers }}</td>
              <td>{{ influencer.platform }}</td>
              <td>
                <button class="btn btn-info" @click="viewDetails(influencer)">View Details</button>
                <button class="btn btn-info" @click="ratingModal(influencer)">Rate</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        <!-- Influencer Details Modal -->
        <div class="modal fade" tabindex="-1" role="dialog" v-if="isModalVisible" :class="{'show': isModalVisible}" style="display: block;" @click="closeModal">
            <div class="modal-dialog" role="document" @click.stop>
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Influencer Details</h5>
                        <button type="button" class="close" @click="closeModal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                        <p><strong>Name:</strong> {{ currentInfluencer.name }}</p>
                        <p><strong>Category:</strong> {{ currentInfluencer.category }}</p>
                        <p><strong>Niche:</strong> {{ currentInfluencer.niche }}</p>
                        <p><strong>Followers:</strong> {{ currentInfluencer.followers }}</p>
                        <p><strong>Platform:</strong> {{ currentInfluencer.platform }}</p>
                        <p><strong>Rating:</strong> {{ currentInfluencer.ratings }}</p>
                        <p><strong>Number of Rating:</strong> {{ currentInfluencer.no_of_ratings }}</p>
                        <p><strong>Description:</strong> {{ currentInfluencer.description }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!--Influencer Rating modal-->
        <div class="modal fade" tabindex="-1" role="dialog" v-if="ShowRateModal" :class="{'show': ShowRateModal}"
            style="display: block;" @click="closeRateModal">
            <div class="modal-dialog" role="document" @click.stop>
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rate Influencer</h5>
                        <button type="button" class="close" @click="closeRateModal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitForm">
                            <div class="form-group">
                                <label for="message">Rate (out of 5)</label>
                                <select  id="rating" v-model="rating">
                                    <option value="1"> 1 </option>
                                    <option value="2"> 2 </option>
                                    <option value="3"> 3 </option>
                                    <option value="4"> 4 </option>
                                    <option value="5"> 5 </option>
                                </select>
                            </div>
                            <div class="form-group text-center">
                                <button type="submit" class="btn btn-success" @click="submitRating(currentInfluencer.id)">Rate</button>
                                <button type="button" class="btn btn-danger" @click="closeRateModal">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    </div>
  `,
  data() {
    return {
      token: this.$store.state.auth_token, // Auth token from Vuex store
      influencers: [],
      categories: [],
      currentCategory: "all",
      minFollowers: null,
      maxFollowers: null,
      filteredInfluencers: [],
      isModalVisible: false,
      ShowRateModal: false,
      currentInfluencer: null,
      rating: 0,
    };
  },
  methods: {
    async fetchCategoriesAndInfluencers() {
      try {
        const categoryResponse = await fetch(
          `${location.origin}/get/categories`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
          }
        );
        const categoryData = await categoryResponse.json();
        if (categoryData.success) {
          this.categories = categoryData.categories;
        } else {
          alert("Error fetching categories");
        }

        // Fetch influencers
        const influencerResponse = await fetch(
          `${location.origin}/get/influencers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
          }
        );
        const influencerData = await influencerResponse.json();
        if (influencerData.success) {
          this.influencers = influencerData.influencers;
          this.filteredInfluencers = this.influencers; // Initially show all influencers
        } else {
          alert("Error fetching influencers");
        }
      } catch (error) {
        alert("Error: " + error.message);
      }
    },

    // Apply filters and update the filtered influencers list
    applyFilters() {
      this.filteredInfluencers = this.influencers.filter((influencer) => {
        let isValid = true;

        if (
          this.currentCategory !== 'all' &&
          influencer.category !== this.currentCategory
        ) {
          isValid = false;
        }

        if (this.minFollowers && influencer.followers <= this.minFollowers) {
          isValid = false;
        }

        if (this.maxFollowers && influencer.followers >= this.maxFollowers) {
          isValid = false;
        }

        return isValid;
      });
    },

    viewDetails(influencer) {
      this.currentInfluencer = influencer;
      this.isModalVisible = true;
    },

    closeModal() {
      this.isModalVisible = false;
      this.currentInfluencer = null;
    },
    ratingModal(influencer) {
      this.currentInfluencer = { ...influencer };
      this.ShowRateModal = true;
    },
    closeRateModal() {
      this.currentInfluencer = null;
      this.ShowRateModal = false;
    },
    async submitRating(id) {
      this.closeRateModal();
      try {
        const result = await fetch(
          `${location.origin}/submit/influencer/rating/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ rating: this.rating }),
          }
        );
        const data = await result.json();
        if (data.success) {
          alert(data.message);
        } else {
          alert("Unable to rate influencer");
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  mounted() {
    this.fetchCategoriesAndInfluencers();
  },
};
