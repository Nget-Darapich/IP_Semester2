import { defineStore } from "pinia";
import axios from "axios";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [],
  }),
  getters: {
    countTodos: (state) => state.todos.filter((todo) => todo.completedAt == null).length,
  },
  actions: {
    async fetchTodos() {
      try {
        const response = await axios.get("http://localhost:3100/tasks");
        this.todos = response.data;
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      }
    },

    async toggleStatus(id) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.completedAt = todo.completedAt ? null : new Date().toISOString();
        try {
          await axios.patch(`http://localhost:3100/tasks/${id}`, {
            name: todo.name,
            description: todo.description,
            completedAt: todo.completedAt,
          });
        } catch (error) {
          todo.completedAt = todo.completedAt ? null : new Date().toISOString();
          console.error("Failed to update todo:", error);
        }
      }
    },

    async addTodo(todo) {
      try {
        const res = await axios.post("http://localhost:3100/tasks", {
          name: todo,
          description: "description",
          createdAt: new Date().toISOString(),
          completedAt: null,
          user: 1,
        });
        this.todos.push(res.data);
      } catch (error) {
        console.error("Failed to add todo:", error);
      }
    },

    async clearAll() {
      const completedTodos = this.todos.filter((t) => t.completedAt);
      for (const todo of completedTodos) {
        try {
          await axios.delete(`http://localhost:3100/tasks/${todo.id}`);
          this.todos = this.todos.filter((t) => t.id !== todo.id);
        } catch (error) {
          console.error("Failed to delete todo:", error);
        }
      }
    },
  },
});