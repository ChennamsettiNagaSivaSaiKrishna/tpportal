import API from './api';

const studentProfileService = {
  // POST /api/student-profile
  createProfile: async (profileData) => {
    const response = await API.post('/student-profile', profileData);
    return response.data;
  },

  // GET /api/student-profile/:roll_number
  getProfile: async (rollNumber) => {
    const response = await API.get(`/student-profile/${rollNumber}`);
    return response.data;
  },

  // PUT /api/student-profile/:roll_number
  updateProfile: async (rollNumber, profileData) => {
    const response = await API.put(`/student-profile/${rollNumber}`, profileData);
    return response.data;
  },
};

export default studentProfileService;