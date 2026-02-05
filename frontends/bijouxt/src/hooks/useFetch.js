import { useEffect, useState } from "react";

const useFetch = (url, token) => {

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortCont = new AbortController();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(url, {
            signal: abortCont.signal,
            headers
        })
        .then(res => res.json())
        .then(res => {
            if(res.success) {
                setData(res.data);
                setError(null);
                setIsLoading(false)
            }else {
                setError(res.msg || res.error || 'Request failed');
                setData(null);
                setIsLoading(false)
            }
        }).catch(err => {
            if (err.name === 'AbortError') {
                // Fetch aborted, ignore
            } else {
                setData(null);
                setIsLoading(false);
                setError('An error occurred');
            }
        })

        return () => abortCont.abort();
    }, [url, token])
    return {data, error, isLoading};
}
 
export default useFetch;