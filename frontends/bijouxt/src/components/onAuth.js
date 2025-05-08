import { useEffect } from "react";
import cookies from "../utilities/Cookies";
import { useNavigate } from "react-router-dom";

const OnAuth = ({ children }) => {
    const navigate = useNavigate();


    useEffect(() => {
        const token = cookies.getCookies('token');

        if (token === '' || token === undefined || token === null) {
            navigate('/');
        }
        //eslint-disable-next-line
    }, [children])
    return (
        <div className={`authenticate-layout`}>
            {children}
        </div>
    );
}

export default OnAuth;