import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cookies from "../utilities/Cookies";
import Toast from "../components/Toast";
import Flexbox from "../components/Flexbox";
import Spacebox from "../components/Spacebox";
import { Container, Typography } from "@mui/material";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { isMobile } from "react-device-detect"
import requests from "../handlers/requests";
import Company from "../utilities/Company";
import Grid from "../components/Grid";

const Login = ({ title }) => {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;

    const [loading, setLoading] = useState(false)

    const [email, setEmail] = useState('')

    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [msg, setToastMsg] = useState('');

    const navigate = useNavigate()

    const submit = () => {
        if (email !== '' && email.includes('@')) {
            setLoading(true)
            const url = `${process.env.REACT_APP_SERVER}api/verify?api_token=${process.env.REACT_APP_API_TOKEN}&sid=${Company.store_id}`
            requests.makePost(url, { email }, setOpen, setSeverity, setToastMsg, setLoading,
                (res) => {
                    navigate(`${res.url}/${email}`)
                },
                null
            )
        } else {
            setToastMsg('Invalid email')
            setSeverity('error')
            setOpen(true)
        }
    }


    useEffect(() => {
        let token = cookies.getCookies('token')
        // 10 is a random number 
        if (token.length > 10) {
            navigate('/dashboard')
        }
        //eslint-disable-next-line
    }, [])

    return (
        <div>
            <div className="login-page">
                <Header />
                <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
                <Container>
                    <Flexbox justifyContent="center" alignItems="center" style={{ padding: isMobile ? '0px' : '20px' }}>
                        <div style={isMobile ? { textAlign: 'center', padding: '40px 20px', margin: '0px 10px', borderRadius: '20px' } : { textAlign: 'left' }} className={`mid ${isMobile && 'neumorphisim'}`}>
                            <Typography variant="h2" style={{ fontSize: isMobile ? 26 : 50 }}>
                                Shop and Earn Points
                            </Typography>
                            <Typography className="bold" style={{ fontSize: isMobile ? '16px' : '18px' }}>Earn points by shopping with {Company.name} and earn points for every dollar spent.</Typography>
                            <Spacebox padding="10px" />
                            <span>
                                Get started with your email
                            </span>
                            <Spacebox padding="10px" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address..."
                                className="borderless-input"
                                style={{ fontSize: isMobile ? '30px' : '50px' }}
                            />
                            <Spacebox padding="10px" />
                            <Button handleClick={() => submit()} style={{ color: 'white', background: 'var(--primary)', borderRadius: '100px', padding: '15px 40px' }}>
                                {loading ? "Please wait..." : "Get Started"}
                            </Button>
                            <Spacebox padding="5px" />
                            <small style={{ opacity: .5 }}>
                                By continuing, you agree with our terms and conditions
                            </small>
                        </div>
                        {!isMobile && <div>
                            <Grid grid="2" gap="10px" className="images-holder">
                                <div className="homepage-images">
                                    <img src="/assets/bg1.webp" alt="bg" />
                                    <img src="/assets/bg2.webp" alt="bg" />
                                    <img src="/assets/bg3.webp" alt="bg" />
                                    <img src="/assets/bg4.webp" alt="bg" />
                                    <img src="/assets/bg5.webp" alt="bg" />
                                    <img src="/assets/bg6.webp" alt="bg" />
                                </div>
                                <div className="homepage-images">
                                    <img src="/assets/bg6.webp" alt="bg" />
                                    <img src="/assets/bg5.webp" alt="bg" />
                                    <img src="/assets/bg4.webp" alt="bg" />
                                    <img src="/assets/bg3.webp" alt="bg" />
                                    <img src="/assets/bg2.webp" alt="bg" />
                                    <img src="/assets/bg1.webp" alt="bg" />
                                </div>
                            </Grid>
                        </div>}
                    </Flexbox>
                </Container>
            </div>
            <Footer />
        </div>
    );
}

export default Login;