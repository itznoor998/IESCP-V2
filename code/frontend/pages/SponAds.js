export default {
  template: `
  <div class="container mt-4">
    <h2 class="text-center">Ads</h2>

    <!-- Create Ad Button -->
    <button class="btn btn-success mb-3" @click="openCreateModal">Create Ad</button>
    <!-- Payment Button -->
    <button class="btn btn-success mb-3" @click="openPaymentModal">Payment</button>

    <div class="alert alert-info" v-if="paymentMessage.length > 0"> {{paymentMessage}} </div>

    <!-- Create/Update Ad Modal -->
    <div class="modal" tabindex="-1" role="dialog" v-if="isModalVisible" style="display:block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit' : 'Create' }} Ad</h5>
            <button type="button" class="close" aria-label="Close">
              <span aria-hidden="true" @click="closeModal">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="background-color:rgba(0,0,0,0.05);">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="camp_id">Campaign ID</label>
                <input type="number" id="camp_id" class="form-control bg-light" v-model="currentAd.camp_id" required />
              </div>
              <div class="form-group">
                <label for="term">Terms</label>
                <input type="text" id="term" class="form-control" v-model="currentAd.terms" required />
              </div>
              <div class="form-group">
                <label for="payment">Payment (in dollars)</label>
                <input type="number" id="payment" class="form-control bg-white" v-model="currentAd.payment" required />
              </div>
              <div class="form-group">
                <label for="inf_id">Influencer ID</label>
                <input type="number" id="inf_id" class="form-control" v-model="currentAd.inf_id" required />
              </div>
              <div class="form-group text-center">
                <button type="submit" class="btn btn-success">{{ isEditing ? 'Update' : 'Create' }} Ad</button>
                <button type="button" class="btn btn-danger" @click="closeModal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div class="modal" tabindex="-1" role="dialog" v-if="showPayModal"
    style="display:block;" @click="closePayModal">
      <div class="modal-dialog" role="document" @click.stop>
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title">Payment</h5>
                  <button type="button" class="close" aria-label="Close">
                      <span aria-hidden="true" @click="closePayModal">&times;</span>
                  </button>
              </div>
              <div class="modal-body" style="background-color:rgba(0,0,0,0.05);">
                  <form @submit.prevent="payInfluencer">
                      <div class="form-group">
                          <label for="inf_id">Influencer ID</label>
                          <input type="number" id="inf_id" class="form-control bg-light" v-model="paymentData.inf_id"
                              required />
                      </div>
                      <div class="form-group">
                          <label for="amount">Amount (in dollars)</label>
                          <input type="number" id="amount" class="form-control" v-model="paymentData.amount" required />
                      </div>
                      <div class="form-group">
                          <label for="password">Enter your password</label>
                          <input type="password" id="password" class="form-control bg-white" v-model="paymentData.password"
                              required />
                      </div>
                      <div class="form-group text-center">
                          <button type="submit" class="btn btn-success">Pay</button>
                          <button type="button" class="btn btn-danger" @click="closePayModal">Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
    </div>

    <!-- Ads List -->
    <div v-if="ads.length === 0">
      <p class="alert alert-info">No Ads found.</p>
    </div>

    <table v-if="ads.length > 0" class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>From Camp</th>
          <th>Terms</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Influencer(ID)</th>
          <th>Your Message</th>
          <th>Influencer Reply</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ad in ads" :key="ad.id">
          <td>{{ ad.id }}</td>
          <td>{{ ad.camp_name }}</td>
          <td>{{ ad.terms }}</td>
          <td>$\{{ ad.payment }}</td>
          <td>{{ ad.status }}</td>
          <td>{{ ad.inf_name }} ({{ad.inf_id}})</td>
          <td>{{ ad.spon_msg }}</td>
          <td>{{ ad.inf_msg }}</td>
          <td>
            <div v-if="!ad.flagged">
              <button class="btn btn-primary" @click="openEditModal(ad)">Edit</button>
              <button class="btn btn-danger" @click="deleteAd(ad.id)">Delete</button>
            </div>
            <div v-else class="text-danger">
              <p><strong>Flagged</strong></p>
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
      ads: [],
      isModalVisible: false,
      showPayModal: false,
      isEditing: false,
      currentAd: {
        id: null,
        terms: "",
        status: "",
        inf_msg: "",
        spon_msg: "",
        payment: null,
        camp_name: "",
        camp_id: null,
        inf_name: "",
        inf_id: null,
        flagged: false,
      },
      paymentData: {
        inf_id: null,
        amount: null,
        password: "",
      },
      paymentMessage:'',
    };
  },
  methods: {
    async fetchAds() {
      try {
        const response = await fetch(`${location.origin}/get/sponsor/ads/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        if (data.success) {
          this.ads = data.ads;
        } else {
          alert("Something went wrong");
        }
      } catch (error) {
        alert("Error fetching ads: " + error.message);
      }
    },

    openCreateModal() {
      this.isEditing = false;
      this.currentAd = {
        id: null,
        terms: "",
        status: "",
        inf_msg: "",
        spon_msg: "",
        payment: null,
        camp_name: "",
        camp_id: null,
        inf_name: "",
        inf_id: null,
        flagged: false,
      };
      this.isModalVisible = true;
    },

    openEditModal(ad) {
      this.isEditing = true;
      this.currentAd = { ...ad };
      this.isModalVisible = true;
    },
    openPaymentModal() {
      this.paymentData = {
        inf_id: null,
        amount: null,
        password: "",
      }
      this.showPayModal = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    closePayModal() {
      this.showPayModal = false;
    },
    async submitForm() {
      if (this.isEditing) {
        await this.updateAd();
      } else {
        await this.createAd();
      }
      this.closeModal();
    },

    async createAd() {
      try {
        const response = await fetch(`${location.origin}/create/ad`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
          body: JSON.stringify(this.currentAd),
        });
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          this.fetchAds();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error creating ad: " + error.message);
      }
    },

    async updateAd() {
      try {
        const response = await fetch(
          `${location.origin}/update/ad/${this.currentAd.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify(this.currentAd),
          }
        );
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          this.fetchAds();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error updating ad: " + error.message);
      }
    },

    async deleteAd(id) {
      if (confirm("Are you sure you want to delete this ad?")) {
        try {
          const response = await fetch(`${location.origin}/delete/ad/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
          });
          const data = await response.json();
          if (data.success) {
            alert(data.message);
            this.fetchAds();
          } else {
            alert(data.message);
          }
        } catch (error) {
          alert("Error deleting ad: " + error.message);
        }
      }
    },
    async payInfluencer() {
      try {
        const response = await fetch(`${location.origin}/pay/influencer`, {
          method: "PUT",
          headers: {
            "Content-Type": 'application/json',
            "Authentication-Token": this.token
          },
          body: JSON.stringify(this.paymentData)
        });
        const data = await response.json();
        if (data.success) {
          this.paymentMessage = data.message;
          this.showPayModal = false;
          setTimeout(() => {
            this.paymentMessage = ''
          }, 2000);
        } else {
          this.paymentMessage = data.message;
          this.showPayModal = false;
          setTimeout(() => {
            this.paymentMessage = "";
          }, 2000);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  mounted() {
    this.fetchAds();
  },
};
