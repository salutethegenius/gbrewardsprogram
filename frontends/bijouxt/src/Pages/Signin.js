import { isMobile } from "react-device-detect";
import Flexbox from "../components/Flexbox";
import Header from "../components/Header";
import Toast from "../components/Toast";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import cookies from "../utilities/Cookies";
import { Container, IconButton } from "@mui/material";
import Spacebox from "../components/Spacebox";
import Button from "../components/Button";
import requests from "../handlers/requests";
import Company from "../utilities/Company";
import { useDispatch } from "react-redux";
import { updateuser } from "../features/users";
import { RemoveRedEye, VisibilityOff } from "@mui/icons-material";

const Signin = ({ title }) => {
    if (typeof document !== 'undefined' && document.querySelector('title')) document.querySelector('title').textContent = title;

    const { email } = useParams()

    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [msg, setToastMsg] = useState('');

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const submit = () => {
        if (input !== '') {

            setLoading(true)

            const url = `${process.env.REACT_APP_SERVER}api/signin?api_token=${process.env.REACT_APP_API_TOKEN}&sid=${Company.store_id}`

            requests.makePost(url, { email, password: input }, setOpen, setSeverity, setToastMsg, setLoading,
                (res) => {
                    cookies.setCookies('user', JSON.stringify(res.user), 5)
                    cookies.setCookies('token', res.token, 0.5)
                    dispatch(updateuser(res.user))
                    setTimeout(() => {
                        navigate('/dashboard')
                    }, 2000);
                },
                null
            )

        } else {
            setToastMsg("Invalid password")
            setSeverity("error")
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
        <div className="signin-page">
            <Header />
            <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
            <Container>
                <Flexbox justifyContent="flex-start" alignItems="center" style={{ height: isMobile ? '70vh' : '70vh' }}>
                    <div>
                        <Spacebox padding="0px 20px">
                            <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'Futstat-SemiBold' }}>Password</span>
                            <Flexbox alignItems="center">
                                {!isMobile && <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {!showPassword && <RemoveRedEye />}
                                    {showPassword && <VisibilityOff />}
                                </IconButton>}
                                {!isMobile && <Spacebox padding="5px" />}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="borderless-input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type here"
                                    style={{ fontSize: isMobile ? 50 : 70 }}
                                />
                                {isMobile && <Spacebox padding="5px" />}
                                {isMobile && <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {!showPassword && <RemoveRedEye style={{fontSize: 18, opacity: .7}}/>}
                                    {showPassword && <VisibilityOff style={{fontSize: 18, opacity: .7}}/>}
                                </IconButton>}
                            </Flexbox>
                            <Spacebox padding="10px" />
                            <Button className="bold" handleClick={() => submit()} style={{ background: 'var(--primary)', color: 'white', borderRadius: '100px', padding: '15px 40px', fontSize: 15 }}>
                                {loading ? "Please wait" : "Next"}
                            </Button>
                        </Spacebox>
                    </div>
                </Flexbox>
            </Container>
            <Footer />
        </div>
    );
}

export default Signin;