export default {
  template: `
        <div class="alert alert-danger" v-if="error">{{error}}</div>
        <div class="alert alert-success" v-else-if="success">{{success}}</div>
        <div style="margin-left:80px;margin-top:25px;margin-right:160px;
        background-color: rgb(127, 237, 162);padding:20px;border-radius:8px;" v-else-if="!canLogin">
            <h3 class="text-center">User Registration</h3>
            <div class="container nav-item">
                <label for="email">Enter your email </label>
                <input type="email" placeholder="email"  v-model="email" id="email" required/>
            </div>
            <div class="container nav-item">
                <label for="password">Enter your password</label>  
                <input type="password" placeholder="password"  v-model="password" id="pasword" required/>
            </div>
            <div class="container nav-item">
                <label for="role">Select your role</label> 
                <select v-model="role">
                    <option value="influencer">Influencer</option>
                    <option value="sponsor">Sponsor</option>
                </select>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0 || isSponsor == 1">
                <label for="name">Enter your name </label>
                <input type="text" placeholder="name"  v-model="name" id="name" required/>
            </div>
            <div class="container nav-item" v-if="isSponsor == 1">
                <label for="company_name">Company name</label>  
                <input type="text" placeholder="company name"  v-model="company_name" id="company_name" required/>
            </div>
            <div class="container nav-item" v-if="isSponsor == 1">
                <label for="industry" v-if="isSponsor == 1">Industry Name</label>
                <select v-model="industry" id="industry">
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="fmcg"> FMCG </option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="healthcare">Health Care</option>
                    <option value="education">Education</option>
                </select>
            </div>
            <div class="container nav-item" v-if="isSponsor == 1">
                <label for="budget">Budget</label>
                <select v-model="budget" id="budget">
                    <option value="1000">$ 1K (1 thousand)</option>
                    <option value="10000">$ 10K</option>
                    <option value="20000">$ 20K </option>
                    <option value="50000">$ 50K</option>
                    <option value="100000">$ 100K</option>
                    <option value="200000">$ 200K</option>
                    <option value="300000">$ 300K</option>
                    <option value="400000">$ 400K</option>
                    <option value="500000">$ 500K</option>
                    <option value="1000000">$ 1M (1 million)</option>
                </select>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0">
                <label for="category">Enter your category </label>
                <input type="text" placeholder="example: Education"  v-model="category" id="category" required/>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0">
                <label for="niche">Enter your niche</label>  
                <input type="text" placeholder="e.g. "  v-model="niche" id="niche" required/>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0">
                <label for="followers">Number of Followers </label>
                <input type="number" placeholder="10000"  v-model="followers" id="followers" required/>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0">
                <label for="platform">Platform of Engagement</label>
                <select v-model="platform" id="platform">
                    <option value="youtube">Youtube</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook"> Facebook </option>
                    <option value="xhandle">X Handle</option>
                    <option value="whatsapp">Whatsapp Channel</option>
                    <option value="other">Other Platform</option>
                </select>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0 || isSponsor == 1">
                <label for="description">Description</label> 
                <textarea placeholder="short description"  v-model="description" id="description">
                </textarea>
            </div>
            <div class="container nav-item" v-if="isSponsor != 0 && isSponsor != 1">  
                <button class='btn btn-primary' @click="nextPage"> Next </button>
            </div>
            <div class="container nav-item" v-if="isSponsor != -1">  
                <button class='btn btn-primary' @click="backPage"> Back </button>
            </div>
            <div class="container nav-item" v-if="isSponsor == 0 || isSponsor == 1">  
                <button class='btn btn-primary' @click="submitLogin"> Register </button>
            </div>
        </div>
    `,
  data() {
    return {
        email: null,
        password: null,
        role: null,
        isSponsor: -1,
        name: null,
        company_name: null,
        industry: null,
        budget: 0,
        description: null,
        category: null,
        niche: null,
        followers: null,
        platform: null,
        success: null,
        error: null,
        canLogin: false,
      
    };
  },
  methods: {
    nextPage() {
      console.log(this.role);
      if (this.role == "sponsor") {
        this.isSponsor = 1;
      }
      else if (this.role == "influencer") {
        this.isSponsor = 0;
      } 
    },
    backPage() {
      this.isSponsor = -1;
      this.role = null;
    },
    async submitLogin() {
      if (this.role == "sponsor") {
        const form_data = {
          email: this.email,
          password: this.password,
          role: this.role,
          name: this.name,
          company_name: this.company_name,
          industry: this.industry,
          budget: this.budget,
          description: this.description,
        };
        await fetch(location.origin + "/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form_data),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
                this.success = data.message;
                this.error = "";
                this.canLogin = true;
                setTimeout(() => {
                    this.$router.push("/login")
                }, 2000);
            } else {
                this.error = data.message;
                setTimeout(() => {
                  this.$router.push("/login");
                }, 2000);
            }
          })
          .catch((err) => {
              this.error = err.message;
              this.canLogin = true;
              setTimeout(() => {
                this.$router.push("/home");
              }, 2000);
          });
      }
      else if (this.role == "influencer") {
        const form_data = {
            email: this.email,
            password: this.password,
            role: this.role,
            name: this.name,
            category: this.category,
            niche: this.niche,
            followers: this.followers,
            platform: this.platform,
            description: this.description,
        };
        await fetch(location.origin + "/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form_data),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message) {
                this.success = data.message;
                this.error = "";
                this.canLogin = true;
                setTimeout(() => {
                    this.$router.push("/login")
                }, 2000);
                } else {
                this.error = data.error;
                setTimeout(() => {
                  this.$router.push("/home");
                }, 2000);
                }
            })
            .catch((err) => {
                this.error = err.message;
                this.canLogin = true;
                setTimeout(() => {
                    this.$router.push("/home")
                }, 2000);
            });
      }
    },
  },
};
