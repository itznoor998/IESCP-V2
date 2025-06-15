export default {
  template: `
        <div class="container mt-4">
            <h2 class="text-center">Manage Categories</h2>

            <!-- Create Category Button -->
            <button class="btn btn-success mb-3" @click="openCreateModal">Create Category</button>

            <!-- Categories List -->
            <div v-if="categories.length === 0">
                <p class="alert alert-info">No categories available.</p>
            </div>

            <table v-if="categories.length > 0" class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>No of Campaigns</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="category in categories" :key="category.id">
                        <td>{{ category.id }}</td>
                        <td>{{ category.name }}</td>
                        <td>{{ category.no_of_campaigns }}</td>
                        <td>
                            <button class="btn btn-primary" @click="openEditModal(category)">Edit</button>
                            <button class="btn btn-danger" @click="deleteCategory(category.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Create/Update Category Modal -->
            <div class="modal" tabindex="-1" role="dialog" v-if="isModalVisible"
            style="display:block;" @click="closeModal">
                <div class="modal-dialog" role="document" @click.stop>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ isEditing ? 'Edit' : 'Create' }} Category</h5>
                            <button type="button" class="close" @click="closeModal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="submitForm">
                                <div class="form-group">
                                    <label for="name">Category Name</label>
                                    <input type="text" id="name" class="form-control" v-model="currentCategory.name" required />
                                </div>
                                <div class="form-group text-center">
                                    <button type="submit" class="btn btn-success">{{ isEditing ? 'Update' : 'Create' }}
                                        Category</button>
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
      isModalVisible: false,
      isEditing: false,
      currentCategory: {
        id: null,
        name: "",
        no_of_campaigns: 0,
      },
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await fetch(`${location.origin}/get/admin/category`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
        });
        const data = await response.json();
        if (data.success) {
          this.categories = data.categories;
        } else {
          alert("Error fetching categories");
        }
      } catch (error) {
        alert("Error fetching categories: " + error.message);
      }
    },

    openCreateModal() {
      this.isEditing = false;
      this.currentCategory = { id: null, name: "", no_of_campaigns: 0 };
      this.isModalVisible = true;
    },

    
    openEditModal(category) {
      this.isEditing = true;
      this.currentCategory = { ...category };
      this.isModalVisible = true;
    },

    
    closeModal() {
      this.isModalVisible = false;
      this.currentCategory = { id: null, name: "", no_of_campaigns: 0 };
    },

    
    async submitForm() {
      if (this.isEditing) {
        await this.updateCategory();
      } else {
        await this.createCategory();
      }
      this.closeModal();
    },

    
    async createCategory() {
      try {
        const response = await fetch(`${location.origin}/create/category`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.token,
          },
          body: JSON.stringify(this.currentCategory),
        });
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          this.fetchCategories(); 
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error creating category: " + error.message);
      }
    },

    
    async updateCategory() {
      try {
        const response = await fetch(
          `${location.origin}/update/category/${this.currentCategory.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.token,
            },
            body: JSON.stringify(this.currentCategory),
          }
        );
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          this.fetchCategories();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error updating category: " + error.message);
      }
    },

    
    async deleteCategory(id) {
      if (confirm("Are you sure you want to delete this category?")) {
        try {
          const response = await fetch(
            `${location.origin}/delete/category/${id}`,
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
            this.fetchCategories(); 
          } else {
            alert(data.message);
          }
        } catch (error) {
          alert("Error deleting category: " + error.message);
        }
      }
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
