// updateData function
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
  //   console.log({ email, password });
  const url =
    type === 'password'
      ? 'http://127.0.0.1:8000/api/v1/user/update-password'
      : 'http://127.0.0.1:8000/api/v1/user/update-user';

  try {
    axios({
      method: 'PATCH',
      url,
      // headers: {
      //   Accept: 'application/json',
      //   'Content-Type': 'application/json',
      // },
      data,
      // credentials: 'include',
      //   withCredentials: true,
    });
    //   .then((res) => {
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()}Updated successfully`);
      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500);
    }
    //   })
    //   .catch((error) => {
    //     showAlert('error', error.response.data.message);
    //   });
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};
