import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  //   console.log({ email, password });
  // try {
  axios({
    method: 'POST',
    url: 'http://127.0.0.1:8000/api/v1/user/login',
    // headers: {
    //   Accept: 'application/json',
    //   'Content-Type': 'application/json',
    // },
    data: {
      email,
      password,
    },
    // credentials: 'include',
    withCredentials: true,
  })
    .then((res) => {
      if (res.data.status === 'success') {
        showAlert('success', 'Logged in successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    })
    .catch((error) => {
      showAlert('error', error.response.data.message);
    });
  // } catch (err) {
  //   // console.log(err);
  //   alert(err.response.data.message);
  // }
};

export const logout = async () => {
  console.log('any');
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/user/logout',
    });
    console.log(res);
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
