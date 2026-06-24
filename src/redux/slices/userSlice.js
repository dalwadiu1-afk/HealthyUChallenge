// redux/slices/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // COMPLETE FIREBASE USER DATA
  profile: {
    avatar: '',
    gender: '',
    memberSince: '',
    name: '',
    username: '',
  },

  stats: {
    activeDays: 0,
    completionRate: 0,
    streak: 0,
    totalHabitsDone: 0,
  },

  goal: {},

  habits: {},

  posts: {},

  snacks: {},

  activities: {},

  challenges: {},

  fruits: {},

  loading: false,

  loaded: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    // SAVE ENTIRE FIREBASE USER OBJECT
    setUserData: (state, action) => {
      const data = action.payload || {};

      state.profile = data.profile || {};
      state.stats = data.stats || {};
      state.goal = data.goal || {};
      state.habits = data.habits || {};
      state.posts = data.posts || {};
      state.snacks = data.snacks || {};
      state.activities = data.activities || {};
      state.challenges = data.challenges || {};
      state.fruits = data.fruits || {};
      state.quizzes = data?.quizzes || {};

      state.loaded = true;
      state.loading = false;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // PROFILE
    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    updateProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
    },

    // STATS
    setStats: (state, action) => {
      state.stats = action.payload;
    },

    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload,
      };
    },

    // GOAL
    setGoal: (state, action) => {
      state.goal = action.payload;
    },

    updateGoal: (state, action) => {
      state.goal = {
        ...state.goal,
        ...action.payload,
      };
    },

    // HABITS
    setHabits: (state, action) => {
      state.habits = action.payload;
    },

    updateHabits: (state, action) => {
      state.habits = {
        ...state.habits,
        ...action.payload,
      };
    },

    // POSTS
    setPosts: (state, action) => {
      state.posts = action.payload;
    },

    updatePosts: (state, action) => {
      state.posts = {
        ...state.posts,
        ...action.payload,
      };
    },

    // SNACKS
    setSnacks: (state, action) => {
      state.snacks = action.payload;
    },

    updateSnacks: (state, action) => {
      state.snacks = {
        ...state.snacks,
        ...action.payload,
      };
    },

    // ACTIVITIES
    setActivities: (state, action) => {
      state.activities = action.payload;
    },

    updateActivities: (state, action) => {
      state.activities = {
        ...state.activities,
        ...action.payload,
      };
    },

    // CHALLENGES
    setChallenges: (state, action) => {
      state.challenges = action.payload;
    },

    updateChallenges: (state, action) => {
      state.challenges = {
        ...state.challenges,
        ...action.payload,
      };
    },

    // FRUITS
    setFruits: (state, action) => {
      state.fruits = action.payload;
    },

    updateFruits: (state, action) => {
      state.fruits = {
        ...state.fruits,
        ...action.payload,
      };
    },

    clearUser: () => initialState,
  },
});

export const {
  setUserData,
  setLoading,

  setProfile,
  updateProfile,

  setStats,
  updateStats,

  setGoal,
  updateGoal,

  setHabits,
  updateHabits,

  setPosts,
  updatePosts,

  setSnacks,
  updateSnacks,

  setActivities,
  updateActivities,

  setChallenges,
  updateChallenges,

  setFruits,
  updateFruits,

  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
