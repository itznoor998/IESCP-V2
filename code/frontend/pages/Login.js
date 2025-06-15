export default {
  template: `
    <div style="margin-left:80px;margin-top:25px;margin-right:160px;
    background-color: rgb(127, 237, 162);padding: 20px;border-radius: 8px;">
        <h3 class="text-center">User Login</h3>
        <div class="container nav-item">
            <label for="email">Enter your email </label>
            <input type="email" placeholder="email"  v-model="email" id="email" required/>
        </div>
        <div class="container nav-item">
            <label for="password">Enter your password</label>  
            <input type="password" placeholder="password"  v-model="password" id="pasword" required/>
        </div>
        <div class="flex container nav-item">  
            <button class='btn btn-primary' @click="submitLogin"> Login </button>
        </div>
    </div>
    `,
  data() {
    return {
      email: null,
      password: null,
    };
  },
  methods: {
    async submitLogin() {
      await fetch(`${location.origin}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.email, password: this.password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("user", JSON.stringify(data));
            this.$store.commit("setUser");
            this.$router.push("/home");
          } else {
            alert(data.message);
          }
        })
        .catch((error) => (alert(error.message)));
    },
  },
};
