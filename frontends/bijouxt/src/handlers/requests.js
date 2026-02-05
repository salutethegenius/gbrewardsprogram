const makePost = (url, body, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg, token) => {
    const headers = { "Content-Type": "application/json", "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(url, {
        mode: 'cors',
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    }).then(res => {
        return res.json();
    })
        .then(res => {
            if (res.success) {
                action(res)
                if(successMsg) {
                    setToastMsg(successMsg)
                    setSeverity("success")
                    setOpen(true)
                }
                setLoading(false)
            } else {
                if (res.error === "Access Denied")
                    navigate('/')

                setToastMsg(res.msg)
                setSeverity("error")
                setOpen(true)
                setLoading(false)
            }
        }).catch(err => {
            setToastMsg("An error occurred")
            setSeverity("error")
            setOpen(true)
            setLoading(false)
        })
}


const makeGet = (url, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg, token) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(url, {
        method: "GET",
        headers
    }).then(res => {
        return res.json();
    })
        .then(res => {
            if (res.success) {
                action(res)
                if(successMsg) {
                    setToastMsg(successMsg)
                    setSeverity("success")
                    setOpen(true)
                }
                setLoading(false)
            } else {
                if (res.error === "Unauthorised request")
                    navigate('/')
                setToastMsg(res.msg)
                setSeverity("error")
                setOpen(true)
                setLoading(false)
            }
        }).catch(err => {
            setToastMsg("An error occurred")
            setSeverity("error")
            setOpen(true)
            setLoading(false)
        })
}

function navigate(url) {
  window.location.href = url;
}

const makePut = (url, body, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg, token) => {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  fetch(url, {
    mode: 'cors',
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        action(res);
        if (successMsg) {
          setToastMsg(successMsg);
          setSeverity('success');
          setOpen(true);
        }
        setLoading(false);
      } else {
        setToastMsg(res.msg || res.error || 'Error');
        setSeverity('error');
        setOpen(true);
        setLoading(false);
      }
    })
    .catch((err) => {
      setToastMsg(err.message || 'An error occurred');
      setSeverity('error');
      setOpen(true);
      setLoading(false);
    });
};

const requests = { makePost, makeGet, makePut };
export default requests;
