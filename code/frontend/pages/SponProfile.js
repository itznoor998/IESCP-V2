export default {
  template: `
    <div class="container mt-4" v-if="token">
      <h2 class="text-center">Your Profile</h2>
      
      <!-- Success and Error Messages -->
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <!-- View Profile Mode -->
      <div v-if="!isEditMode" class="mt-4">
        <h4><strong>Name:</strong> {{ profileData.name }}</h4>
        <p><strong>Company:</strong> {{ profileData.company_name }}</p>
        <p><strong>Industry:</strong> {{ profileData.industry }}</p>
        <p><strong>Budget:</strong> $\{{ profileData.budget }}</p>
        <p v-if="profileData.description"><strong>Description:</strong>{{ profileData.description }}</p>
        
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
                              <label for="company">Company</label>
                              <input type="text" id="company" v-model="profileData.company_name" class="form-control"/>
                          </div>

                          <div class="form-group">
                              <label for="industry">Industry</label>
                              <input type="text" id="industry" v-model="profileData.industry" class="form-control"/>
                          </div>

                          <div class="form-group">
                              <label for="budget">Budget (in dollars)</label>
                              <input type="number" id="budget" v-model="profileData.budget" class="form-control"/>
                          </div>

                          <div class="form-group" v-if="profileData.description">
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

    </div>
  `,
  data() {
    return {
      profileData: {
        name: "",
        company_name: "",
        industry: "",
        budget: 0,
        description: "",
      },
      successMessage: "",
      errorMessage: "",
      isEditMode: false,
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
        const res = await fetch(`${location.origin}/get/sponsor`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await res.json();
        if (data.success) {
          this.profileData = data.profile;
        } else {
          this.errorMessage = "Failed to fetch your profile data.";
        }
      } catch (error) {
        this.errorMessage = "Error loading profile.";
      }
    },

    async updateProfile() {
      try {
        const res = await fetch(`${location.origin}/update/sponsor`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
          body: JSON.stringify(this.profileData),
        });

        const data = await res.json();
        if (data.success) {
          await this.fetchProfileData();
          this.successMessage = "Profile updated successfully.";
          this.isEditMode = false;
          setTimeout(() => {
            this.successMessage = "";
          }, 2000);
        } else {
          this.errorMessage = data.message;
        }
      } catch (error) {
        this.errorMessage = "Error updating profile.";
      }
    },

    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },
  },
  mounted() {
    this.fetchProfileData();
  },
};
