import axios from "axios";

// Environment-based configuration
const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";
const apiVersion = process.env.REACT_APP_API_VERSION || "/api/v1";

const instance = axios.create({
  baseURL: baseURL + apiVersion
});
instance.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "token"
    )}`;

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

export const Get = (endPoint, id, params) => {

  return new Promise((resolve, reject) => {
    instance
      .get(`${endPoint}${id ? "/" + id : ""}`, {
        params: { ...params },
      })
      .then((res) => {
        resolve(res.data);
        // if (res.data.Success) {
        // } else {
        //     reject(res.data)
        // }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        reject(err);
      });
  });
};
export const Post = (endPoint, body, id, headers) => {
  return new Promise((resolve, reject) => {
    instance
      .post(`${endPoint}${id ? "/" + id : ""}`, body, {
        headers: headers
          ? headers
          : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
      })
      .then((res) => {
        resolve(res.data);
        // if (res.data.Success) {
        // } else {
        //     reject(res.response.data ?? res.data)
        // }
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        reject(err);
      });
  });
};
export const Put = (endPoint, body, id) => {
  return new Promise((resolve, reject) => {
    instance
      .put(`${endPoint}${id ? "/" + id : ""}`, body)
      .then((res) => {
        if (res.data.success || res.data.user) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        reject(err);
      });
  });
};
export const Delete = (endPoint, id, params) => {
  return new Promise((resolve, reject) => {

    instance
      .delete(`${endPoint}${id ? "/" + id : ""}`, { data: params })
      .then((res) => {
        if (res.data.success || res.data.Success || res.status === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        reject(err);
      });
  });
};

export const ImageLink = baseURL + (process.env.REACT_APP_UPLOAD_PATH || "/uploads/")
