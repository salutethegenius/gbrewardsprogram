import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useEffect } from "react";
import cookies from "../utilities/Cookies";
import Footer from "./Footer";
import { isMobile } from "react-device-detect";
import { Container } from "@mui/material";

const Layout = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const token = cookies.getCookies('token');
        
        if (token === '' || token === undefined || token === null) {
            navigate('/');
        }
        //eslint-disable-next-line
    }, [])

    return (
        <div>
            <div className="layout">
                <Header />
                <Container style={{minHeight: isMobile ? '70vh' : '70vh'}}>
                    <Outlet />
                </Container>
                <Footer />
            </div>
        </div>
    );
}

export default Layout;