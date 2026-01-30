const makePost = (url, body, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg) => {
    // #region agent log
    fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makePost:before', message: 'POST request', data: { urlSnippet: url ? url.slice(-40) : 'empty', hasBody: !!body }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {});
    // #endregion
    fetch(url, {
        mode: 'cors',
        method: 'POST',
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Origin": "http://localhost:3000" },
        body: JSON.stringify(body)
    }).then(res => {
        // #region agent log
        fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makePost:res', message: 'POST response raw', data: { ok: res.ok, status: res.status, contentType: res.headers.get('content-type') }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'D' }) }).catch(() => {});
        // #endregion
        return res.json();
    })
        .then(res => {
            // #region agent log
            fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makePost:parsed', message: 'POST response parsed', data: { success: !!res.success, hasMsg: !!res.msg, error: res.error }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {});
            // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makePost:catch', message: 'POST failed', data: { errName: err.name, errMessage: err.message }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'D' }) }).catch(() => {});
            // #endregion
            console.log("An error occured: " + err.message)
            setToastMsg("An error occured")
            setSeverity("error")
            setOpen(true)
            setLoading(false)
        })
}


const makeGet = (url, setOpen, setSeverity, setToastMsg, setLoading, action, successMsg) => {
    // #region agent log
    fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makeGet:before', message: 'GET request', data: { urlSnippet: url ? url.slice(-50) : 'empty' }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {});
    // #endregion
    fetch(url, {
        method: "GET"
    }).then(res => {
        // #region agent log
        fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makeGet:res', message: 'GET response raw', data: { ok: res.ok, status: res.status }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'D' }) }).catch(() => {});
        // #endregion
        return res.json();
    })
        .then(res => {
            // #region agent log
            fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makeGet:parsed', message: 'GET response parsed', data: { success: !!res.success, error: res.error }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'E' }) }).catch(() => {});
            // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'requests.js:makeGet:catch', message: 'GET failed', data: { errMessage: err.message }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'D' }) }).catch(() => {});
            // #endregion
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