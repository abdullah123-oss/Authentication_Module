import API from "./axios";

// ------------ SIGNUP ------------
export const signupApi = async ({ name, email, password, role }) => {
  try {
    const response = await API.post('/auth/signup', {
      name,
      email,
      password,
      role
    });
    return response.data;
  } catch (error) {
    // If user exists but unverified, include that in the error
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('unverified')) {
      throw {
        ...error,
        isUnverified: true,
        email
      };
    }
    throw error;
  }
};


// ------------ VERIFY OTP (Signup) ------------
export const verifyOtpApi = async ({ email, otp }) => {
  try {
    const response = await API.post('/auth/verify-otp', {
      email,
      otp: otp.toString() // Ensure OTP is sent as string
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resendOtpApi = async ({ email }) => {
  try {
    const response = await API.post('/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ------------ LOGIN ------------
export const loginApi = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

// ------------ FORGOT PASSWORD ------------
export const forgotPasswordApi = async (data) => {
  const res = await API.post("/auth/forgot-password", data);
  return res.data;
};

// ------------ VERIFY RESET OTP ------------
export const verifyResetOtpApi = async (data) => {
  const res = await API.post("/auth/verify-reset-otp", data);
  return res.data;
};

// ------------ RESET PASSWORD ------------
export const resetPasswordApi = async (data) => {
  const res = await API.post("/auth/reset-password", data);
  return res.data;
};