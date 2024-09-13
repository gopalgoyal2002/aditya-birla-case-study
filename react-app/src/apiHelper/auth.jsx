export const login = (data) => {
  return fetch(`${process.env.REACT_APP_BASE_URL}/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: data.username,
      password: data.password,
      scope: "",
      client_id: "string",
      client_secret: "string",
    }),
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
