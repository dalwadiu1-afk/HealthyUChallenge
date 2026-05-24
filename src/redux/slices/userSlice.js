// redux/slices/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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

  habits: {},

  goal: {},

  challenges: {},

  fruits: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    setUserData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },

    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    updateProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
    },

    setStats: (state, action) => {
      state.stats = action.payload;
    },

    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload,
      };
    },

    setHabits: (state, action) => {
      state.habits = action.payload;
    },

    updateHabits: (state, action) => {
      state.habits = {
        ...state.habits,
        ...action.payload,
      };
    },

    setGoal: (state, action) => {
      state.goal = action.payload;
    },

    updateGoal: (state, action) => {
      state.goal = {
        ...state.goal,
        ...action.payload,
      };
    },

    setChallenges: (state, action) => {
      state.challenges = action.payload;
    },

    updateChallenges: (state, action) => {
      state.challenges = {
        ...state.challenges,
        ...action.payload,
      };
    },

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
  setProfile,
  updateProfile,
  setStats,
  updateStats,
  setHabits,
  updateHabits,
  setGoal,
  updateGoal,
  setChallenges,
  updateChallenges,
  setFruits,
  updateFruits,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
