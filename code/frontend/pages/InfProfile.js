export default {
  template: `
    <div class="container mt-4" v-if="token">
        <h2 class="text-center">Your Profile</h2>
        <!-- Withdraw Button -->
        <button class="btn btn-success mb-3" @click="openWithdrawModal">Withdraw</button>

        <div class="alert alert-info" v-if="withdrawMessage.length > 0"> {{withdrawMessage}} </div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div v-if="!isEditMode" class="mt-4">
            <h4><strong>Name:</strong> {{ profileData.name }}</h4>
            <p><strong>Category:</strong> {{ profileData.category }}</p>
            <p><strong>Niche:</strong> {{ profileData.niche }}</p>
            <p><strong>Followers:</strong> {{ profileData.followers }}</p>
            <p><strong>Platform:</strong> {{ profileData.platform }}</p>
            <p><strong>Earnings:</strong> $\{{ profileData.earnings }}</p>
            <p><strong>Ratings:</strong> {{ profileData.average_ratings }}</p>
            <p><strong>Number of Ratings:</strong> {{ profileData.no_of_ratings }}</p>
            <p v-if="profileData.description"><strong>Description:</strong> {{ profileData.description }}</p>
            
            <button class="btn btn-primary" @click="toggleEditMode">Edit Profile</button>
        </div>

        <!-- Edit Profile Modal -->
        <div class="modal fade" tabindex="-1" role="dialog" v-if="isEditMode" :class="{'show': isEditMode}" style="display: block;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Profile</h5>
                        <button type="button" class="close" @click="toggleEditMode" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                        <form @submit.prevent="updateProfile">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" v-model="profileData.name" class="form-control" required/>
                            </div>
                            
                            <div class="form-group">
                                <label for="category">Category</label>
                                <input type="text" id="category" v-model="profileData.category" class="form-control" required/>
                            </div>

                            <div class="form-group">
                                <label for="niche">Niche</label>
                                <input type="text" id="niche" v-model="profileData.niche" class="form-control" required/>
                            </div>

                            <div class="form-group">
                                <label for="followers">Followers</label>
                                <input type="number" id="followers" v-model="profileData.followers" class="form-control" required/>
                            </div>

                            <div class="form-group">
                                <label for="platform">Platform</label>
                                <select id="platform" v-model="profileData.platform" class="form-control" required>
                                    <option value="youtube">YouTube</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="xhandle">X Handle</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea id="description" v-model="profileData.description" class="form-control"></textarea>
                            </div>

                            <div class="form-group text-center">
                                <button type="submit" class="btn btn-primary">Update Profile</button>
                                <button type="button" class="btn btn-secondary" @click="toggleEditMode">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Withdraw Modal -->
        <div class="modal" tabindex="-1" role="dialog" v-if="showWithdrawModal"
        style="display:block;" @click="closeWithdrawModal">
          <div class="modal-dialog" role="document" @click.stop>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Withdraw</h5>
                      <button type="button" class="close" aria-label="Close">
                          <span aria-hidden="true" @click="closeWithdrawModal">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body" style="background-color:rgba(0,0,0,0.05);">
                      <form @submit.prevent="withdrawInfluencer">
                          <div class="form-group">
                              <label for="amount">Amount (in dollars)</label>
                              <input type="number" id="amount" class="form-control" v-model="withdrawData.amount" required />
                          </div>
                          <div class="form-group">
                              <label for="password">Enter your password</label>
                              <input type="password" id="password" class="form-control bg-white" v-model="withdrawData.password"
                                  required />
                          </div>
                          <div class="form-group text-center">
                              <button type="submit" class="btn btn-success">Withdraw</button>
                              <button type="button" class="btn btn-danger" @click="closeWithdrawModal">Cancel</button>
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
      profileData: {
        name: "",
        category: "",
        niche: "",
        followers: null,
        platform: "youtube",
        description: "",
      },
      successMessage: "",
      errorMessage: "",
      isEditMode: false,
      showWithdrawModal: false,
      withdrawData: {
        amount: null,
        password: "",
      },
      withdrawMessage: "",
    };
  },
  computed: {
    token() {
      return this.$store.state.auth_token;
    },
  },
  methods: {
    async fetchProfileData() {
      try {
        await fetch(`${location.origin}/get/influencer`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data) {
              this.profileData = data;
            } else {
              this.errorMessage = "Failed to fetch your data";
            }
          });
      } catch (error) {
        this.errorMessage = "Failed to fetch profile data.";
      }
    },

    async updateProfile() {
      try {
        const res = await fetch(`${location.origin}/update/influencer`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
          body: JSON.stringify(this.profileData),
        });
        const data = await res.json();
        if (data.success) {
          this.fetchProfileData();
          this.successMessage = "Profile updated successfully.";
          this.isEditMode = false;
          setTimeout(() => {
            this.successMessage = "";
          }, 2000);
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        this.errorMessage = "Failed to update profile.";
      }
    },

    toggleEditMode() {
      this.isEditMode = !this.isEditMode; // Toggle edit mode
    },
    openWithdrawModal() {
      this.withdrawData = {
        amount: null,
        password: "",
      }
      this.showWithdrawModal = true;
    },
    closeWithdrawModal() {
      this.showWithdrawModal = false;
    },
    async withdrawInfluencer() {
      try {
        const response = await fetch(`${location.origin}/withdraw/influencer`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
          body: JSON.stringify(this.withdrawData),
        });
        const data = await response.json();
        if (data.success) {
          this.withdrawMessage = data.message;
          this.showWithdrawModal = false;
          this.fetchProfileData();
          setTimeout(() => {
            this.withdrawMessage = "";
          }, 2000);
        } else {
          this.withdrawMessage = data.message;
          this.showWithdrawModal = false;
          setTimeout(() => {
            this.withdrawMessage = "";
          }, 2000);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  mounted() {
    this.fetchProfileData();
  },
};

