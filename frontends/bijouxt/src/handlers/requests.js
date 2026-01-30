const makePost = (url, body, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg) => {
    fetch(url, {
        mode: 'cors',
        method: 'POST',
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Origin": "http://localhost:3000" },
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

                console.log(res.error)
                setToastMsg(res.msg)
                setSeverity("error")
                setOpen(true)
                setLoading(false)
            }
        }).catch(err => {
            console.log("An error occured: " + err.message)
            setToastMsg("An error occured")
            setSeverity("error")
            setOpen(true)
            setLoading(false)
        })
}


const makeGet = (url, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg) => {
    fetch(url, {
        method: "GET"
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
                console.log(res.error)
                setToastMsg(res.msg)
                setSeverity("error")
                setOpen(true)
                setLoading(false)
            }
        }).catch(err => {
            console.log("An error occured: " + err.message)
            setToastMsg("An error occured")
            setSeverity("error")
            setOpen(true)
            setLoading(false)
        })
}

function navigate(url) {
  window.location.href = url;
}

const makePut = (url, body, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg) => {
  fetch(url, {
    mode: 'cors',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
