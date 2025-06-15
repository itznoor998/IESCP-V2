export default {
  template: `
    <div class="container mt-4">
        <h2 class="text-center">Campaigns</h2>

        <!-- Create Camp Button -->
        <button class="btn btn-success mb-3" @click="openCreateModal">Create Camp</button>
        <button class="btn btn-success mb-3" @click="createCsv">Export CSV</button>

        <!-- Camp List -->
        <div v-if="camps.length === 0">
            <p class="alert alert-info">No Camps found.</p>
        </div>
        
        <table v-if="camps.length > 0" class="table table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Info</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="camp in camps" :key="camp.id">
                    <td>{{ camp.id }}</td>
                    <td>{{ camp.name }}</td>
                    <td>{{ camp.category }}</td>
                    <td>$\{{ camp.budget }}</td>
                    <td>
                      <button class="btn btn-primary" @click="openCampModal(camp)">View</button>
                    </td>
                    <td>
                        <div v-if="!camp.flagged">
                          <button class="btn btn-primary" @click="openEditModal(camp)">Edit</button>
                          <button class="btn btn-danger" @click="deleteCamp(camp.id)">Delete</button>
                        </div>
                        <div v-else>
                          <p class="text-danger"><strong>Flagged</strong></p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Modal to Show Campaign Details -->
        <div v-if="isCampModalVisible" class="modal" tabindex="-1" style="display:block;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Campaign Details</h5>
                        <button type="button" class="close" @click="closeModal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="currentCamp.id">
                            <p><strong>ID:</strong> {{ currentCamp.id }}</p>
                            <p><strong>Name:</strong> {{ currentCamp.name }}</p>
                            <p><strong>Goals:</strong> {{ currentCamp.goals }}</p>
                            <p><strong>Budget:</strong> $\{{ currentCamp.budget }}</p>
                            <p><strong>Category:</strong> {{ currentCamp.category }}</p>
                            <p><strong>Visibility:</strong> {{ currentCamp.visibility }}</p>
                            <p><strong>Start Date:</strong> {{ formatDate(currentCamp.start_date) }}</p>
                            <p><strong>End Date:</strong> {{ formatDate(currentCamp.end_date) }}</p>
                            <p><strong>Description:</strong> {{ currentCamp.description }}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeCampModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Update Camp Modal -->
        <div class="modal fade" tabindex="-1" role="dialog" v-if="isModalVisible" :class="{'show': isModalVisible}" style="display: block;">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">{{ isEditing ? 'Edit' : 'Create' }} Camp</h5>
                      <button type="button" class="close" @click="closeModal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                      <form @submit.prevent="submitForm">
                          <div class="form-group">
                              <label for="name">Camp Name</label>
                              <input autocomplete="name" type="text" id="name" class="form-control" v-model="currentCamp.name" required />
                          </div>
                          <div class="form-group">
                              <label for="goal">Goals</label>
                              <input type="text" id="goal" class="form-control" v-model="currentCamp.goals" required />
                          </div>
                          <div class="form-group">
                              <label for="start_date">Start Date</label>
                              <input type="date" id="start_date" class="form-control" v-model="currentCamp.start_date" required />
                          </div>
                          <div class="form-group">
                              <label for="end_date">End Date</label>
                              <input type="date" id="end_date" class="form-control" v-model="currentCamp.end_date" required />
                          </div>
                          <div class="form-group">
                              <label for="budget">Budget (in dollars)</label>
                              <input type="number" id="budget" class="form-control" v-model="currentCamp.budget" required />
                          </div>
                          <div class="form-group">
                              <label for="category">Category</label>
                              <select id="category" class="form-control" v-model="currentCamp.category">
                                  <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                              </select>
                          </div>
                          <div class="form-group">
                              <label for="visibility">Visibility</label>
                              <select id="visibility" class="form-control" v-model="currentCamp.visibility">
                                  <option value="Public">Public</option>
                                  <option value="Private">Private</option>
                              </select>
                          </div>
                          <div class="form-group">
                              <label for="description">Description</label>
                              <input type="text" id="description" class="form-control" v-model="currentCamp.description"/>
                          </div>
                          <div class="form-group text-center">
                              <button type="submit" class="btn btn-success">{{ isEditing ? 'Update' : 'Create' }} Camp</button>
                              <button type="button" class="btn btn-danger" @click="closeModal">Cancel</button>
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
      token: this.$store.state.auth_token,
      categories: [],
      camps: [],
      isModalVisible: false,
      isEditing: false,
      isCampModalVisible: false,
      currentCamp: {
        id: null,
        name: "",
        goals: "",
        budget: null,
        category: "",
        start_date: null,
        end_date: null,
        description: "",
        visibility: "",
        flagged: false,
      },
    };
  },
  methods: {
    async fetchCamps() {
      try {
        const response = await fetch(`${location.origin}/get/sponsor/camps`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        this.camps = data.camps;
        this.categories = data.categories;
      } catch (error) {
        alert("Error fetching camps: " + error.message);
      }
    },

    openCreateModal() {
      this.isEditing = false;
      this.currentCamp = {
        id: null,
        name: "",
        goals: "",
        budget: null,
        category: "",
        start_date: null,
        end_date: null,
        description: "",
        visibility: "",
      };
      this.isModalVisible = true;
      this.isCampModalVisible = false;
    },

    openEditModal(camp) {
      this.isEditing = true;
      this.currentCamp = { ...camp };
      this.isModalVisible = true;
      this.isCampModalVisible = false;
    },

    closeModal() {
      this.isModalVisible = false;
      this.isCampModalVisible = false;
    },
    openCampModal(camp) {
      this.currentCamp = { ...camp };
      this.isCampModalVisible = true;
      this.isModalVisible = false;
    },
    closeCampModal() {
      this.isCampModalVisible = false;
    },

    async submitForm() {
      if (this.isEditing) {
        await this.updateCamp();
      } else {
        await this.createCamp();
      }
      this.closeModal();
    },

    async createCamp() {
      try {
        const response = await fetch(`${location.origin}/create/camp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
          body: JSON.stringify(this.currentCamp),
        });
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          this.fetchCamps();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error creating camp: " + error.message);
      }
    },

    async updateCamp() {
      try {
        const response = await fetch(
          `${location.origin}/update/camp/${this.currentCamp.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify(this.currentCamp),
          }
        );
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          this.fetchCamps();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error updating camp: " + error.message);
      }
    },

    async deleteCamp(id) {
      if (confirm("Are you sure you want to delete this camp?")) {
        try {
          const response = await fetch(`${location.origin}/delete/camp/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
          });
          const data = await response.json();
          if (data.success) {
            this.fetchCamps();
            setTimeout(() => {
              alert(data.message);
            }, 500);
          } else {
            alert(data.message);
          }
        } catch (error) {
          alert("Error deleting camp: " + error.message);
        }
      }
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
    async createCsv() {
      try {
        const response = await fetch(`${location.origin}/create/csv`, {
          method: "GET",
          headers: {
            "Content-Type": 'application/json',
            "Authentication-Token": this.token
          }
        });
        const data = await response.json();
        if (data.success) {
          let task_id = data.task_id
          const interval = setInterval(async () => {
            const result = await fetch(
              `${location.origin}/get/csv/${task_id}`);
            if (result.ok) {
              window.open(`${location.origin}/get/csv/${task_id}`);
              clearInterval(interval);
            }
          },500);
        } else {
          alert("Something went wrong. Try later.");
        }
      }catch(error) {
        alert(error.message);
      }
    }
  },
  mounted() {
    this.fetchCamps();
  },
};
