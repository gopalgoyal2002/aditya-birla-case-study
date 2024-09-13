export const initiateUpload = (token, doclist) => {
  return fetch(`${process.env.REACT_APP_BASE_URL}/initiate-upload`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doclist),
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
export const uploadApi = (
  data,
  file_name,
  access_key,
  policy,
  signature,
  file
) => {
  const formdata = new FormData();
  formdata.append("key", file_name);
  formdata.append("AWSAccessKeyId", access_key);
  formdata.append("policy", policy);
  formdata.append("signature", signature);
  formdata.append("file", file.files[0], file_name);

  const requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };
  fetch("https://s3.amazonaws.com/rag.documents", requestOptions)
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
export const completeUpload = (token, doclist) => {
  return fetch(`${process.env.REACT_APP_BASE_URL}/complete-upload`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doclist),
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
export const getAllDocuments = (token) => {
  return fetch(`${process.env.REACT_APP_BASE_URL}/getalldocument`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
};
export const deleteDocuments = (token, file_name) => {
  return fetch(
    `${process.env.REACT_APP_BASE_URL}/delete-document?file_name=${file_name}`,
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
export const downlaodDocument = (token, doc_name) => {
  return fetch(
    `${process.env.REACT_APP_BASE_URL}/download-document?file_name=${doc_name}`,
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
