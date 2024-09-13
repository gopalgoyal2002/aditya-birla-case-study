export const search = (token, query, topk) => {
  return fetch(
    `${process.env.REACT_APP_BASE_URL}/search?query=${query}&topk=${topk}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
export const generativeSearch = (token, query, topk) => {
  return fetch(
    `${process.env.REACT_APP_BASE_URL}/generative-search?query=${query}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
