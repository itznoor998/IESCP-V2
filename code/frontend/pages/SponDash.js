export default {
  template: `
        <div class="container mt-4">
        <h2>Sponsor Dashboard</h2>

        <!-- Ads Tabs -->
        <ul class="nav nav-tabs mb-4" id="adTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <a class="nav-link" :class="{ active: currentTab === 'pending' }" @click="setTab('pending')"
                    id="pending-tab" data-bs-toggle="tab" href="#pending" role="tab" aria-controls="pending"
                    aria-selected="true">
                    Pending Ads
                </a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" :class="{ active: currentTab === 'accepted' }" @click="setTab('accepted')"
                    id="accepted-tab" data-bs-toggle="tab" href="#accepted" role="tab" aria-controls="accepted"
                    aria-selected="false">
                    Accepted Ads
                </a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" :class="{ active: currentTab === 'rejected' }" @click="setTab('rejected')"
                    id="rejected-tab" data-bs-toggle="tab" href="#rejected" role="tab" aria-controls="rejected"
                    aria-selected="false">
                    Rejected Ads
                </a>
            </li>
            <!-- Interest-Campaigns shown by influencer -->
            <li class="nav-item" role="presentation">
                <a class="nav-link" :class="{ active: currentTab === 'interestShownCamps' }"
                    @click="setTab('interestShownCamps')" id="pending-tab" data-bs-toggle="tab" href="#interestShownCamps"
                    role="tab" aria-controls="interestShownCamps" aria-selected="true">
                    Campaign Notifications
                </a>
            </li>
        </ul>

        <div class="tab-content">
          <div v-if="currentTab === 'interestShownCamps'" class="tab-pane fade show active"
                id="interestShownCamps" role="tabpanel"
                aria-labelledby="interestShownCamps-tab">
                <h3>Interest Shown Campaigns</h3>
                <div v-if="intCamps.length === 0" class="alert alert-info">No such campaigns found.</div>
                <ul v-for="camp in intCamps" v-if="intCamps.length>0">
                  <li>{{camp.inf_name}} with <b>id</b> {{camp.inf_id}} has shown interest on {{camp.camp_name}}</li>
                </ul>
          </div>
          <!-- Ads Content -->
          <div v-if="currentTab === 'pending'" class="tab-pane fade show active" id="pending" role="tabpanel"
                aria-labelledby="pending-tab">
              <h3>Pending Ads</h3>
              <div v-if="pendingAds.length === 0" class="alert alert-info">No pending ads found.</div>
              <table v-if="pendingAds.length > 0" class="table table-striped">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>From Camp</th>
                          <th>Terms</th>
                          <th>Payment</th>
                          <th>Influencer</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="ad in pendingAds" :key="ad.id">
                          <td>{{ ad.id }}</td>
                          <td>{{ ad.camp_name }}</td>
                          <td>{{ ad.terms }}</td>
                          <td>$\{{ ad.payment }}</td>
                          <td>{{ ad.inf_name }}</td>
                          <td v-if="!ad.flagged">
                              <button class="btn btn-info btn-sm" @click="openAdDetails(ad)">View Details</button>
                              <button class="btn btn-primary m-3" @click="openModal(ad)">Negotiate</button>
                          </td>
                          <td v-else class="text-danger">
                              <p><strong>Flagged</strong></p>
                          </td>
                      </tr>
                  </tbody>
              </table>
            </div>

            <div v-if="currentTab === 'accepted'" class="tab-pane fade show active" id="accepted" role="tabpanel"
                aria-labelledby="accepted-tab">
                <h3>Accepted Ads</h3>
                <div v-if="acceptedAds.length === 0" class="alert alert-info">No accepted ads found.</div>
                <table v-if="acceptedAds.length > 0" class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>From Camp</th>
                            <th>Terms</th>
                            <th>Payment</th>
                            <th>Influencer</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ad in acceptedAds" :key="ad.id">
                            <td>{{ ad.id }}</td>
                            <td>{{ ad.camp_name }}</td>
                            <td>{{ ad.terms }}</td>
                            <td>$\{{ ad.payment }}</td>
                            <td>{{ ad.inf_name }}</td>
                            <td v-if="!ad.flagged">
                                <button class="btn btn-info btn-sm" @click="openAdDetails(ad)">View Details</button>
                            </td>
                            <td v-else class="text-danger">
                                <p><strong>Flagged</strong></p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="currentTab === 'rejected'" class="tab-pane fade show active" id="rejected" role="tabpanel"
                aria-labelledby="rejected-tab">
                <h3>Rejected Ads</h3>
                <div v-if="rejectedAds.length === 0" class="alert alert-info">No rejected ads found.</div>
                <table v-if="rejectedAds.length > 0" class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>From Camp</th>
                            <th>Payment</th>
                            <th>Influencer</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ad in rejectedAds" :key="ad.id">
                            <td>{{ ad.id }}</td>
                            <td>{{ ad.camp_name }}</td>
                            <td>$\{{ ad.payment }}</td>
                            <td>{{ ad.inf_name }}</td>
                            <td v-if="!ad.flagged">
                                <button class="btn btn-info btn-sm" @click="openAdDetails(ad)">View Details</button>
                            </td>
                            <td v-else class="text-danger">
                                <p><strong>Flagged</strong></p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal to Show Ad Details -->
        <div v-if="isModalVisible" class="modal fade show" tabindex="-1" aria-labelledby="adDetailsModalLabel"
            aria-hidden="true" style="display:block;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="adDetailsModalLabel">Ad Details</h5>
                        <button type="button" class="close" @click="closeModal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="currentAd">
                            <p><strong>ID:</strong> {{ currentAd.id }}</p>
                            <p><strong>From Camp:</strong> {{ currentAd.camp_name }}</p>
                            <p><strong>Terms:</strong> {{ currentAd.terms }}</p>
                            <p><strong>Payment:</strong> $\{{ currentAd.payment }}</p>
                            <p><strong>Status:</strong> {{ currentAd.status }}</p>
                            <p><strong>Influencer Name:</strong> {{ currentAd.inf_name }}</p>
                            <p><strong>Your Message:</strong> {{ currentAd.spon_msg }}</p>
                            <p><strong>Influencer Reply:</strong> {{ currentAd.inf_msg }}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Negotiate Modal -->
        <div class="modal" tabindex="-1" role="dialog" v-if="canNegotiate" style="display:block;" >
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Negotiate with Influencer</h5>
                        <button type="button" class="close" @click="closeModal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="currentAd.inf_msg">
                            <h4><strong>{{currentAd.inf_name}} Message</strong></h4>
                            <p>{{ currentAd.inf_msg }}</p>
                        </div>
                        <form @submit.prevent="submitForm">
                            <div class="form-group">
                                <label for="message">Your Reply</label>
                                <textarea id="message" class="form-control" v-model="currentAd.spon_msg"></textarea>
                            </div>
                            <div class="form-group text-center">
                                <button type="submit" class="btn btn-success" @click="updateAdMsg(currentAd.id,currentAd.spon_msg)">Negotiate</button>
                                <button type="button" class="btn btn-danger" @click="closeModal">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <!-- Negotiate Modal End-->

    </div>
    `,
  data() {
    return {
      currentTab: "pending", // Active tab (pending, accepted, rejected)
      pendingAds: [],
      acceptedAds: [],
      rejectedAds: [],
      currentAd: null,
      isModalVisible: false,
      canNegotiate: false,
      token: this.$store.state.auth_token,
      intCamps: [],
    };
  },
  methods: {
    setTab(tab) {
      this.currentTab = tab;
      if (tab === "interestShownCamps") {
        this.fetchInterestShownCamps();
      } else {
        this.fetchAds();
      }
    },

    openAdDetails(ad) {
      this.currentAd = { ...ad };
      this.isModalVisible = true;
      this.canNegotiate = false;
    },
    openModal(ad) {
      this.currentAd = { ...ad };
      this.canNegotiate = true;
      this.isModalVisible = false;
    },

    closeModal() {
      this.isModalVisible = false;
      this.currentAd = null;
      this.canNegotiate = false;
    },
    async updateAdMsg(ad_id, msg) {
      try {
        const response = await fetch(
          `${location.origin}/update/ad/spon/message/${ad_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ message: msg }),
          }
        );
        const data = await response.json();
        alert(data.message);
        this.fetchAds();
      } catch (error) {
        alert(`Error updating ad message: ${error.message}`);
      }
    },

    async fetchAds() {
      try {
        const response = await fetch(
          `${location.origin}/get/sponsor/ads/${this.currentTab}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          if (this.currentTab === "pending") {
            this.pendingAds = data.ads;
          } else if (this.currentTab === "accepted") {
            this.acceptedAds = data.ads;
          } else if (this.currentTab === "rejected") {
            this.rejectedAds = data.ads;
          }
        } else {
          alert("Error fetching ads");
        }
      } catch (error) {
        alert("Error fetching ads: " + error.message);
      }
    },
    async fetchInterestShownCamps() {
      try {
        const response = await fetch(
          `${location.origin}/get/interest/camp/sponsor`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          this.intCamps = data.intCamps;
        } else {
          alert(data.message);
        }
      } catch {
        alert("Error fetching data.");
      }
    },
    submitForm() {
      if (this.currentAd) {
        this.closeModal();
        this.fetchAds();
      }
    },
  },
  mounted() {
    this.fetchAds();
  },
};