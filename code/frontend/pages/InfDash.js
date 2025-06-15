export default {
  template: `
    <div class="container mt-4">
    <h2>Influencer Dashboard</h2>
        <!-- Negotiate Modal -->
        <div class="modal" tabindex="-1" role="dialog" v-if="isModalVisible"
        style="display:block;" @click="closeModal">
            <div class="modal-dialog" role="document" @click.stop>
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Negotiate with Sponsor</h5>
                        <button type="button" class="close" @click="closeModal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="currentAd.spon_msg">
                            <h4><strong>{{currentAd.spon_name}} Message</strong></h4>
                            <p>{{ currentAd.spon_msg }}</p>
                        </div>
                        <form @submit.prevent="submitForm">
                            <div class="form-group">
                                <label for="message">Your Reply</label>
                                <textarea id="message" class="form-control" v-model="currentAd.inf_msg"></textarea>
                            </div>
                            <div class="form-group text-center">
                                <button type="submit" class="btn btn-success" @click="updateAdMsg(currentAd.id)">Negotiate</button>
                                <button type="button" class="btn btn-danger" @click="closeModal">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <!-- Negotiate Modal End-->

        <div v-if="reqAds.length === 0">
            <h2 class="text-info text-center shadow-sm opacity-75">You don't have any <b>Ad Requests</b></h2>
        </div>
        
        <div v-if="accAds.length === 0">
            <h2 class="text-info text-center shadow-sm">You don't have any <b>Accepted Ads</b></h2>
        </div>

        <!-- Ad Requests -->
        <div v-if="reqAds.length > 0">
            <h2 class="text-center">Ad Requests</h2>
            <table class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Terms & Conditions</th>
                        <th>Payment </th>
                        <th>Sponsor Name</th>
                        <th>Campaign Name</th>
                        <th>Actions</th>
                        <th>Negotiate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ad in reqAds" :key="ad.id">
                        <td>{{ ad.id }}</td>
                        <td>{{ ad.terms }}</td>
                        <td>$\{{ ad.payment }}</td>
                        <td>{{ ad.spon_name }}</td>
                        <td>{{ad.camp_name}}</td>
                        <td>
                          <div>
                            <button class="btn btn-primary" @click="acceptAd(ad.id)">Accept</button>
                            <button class="btn btn-danger" @click="rejectAd(ad.id)">Reject</button>
                          </div>
                        </td>
                        <td>
                          <button class="btn btn-primary" @click="openModal(ad)">Negotiate</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Accepted Ads -->
        <div v-if="accAds.length > 0" class="text-center">
            <h2>Accepted Ads</h2>
            <table class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Terms & Conditions</th>
                        <th>Payment </th>
                        <th>Sponsor Name</th>
                        <th>Campaign Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ad in accAds" :key="ad.id">
                        <td>{{ ad.id }}</td>
                        <td>{{ ad.terms }}</td>
                        <td>$\{{ ad.payment }}</td>
                        <td>{{ ad.spon_name }}</td>
                        <td>{{ad.camp_name}}</td>
                        <p v-if="ad.flagged" class="text-danger"><b>Flagged</b></p>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="intCamp.length>0" class="text-center">
          <h2>Your Interested Campaign</h2>
          <ul v-for="camp in intCamp">
            <li>
              You show interest on {{camp.camp_name}} from {{camp.spon_name}}
              <button class="btn btn-danger m-3" @click="hideInterest(camp.id)">Hide Interest</button>
            </li>
          </ul>
        </div>

    </div>
  `,
  data() {
    return {
      token: this.$store.state.auth_token,
      user_id: this.$store.state.user_id,
      reqAds: [],
      accAds: [],
      isModalVisible: false, // Controls modal visibility
      currentAd: null,
      intCamp: [],
    };
  },
  methods: {
    async getAdsList(url, target) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        if (data.success) {
          this[target] = data.ads;
        } else {
          alert(`${data.message}`);
        }
      } catch (error) {
        alert(`Error fetching ads list: ${error.message}`);
      }
    },

    acceptAd(ad_id) {
      if (confirm("Do you want to accept the ad ?")) {
        this.updateAdStatus(ad_id, "accepted");
      }
    },

    rejectAd(ad_id) {
      if (confirm("Do you want to reject the ad ?")) {
        this.updateAdStatus(ad_id, "rejected");
      }
    },

    async updateAdStatus(ad_id, status) {
      try {
        const response = await fetch(
          `${location.origin}/update/ad/status/${ad_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify({ status: status, ad_id: ad_id }),
          }
        );
        const data = await response.json();
        alert(data.message);
        this.getAdsList(`${location.origin}/get/requested/ads/list`, "reqAds");
        this.getAdsList(`${location.origin}/get/accepted/ads/list`, "accAds"); // refresh  ads
      } catch (error) {
        alert(`Error updating ad status: ${error.message}`);
      }
    },

    async updateAdMsg(ad_id) {
      let msg = this.currentAd.inf_msg;
      try {
        const response = await fetch(
          `${location.origin}/update/ad/inf/message/${ad_id}`,
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
        this.getAdsList(`${location.origin}/get/requested/ads/list`, "reqAds");
        this.getAdsList(`${location.origin}/get/accepted/ads/list`, "accAds");
      } catch (error) {
        alert(`Error updating ad message: ${error.message}`);
      }
    },

    openModal(ad) {
      this.isModalVisible = true;
      this.currentAd = ad;
    },

    closeModal() {
      this.isModalVisible = false;
    },

    submitForm() {
      if (this.currentAd) {
        this.closeModal();
        this.getAdsList(`${location.origin}/get/requested/ads/list`, "reqAds");
        this.getAdsList(`${location.origin}/get/accepted/ads/list`, "accAds");
      }
    },
    async hideInterest(campId) {
      try {
        if (confirm("Do you want to hide interest ?")) {
          const response = await fetch(
            `${location.origin}/hide/interest/camp/${campId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "Authentication-Token": this.token,
              },
            }
          );
          const data = await response.json();
          if (data.success) {
            alert(data.message);
            this.fetchIntCamp();
          } else {
            alert(data.message);
          }
        }
      } catch (error) {
        alert("Unable to hide your interest:", error);
      }
    },
    async fetchIntCamp() {
      try {
        const response = await fetch(`${location.origin}/get/interest/camp`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        if (data.success) {
          this.intCamp = data.intCamps;
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error fetching interested campaigns: ", error.message);
      }
    },
  },

  mounted() {
    this.getAdsList(`${location.origin}/get/requested/ads/list`, "reqAds");
    this.getAdsList(`${location.origin}/get/accepted/ads/list`, "accAds");
    this.fetchIntCamp();
  },
};
